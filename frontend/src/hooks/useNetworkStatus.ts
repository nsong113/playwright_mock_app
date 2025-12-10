import { useRecoilState } from "recoil";
import { networkStatusAtom } from "@/store";
import { NetworkStatus } from "@/types";
import { useEffect, useRef } from "react";
import { useEventLogger } from "./useEventLogger";

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useRecoilState(networkStatusAtom);
  const originalFetch = useRef<typeof fetch | null>(null);
  const { logEvent } = useEventLogger();

  const updateNetworkStatus = (status: NetworkStatus) => {
    setNetworkStatus(status);
    logEvent("event", "network", `네트워크 상태 변경: ${status}`, { status });
  };

  useEffect(() => {
    if (networkStatus === "offline") {
      // Fetch를 오버라이드하여 모든 요청 실패 시뮬레이션
      originalFetch.current = window.fetch;
      window.fetch = () => {
        return Promise.reject(new Error("Network offline"));
      };
    } else if (networkStatus === "slow") {
      // Fetch를 오버라이드하여 지연 추가
      originalFetch.current = window.fetch;
      window.fetch = async (...args) => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 지연
        return originalFetch.current!(...args);
      };
    } else {
      // 원래 fetch 복원
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
        originalFetch.current = null;
      }
    }

    return () => {
      if (originalFetch.current && window.fetch !== originalFetch.current) {
        window.fetch = originalFetch.current;
      }
    };
  }, [networkStatus]);

  return {
    networkStatus,
    setNetworkStatus: updateNetworkStatus,
  };
}
