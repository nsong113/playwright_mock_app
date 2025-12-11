import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil";
import {
  robotStateAtom,
  batteryLevelAtom,
  isChargingAtom,
  currentLocationAtom,
  targetLocationAtom,
  errorAtom,
  arrivalModalOpenAtom,
  lowBatteryModalOpenAtom,
  lowBatteryModalShownAtom,
  criticalBatteryModalOpenAtom,
  movementTimeoutIdAtom,
  isEmergencyStoppedAtom,
} from "@/store";
import { useCallback, useEffect, useRef } from "react";
import { useEventLogger } from "./useEventLogger";

// Window 인터페이스 확장
declare global {
  interface Window {
    onArrival?: (
      location: string,
      position?: { x: number; y: number; yaw: number }
    ) => void;
    onBatteryUpdated?: (level: string) => void;
    onBatteryStatusChanged?: (isCharging: boolean, battery: number) => void;
    onError?: (code: string, message: string) => void;
  }
}

export function useMockBridge() {
  const [robotState, setRobotState] = useRecoilState(robotStateAtom);
  const [batteryLevel, setBatteryLevel] = useRecoilState(batteryLevelAtom);
  const isEmergencyStopped = useRecoilValue(isEmergencyStoppedAtom);
  const setIsCharging = useSetRecoilState(isChargingAtom);
  const setCurrentLocation = useSetRecoilState(currentLocationAtom);
  const setTargetLocation = useSetRecoilState(targetLocationAtom);
  const setError = useSetRecoilState(errorAtom);
  const setArrivalModalOpen = useSetRecoilState(arrivalModalOpenAtom);
  const [lowBatteryModalOpen, setLowBatteryModalOpen] = useRecoilState(
    lowBatteryModalOpenAtom
  );
  const [lowBatteryModalShown, setLowBatteryModalShown] = useRecoilState(
    lowBatteryModalShownAtom
  );
  const setCriticalBatteryModalOpen = useSetRecoilState(
    criticalBatteryModalOpenAtom
  );
  const setMovementTimeoutId = useSetRecoilState(movementTimeoutIdAtom);
  const { logEvent } = useEventLogger();

  // 배터리 모달이 이미 표시되었는지 추적 (중복 방지)
  const criticalBatteryModalShown = useRef(false);
  // 이전 배터리 레벨을 추적하여 실제 변경 시에만 모달을 열도록 함
  const prevBatteryLevel = useRef<number | null>(null);

  // Bridge 이벤트 리스너 설정
  useEffect(() => {
    window.onArrival = (location: string) => {
      console.log("[Mock Bridge] Arrival:", location);
      logEvent("event", "bridge", `도착: ${location}`, { location });
      setCurrentLocation(location);
      setTargetLocation(null); // 목적지 초기화
      // 도착 시 timeout 초기화
      setMovementTimeoutId((timeoutId) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        return null;
      });

      // Charging Station에 도착하고 실제로 MOVING 상태였을 때만 CHARGING 상태로 변경
      // (비상정지 후 재개하지 않았으면 IDLE 상태이므로 CHARGING으로 변경하지 않음)
      if (
        location === "Charging Station" &&
        robotState === "MOVING" &&
        !isEmergencyStopped
      ) {
        setRobotState("CHARGING");
        setIsCharging(true);
        logEvent("state-change", "system", "상태 변경: MOVING → CHARGING", {
          from: "MOVING",
          to: "CHARGING",
          location: "Charging Station",
        });
        logEvent("event", "bridge", "Charging Station 도착 - 충전 시작", {
          location: "Charging Station",
        });
      } else {
        setRobotState("IDLE");
      }
      // 도착 모달 열기
      setArrivalModalOpen(true);
    };

    window.onBatteryUpdated = (level: string) => {
      console.log("[Mock Bridge] Battery updated:", level);
      const battery = parseInt(level, 10);
      if (!isNaN(battery)) {
        logEvent("event", "bridge", `배터리 업데이트: ${battery}%`, {
          level: battery,
        });
        setBatteryLevel(battery);

        // 배터리 레벨에 따른 모달 표시
        // 10% 이하: 위험 모달 (한 번만 표시)
        if (
          battery <= 10 &&
          !criticalBatteryModalShown.current &&
          robotState !== "CHARGING" &&
          robotState !== "MOVING"
        ) {
          criticalBatteryModalShown.current = true;
          setCriticalBatteryModalOpen(true);
        }
        // 25% 이하: 경고 모달 (한 번만 표시, 10% 이상일 때만)
        else if (
          battery <= 25 &&
          battery > 10 &&
          !lowBatteryModalShown &&
          robotState !== "CHARGING" &&
          robotState !== "MOVING"
        ) {
          setLowBatteryModalShown(true);
          setLowBatteryModalOpen(true);
        }
        // 배터리가 다시 충분해지면 플래그 리셋
        if (battery > 25) {
          setLowBatteryModalShown(false);
          criticalBatteryModalShown.current = false;
        }
      }
    };

    window.onBatteryStatusChanged = (isCharging: boolean, battery: number) => {
      console.log("[Mock Bridge] Battery status changed:", {
        isCharging,
        battery,
      });
      logEvent(
        "event",
        "bridge",
        `배터리 상태 변경: ${
          isCharging ? "충전 중" : "충전 안 함"
        } (${battery}%)`,
        { isCharging, battery }
      );
      setIsCharging(isCharging);
      setBatteryLevel(battery);
      if (isCharging) {
        setRobotState("CHARGING");
      }
    };

    window.onError = (code: string, message: string) => {
      console.error("[Mock Bridge] Error:", { code, message });
      logEvent("event", "bridge", `에러: ${code} - ${message}`, {
        code,
        message,
      });
      setError({ code, message });
      setRobotState("ERROR");
    };

    return () => {
      // Cleanup
      window.onArrival = undefined;
      window.onBatteryUpdated = undefined;
      window.onBatteryStatusChanged = undefined;
      window.onError = undefined;
    };
  }, [
    setRobotState,
    setBatteryLevel,
    setIsCharging,
    setCurrentLocation,
    setTargetLocation,
    setError,
    setArrivalModalOpen,
    setLowBatteryModalOpen,
    lowBatteryModalShown,
    setLowBatteryModalShown,
    setCriticalBatteryModalOpen,
    setMovementTimeoutId,
    robotState,
    isEmergencyStopped,
    logEvent,
  ]);

  // 배터리 레벨이 변경될 때 모달 체크
  useEffect(() => {
    // 배터리 레벨이 실제로 변경되었는지 확인 (초기 렌더링이거나 모달을 닫은 직후 재실행 방지)
    const batteryLevelChanged =
      prevBatteryLevel.current !== null &&
      prevBatteryLevel.current !== batteryLevel;

    // 이전 배터리 레벨 업데이트
    prevBatteryLevel.current = batteryLevel;

    // 배터리 레벨이 실제로 변경되었을 때만 모달 체크
    if (!batteryLevelChanged) {
      return;
    }

    // 배터리 레벨에 따른 모달 표시
    // 10% 이하: 위험 모달 (한 번만 표시)
    if (
      batteryLevel <= 10 &&
      !criticalBatteryModalShown.current &&
      robotState !== "CHARGING" &&
      robotState !== "MOVING"
    ) {
      criticalBatteryModalShown.current = true;
      setCriticalBatteryModalOpen(true);
    }
    // 25% 이하: 경고 모달 (한 번만 표시, 10% 이상일 때만)
    else if (
      batteryLevel <= 25 &&
      batteryLevel > 10 &&
      !lowBatteryModalShown &&
      !lowBatteryModalOpen &&
      robotState !== "CHARGING" &&
      robotState !== "MOVING"
    ) {
      setLowBatteryModalShown(true);
      setLowBatteryModalOpen(true);
    }
    // 배터리가 다시 충분해지면 플래그 리셋
    if (batteryLevel > 25) {
      setLowBatteryModalShown(false);
      criticalBatteryModalShown.current = false;
    }
  }, [
    batteryLevel,
    robotState,
    lowBatteryModalShown,
    lowBatteryModalOpen,
    setLowBatteryModalShown,
    setLowBatteryModalOpen,
    setCriticalBatteryModalOpen,
  ]);

  // 수동으로 이벤트 트리거하는 함수들 (테스트/디버깅용)
  const triggerArrival = useCallback(
    (location: string, position?: { x: number; y: number; yaw: number }) => {
      // ERROR 상태에서 도착 이벤트를 트리거하면 IDLE로 변경
      if (robotState === "ERROR") {
        setRobotState("IDLE");
        logEvent(
          "state-change",
          "system",
          "상태 변경: ERROR → IDLE (도착 이벤트)",
          {
            from: "ERROR",
            to: "IDLE",
            reason: "arrival_event",
          }
        );
      }
      if (window.onArrival) {
        window.onArrival(location, position);
      }
    },
    [robotState, setRobotState, logEvent]
  );

  const triggerBatteryUpdate = useCallback(
    (level: number) => {
      // ERROR 상태에서 배터리 업데이트를 트리거하면 IDLE로 변경
      if (robotState === "ERROR") {
        setRobotState("IDLE");
        logEvent(
          "state-change",
          "system",
          "상태 변경: ERROR → IDLE (배터리 업데이트)",
          {
            from: "ERROR",
            to: "IDLE",
            reason: "battery_update",
          }
        );
      }
      if (window.onBatteryUpdated) {
        window.onBatteryUpdated(level.toString());
      }
    },
    [robotState, setRobotState, logEvent]
  );

  const triggerError = useCallback((code: string, message: string) => {
    if (window.onError) {
      window.onError(code, message);
    }
  }, []);

  return {
    triggerArrival,
    triggerBatteryUpdate,
    triggerError,
  };
}
