import { useSetRecoilState } from "recoil";
import {
  robotStateAtom,
  batteryLevelAtom,
  isChargingAtom,
  isStandbyModeAtom,
  currentLocationAtom,
  streamingTextAtom,
  isStreamingAtom,
  errorAtom,
  arrivalModalOpenAtom,
  seedConfigAtom,
} from "@/store";
import { useEventLogger } from "./useEventLogger";
import { useCallback } from "react";

export function useResetAndSeed() {
  const setRobotState = useSetRecoilState(robotStateAtom);
  const setBatteryLevel = useSetRecoilState(batteryLevelAtom);
  const setIsCharging = useSetRecoilState(isChargingAtom);
  const setIsStandbyMode = useSetRecoilState(isStandbyModeAtom);
  const setCurrentLocation = useSetRecoilState(currentLocationAtom);
  const setStreamingText = useSetRecoilState(streamingTextAtom);
  const setIsStreaming = useSetRecoilState(isStreamingAtom);
  const setError = useSetRecoilState(errorAtom);
  const setArrivalModalOpen = useSetRecoilState(arrivalModalOpenAtom);
  const setSeedConfig = useSetRecoilState(seedConfigAtom);
  const { logEvent, clearLogs } = useEventLogger();

  const reset = useCallback(() => {
    setRobotState("IDLE");
    setBatteryLevel(100);
    setIsCharging(false);
    setIsStandbyMode(false);
    setCurrentLocation(null);
    setStreamingText("");
    setIsStreaming(false);
    setError(null);
    setArrivalModalOpen(false);
    clearLogs();
    setSeedConfig(null);

    logEvent("event", "system", "System reset - 모든 상태 초기화");
  }, [
    setRobotState,
    setBatteryLevel,
    setIsCharging,
    setIsStandbyMode,
    setCurrentLocation,
    setStreamingText,
    setIsStreaming,
    setError,
    setArrivalModalOpen,
    clearLogs,
    setSeedConfig,
    logEvent,
  ]);

  const seed = useCallback(
    (seedValue: string) => {
      // 시드 기반 시나리오 재현
      setSeedConfig({ seed: seedValue, scenario: "default" });
      logEvent("event", "system", `시드 적용: ${seedValue}`, {
        seed: seedValue,
      });

      // 시드 기반 시나리오 실행 예시
      setTimeout(() => {
        setRobotState("MOVING");
        logEvent("state-change", "system", "상태 변경: IDLE → MOVING", {
          from: "IDLE",
          to: "MOVING",
        });

        setTimeout(() => {
          setRobotState("IDLE");
          setCurrentLocation("Location A");
          logEvent("event", "bridge", "도착: Location A", {
            location: "Location A",
          });
          logEvent("state-change", "system", "상태 변경: MOVING → IDLE", {
            from: "MOVING",
            to: "IDLE",
          });
        }, 3000);
      }, 500);
    },
    [setSeedConfig, setRobotState, setCurrentLocation, logEvent]
  );

  return { reset, seed };
}
