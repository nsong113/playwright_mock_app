import { useSetRecoilState } from "recoil";
import { eventLogsAtom } from "@/store";
import { EventLog, EventLogType, EventLogCategory } from "@/types";
import { useCallback } from "react";

export function useEventLogger() {
  const setLogs = useSetRecoilState(eventLogsAtom);

  const logEvent = useCallback(
    (
      type: EventLogType,
      category: EventLogCategory,
      message: string,
      details?: Record<string, unknown>
    ) => {
      const log: EventLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type,
        category,
        message,
        details,
      };

      setLogs((prev) => [...prev, log].slice(-100)); // 최대 100개만 유지
    },
    [setLogs]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, [setLogs]);

  return { logEvent, clearLogs };
}
