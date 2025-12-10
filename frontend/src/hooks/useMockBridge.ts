import { useRecoilState, useSetRecoilState } from "recoil";
import {
  robotStateAtom,
  batteryLevelAtom,
  isChargingAtom,
  isStandbyModeAtom,
  currentLocationAtom,
  targetLocationAtom,
  errorAtom,
  arrivalModalOpenAtom,
  lowBatteryModalOpenAtom,
  criticalBatteryModalOpenAtom,
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
    onStandbyModeUpdated?: (isStandby: boolean) => void;
    onError?: (code: string, message: string) => void;
  }
}

export function useMockBridge() {
  const [robotState, setRobotState] = useRecoilState(robotStateAtom);
  const [batteryLevel, setBatteryLevel] = useRecoilState(batteryLevelAtom);
  const setIsCharging = useSetRecoilState(isChargingAtom);
  const setIsStandbyMode = useRecoilState(isStandbyModeAtom)[1];
  const setCurrentLocation = useSetRecoilState(currentLocationAtom);
  const setTargetLocation = useSetRecoilState(targetLocationAtom);
  const setError = useSetRecoilState(errorAtom);
  const setArrivalModalOpen = useSetRecoilState(arrivalModalOpenAtom);
  const setLowBatteryModalOpen = useSetRecoilState(lowBatteryModalOpenAtom);
  const setCriticalBatteryModalOpen = useSetRecoilState(
    criticalBatteryModalOpenAtom
  );
  const { logEvent } = useEventLogger();

  // 배터리 모달이 이미 표시되었는지 추적 (중복 방지)
  const lowBatteryModalShown = useRef(false);
  const criticalBatteryModalShown = useRef(false);

  // 상태 변경 추적
  useEffect(() => {
    logEvent("state-change", "system", `상태: ${robotState}`, {
      state: robotState,
    });
  }, [robotState, logEvent]);

  // Bridge 이벤트 리스너 설정
  useEffect(() => {
    window.onArrival = (location: string) => {
      console.log("[Mock Bridge] Arrival:", location);
      logEvent("event", "bridge", `도착: ${location}`, { location });
      setCurrentLocation(location);
      setTargetLocation(null); // 목적지 초기화

      // Home Base에 도착하면 CHARGING 상태로 변경
      if (location === "Home Base") {
        setRobotState("CHARGING");
        setIsCharging(true);
        logEvent("state-change", "system", "상태 변경: MOVING → CHARGING", {
          from: "MOVING",
          to: "CHARGING",
          location: "Home Base",
        });
        logEvent("event", "bridge", "Home Base 도착 - 충전 시작", {
          location: "Home Base",
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
          !lowBatteryModalShown.current &&
          robotState !== "CHARGING" &&
          robotState !== "MOVING"
        ) {
          lowBatteryModalShown.current = true;
          setLowBatteryModalOpen(true);
        }
        // 배터리가 다시 충분해지면 플래그 리셋
        if (battery > 25) {
          lowBatteryModalShown.current = false;
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

    window.onStandbyModeUpdated = (isStandby: boolean) => {
      console.log("[Mock Bridge] Standby mode updated:", isStandby);
      logEvent(
        "event",
        "bridge",
        `대기 모드: ${isStandby ? "활성화" : "비활성화"}`,
        { isStandby }
      );
      setIsStandbyMode(isStandby);
      if (isStandby) {
        setRobotState("STANDBY");
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
      window.onStandbyModeUpdated = undefined;
      window.onError = undefined;
    };
  }, [
    setRobotState,
    setBatteryLevel,
    setIsCharging,
    setIsStandbyMode,
    setCurrentLocation,
    setTargetLocation,
    setError,
    setArrivalModalOpen,
    setLowBatteryModalOpen,
    setCriticalBatteryModalOpen,
    robotState,
    logEvent,
  ]);

  // 배터리 레벨이 변경될 때 모달 체크
  useEffect(() => {
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
      !lowBatteryModalShown.current &&
      robotState !== "CHARGING" &&
      robotState !== "MOVING"
    ) {
      lowBatteryModalShown.current = true;
      setLowBatteryModalOpen(true);
    }
    // 배터리가 다시 충분해지면 플래그 리셋
    if (batteryLevel > 25) {
      lowBatteryModalShown.current = false;
      criticalBatteryModalShown.current = false;
    }
  }, [
    batteryLevel,
    robotState,
    setLowBatteryModalOpen,
    setCriticalBatteryModalOpen,
  ]);

  // 수동으로 이벤트 트리거하는 함수들 (테스트/디버깅용)
  const triggerArrival = useCallback(
    (location: string, position?: { x: number; y: number; yaw: number }) => {
      if (window.onArrival) {
        window.onArrival(location, position);
      }
    },
    []
  );

  const triggerBatteryUpdate = useCallback((level: number) => {
    if (window.onBatteryUpdated) {
      window.onBatteryUpdated(level.toString());
    }
  }, []);

  const triggerStandbyMode = useCallback((isStandby: boolean) => {
    if (window.onStandbyModeUpdated) {
      window.onStandbyModeUpdated(isStandby);
    }
  }, []);

  const triggerError = useCallback((code: string, message: string) => {
    if (window.onError) {
      window.onError(code, message);
    }
  }, []);

  return {
    triggerArrival,
    triggerBatteryUpdate,
    triggerStandbyMode,
    triggerError,
  };
}
