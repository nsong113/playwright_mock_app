import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { networkStatusAtom, robotStateAtom } from "@/store";
import { NetworkStatus } from "@/types";
import { useEffect, useRef } from "react";
import { useEventLogger } from "./useEventLogger";

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useRecoilState(networkStatusAtom);
  const robotState = useRecoilValue(robotStateAtom);
  const setRobotState = useSetRecoilState(robotStateAtom);
  // 원본 fetch를 항상 유지 (한 번만 저장)
  const originalFetch = useRef<typeof fetch | null>(null);
  const isOverridden = useRef(false);
  const { logEvent } = useEventLogger();
  // 이전 상태를 추적하여 중복 로그 방지
  const prevNetworkStatus = useRef<NetworkStatus>(networkStatus);
  const prevRobotState = useRef(robotState);

  const updateNetworkStatus = (status: NetworkStatus) => {
    const currentRobotState = prevRobotState.current;

    // 네트워크 상태 변경 이벤트 로그
    logEvent("event", "network", `네트워크 상태 변경: ${status}`, { status });

    // networkStatus 변경에 따른 robotState 변경 처리
    if (status === "offline" && currentRobotState !== "ERROR") {
      setRobotState("ERROR");
      logEvent(
        "state-change",
        "system",
        `상태 변경: ${currentRobotState} → ERROR (네트워크 오프라인)`,
        {
          from: currentRobotState,
          to: "ERROR",
          reason: "network_offline",
        }
      );
      prevRobotState.current = "ERROR";
    } else if (
      (status === "slow" || status === "online") &&
      currentRobotState === "ERROR"
    ) {
      setRobotState("IDLE");
      logEvent(
        "state-change",
        "system",
        "상태 변경: ERROR → IDLE (네트워크 복구)",
        {
          from: "ERROR",
          to: "IDLE",
          reason: "network_recovered",
        }
      );
      prevRobotState.current = "IDLE";
    }

    prevNetworkStatus.current = status;
    setNetworkStatus(status);
  };

  // networkStatus 변경에 따른 fetch override
  useEffect(() => {
    // 최초 한 번만 원본 fetch 저장
    if (originalFetch.current === null) {
      originalFetch.current = window.fetch.bind(window);
    }

    // 기존 override 제거
    if (isOverridden.current && originalFetch.current !== null) {
      window.fetch = originalFetch.current;
      isOverridden.current = false;
    }

    if (networkStatus === "offline") {
      // Fetch를 오버라이드하여 모든 요청 실패 시뮬레이션
      if (originalFetch.current !== null) {
        window.fetch = () => {
          return Promise.reject(new Error("Network offline"));
        };
        isOverridden.current = true;
      }
    } else if (networkStatus === "slow") {
      // Fetch를 오버라이드하여 지연 추가
      if (originalFetch.current !== null) {
        const original = originalFetch.current;
        window.fetch = async (...args) => {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 지연
          return original(...args);
        };
        isOverridden.current = true;
      }
    }

    return () => {
      // cleanup: 원본 fetch 복원
      if (isOverridden.current && originalFetch.current !== null) {
        window.fetch = originalFetch.current;
        isOverridden.current = false;
      }
    };
  }, [networkStatus]);

  // robotState가 외부에서 변경되었을 때 prevRobotState 업데이트 (별도 useEffect)
  useEffect(() => {
    prevRobotState.current = robotState;
  }, [robotState]);

  return {
    networkStatus,
    setNetworkStatus: updateNetworkStatus,
  };
}
