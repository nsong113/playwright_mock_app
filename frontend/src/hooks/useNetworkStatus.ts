import { useRecoilState } from "recoil";
import { networkStatusAtom } from "@/store";
import { NetworkStatus } from "@/types";
import { useEffect, useRef } from "react";
import { useEventLogger } from "./useEventLogger";

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useRecoilState(networkStatusAtom);
  // 원본 fetch를 항상 유지 (한 번만 저장)
  const originalFetch = useRef<typeof fetch | null>(null);
  const isOverridden = useRef(false);
  const { logEvent } = useEventLogger();

  const updateNetworkStatus = (status: NetworkStatus) => {
    setNetworkStatus(status);
    logEvent("event", "network", `네트워크 상태 변경: ${status}`, { status });
  };

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

  return {
    networkStatus,
    setNetworkStatus: updateNetworkStatus,
  };
}
