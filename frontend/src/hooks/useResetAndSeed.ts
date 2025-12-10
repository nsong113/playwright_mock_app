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

// 시드 기반 결정론적 난수 생성기
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // 시드 문자열을 숫자로 변환
    this.seed = seed
      .split("")
      .reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
  }

  // 0 ~ 1 사이의 난수 생성
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // min ~ max 사이의 정수 생성
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

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
      // 먼저 초기화
      reset();

      // 시드 기반 시나리오 재현
      setSeedConfig({ seed: seedValue, scenario: "default" });
      logEvent("event", "system", `시드 적용: ${seedValue}`, {
        seed: seedValue,
        scenario: "시드 기반 결정론적 시나리오 시작",
      });

      const random = new SeededRandom(seedValue);
      const locations = ["Location A", "Location B", "Location C", "Home Base"];

      // 시드 기반 결정:
      // 1. 이동할 위치
      const targetLocation = locations[random.nextInt(0, locations.length - 1)];

      // 2. 초기 배터리 레벨 (50-100)
      const initialBattery = random.nextInt(50, 100);
      setBatteryLevel(initialBattery);
      logEvent("event", "bridge", `초기 배터리 설정: ${initialBattery}%`, {
        level: initialBattery,
      });

      // 3. 배터리 경고 발생 여부 (20% 확률)
      const willBatteryWarning = random.next() < 0.2;
      let warningBattery = 0;
      if (willBatteryWarning) {
        warningBattery = random.nextInt(5, 25); // 5-25% 사이
      }

      // 4. 에러 발생 여부 (15% 확률)
      const willError = random.next() < 0.15;
      const errorTypes = [
        { code: "NETWORK_ERROR", message: "Connection failed" },
        { code: "MOTOR_ERROR", message: "Motor malfunction detected" },
        { code: "SENSOR_ERROR", message: "Sensor calibration failed" },
      ];
      const errorType = errorTypes[random.nextInt(0, errorTypes.length - 1)];

      // 5. 대기 모드 활성화 여부 (10% 확률)
      const willStandby = random.next() < 0.1;

      // 시나리오 실행
      let stepDelay = 500;

      // Step 1: 이동 시작
      setTimeout(() => {
        setRobotState("MOVING");
        logEvent("event", "bridge", `이동 시작: ${targetLocation}`, {
          location: targetLocation,
        });
        logEvent("state-change", "system", "상태 변경: IDLE → MOVING", {
          from: "IDLE",
          to: "MOVING",
        });
      }, stepDelay);
      stepDelay += 3000;

      // Step 2: 배터리 경고 (이동 중)
      if (willBatteryWarning) {
        setTimeout(() => {
          setBatteryLevel(warningBattery);
          if (window.onBatteryUpdated) {
            window.onBatteryUpdated(warningBattery.toString());
          }
          logEvent("event", "bridge", `배터리 경고: ${warningBattery}%`, {
            level: warningBattery,
            warning: true,
          });
        }, stepDelay - 1500); // 이동 중에 발생
      }

      // Step 3: 도착 또는 에러
      setTimeout(() => {
        if (willError && random.next() < 0.5) {
          // 에러 발생
          setRobotState("ERROR");
          setError(errorType);
          if (window.onError) {
            window.onError(errorType.code, errorType.message);
          }
          logEvent("event", "bridge", `에러 발생: ${errorType.code}`, {
            code: errorType.code,
            message: errorType.message,
          });
          logEvent("state-change", "system", "상태 변경: MOVING → ERROR", {
            from: "MOVING",
            to: "ERROR",
          });
        } else {
          // 정상 도착
          setRobotState("IDLE");
          setCurrentLocation(targetLocation);
          if (window.onArrival) {
            window.onArrival(targetLocation);
          }
          logEvent("event", "bridge", `도착: ${targetLocation}`, {
            location: targetLocation,
          });
          logEvent("state-change", "system", "상태 변경: MOVING → IDLE", {
            from: "MOVING",
            to: "IDLE",
          });

          // Step 4: 대기 모드 (도착 후)
          if (willStandby) {
            setTimeout(() => {
              setIsStandbyMode(true);
              if (window.onStandbyModeUpdated) {
                window.onStandbyModeUpdated(true);
              }
              logEvent("event", "bridge", "대기 모드 활성화", {
                isStandby: true,
              });
            }, 1000);
          }
        }
      }, stepDelay);
    },
    [
      reset,
      setSeedConfig,
      setRobotState,
      setCurrentLocation,
      setBatteryLevel,
      setIsStandbyMode,
      setError,
      logEvent,
    ]
  );

  return { reset, seed };
}
