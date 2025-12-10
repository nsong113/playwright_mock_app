import { useRecoilState, useSetRecoilState } from "recoil";
import {
  robotStateAtom,
  batteryLevelAtom,
  isChargingAtom,
  isStandbyModeAtom,
  currentLocationAtom,
  errorAtom,
  arrivalModalOpenAtom,
} from "@/store";
import { useCallback, useEffect } from "react";

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
  const [, setRobotState] = useRecoilState(robotStateAtom);
  const setBatteryLevel = useSetRecoilState(batteryLevelAtom);
  const setIsCharging = useSetRecoilState(isChargingAtom);
  const setIsStandbyMode = useRecoilState(isStandbyModeAtom)[1];
  const setCurrentLocation = useSetRecoilState(currentLocationAtom);
  const setError = useSetRecoilState(errorAtom);
  const setArrivalModalOpen = useSetRecoilState(arrivalModalOpenAtom);

  // Bridge 이벤트 리스너 설정
  useEffect(() => {
    window.onArrival = (location: string) => {
      console.log("[Mock Bridge] Arrival:", location);
      setCurrentLocation(location);
      setRobotState("IDLE");
      // 도착 모달 열기
      setArrivalModalOpen(true);
    };

    window.onBatteryUpdated = (level: string) => {
      console.log("[Mock Bridge] Battery updated:", level);
      const battery = parseInt(level, 10);
      if (!isNaN(battery)) {
        setBatteryLevel(battery);
      }
    };

    window.onBatteryStatusChanged = (isCharging: boolean, battery: number) => {
      console.log("[Mock Bridge] Battery status changed:", {
        isCharging,
        battery,
      });
      setIsCharging(isCharging);
      setBatteryLevel(battery);
      if (isCharging) {
        setRobotState("CHARGING");
      }
    };

    window.onStandbyModeUpdated = (isStandby: boolean) => {
      console.log("[Mock Bridge] Standby mode updated:", isStandby);
      setIsStandbyMode(isStandby);
      if (isStandby) {
        setRobotState("STANDBY");
      }
    };

    window.onError = (code: string, message: string) => {
      console.error("[Mock Bridge] Error:", { code, message });
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
    setError,
    setArrivalModalOpen,
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
