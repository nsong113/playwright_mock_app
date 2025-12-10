import { useRecoilState } from "recoil";
import { streamingTextAtom, isStreamingAtom } from "@/store";
import { SSEChunk } from "@/types";
import { useCallback, useRef } from "react";
import { useEventLogger } from "./useEventLogger";

type SSEMode = "normal" | "delay" | "missing" | "duplicate" | "error";

export function useMockSSE() {
  const [streamingText, setStreamingText] = useRecoilState(streamingTextAtom);
  const [isStreaming, setIsStreaming] = useRecoilState(isStreamingAtom);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { logEvent } = useEventLogger();

  const startStream = useCallback(
    (
      message: string = "Hello! This is a streaming response.",
      mode: SSEMode = "normal"
    ) => {
      // 기존 연결 종료
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setStreamingText("");
      setIsStreaming(true);

      logEvent("event", "sse", `스트림 시작: ${mode} 모드`, { mode, message });

      // EventSource는 브라우저 네이티브 API라 Vite 프록시를 거치지 않음
      // 따라서 전체 URL을 사용해야 함
      const url = `http://localhost:3001/api/stream/chat?mode=${mode}&message=${encodeURIComponent(
        message
      )}`;

      console.log("Connecting to SSE endpoint:", url);
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      // 연결 성공 시
      eventSource.onopen = () => {
        console.log("SSE connection opened");
        logEvent("event", "sse", "스트림 연결 성공", {});
      };

      eventSource.onmessage = (event) => {
        console.log("SSE message received:", event.data);
        try {
          const data: SSEChunk = JSON.parse(event.data);
          console.log("Parsed SSE data:", data);

          if (data.error) {
            console.error("SSE Error:", data.error);
            logEvent("event", "sse", `스트림 에러: ${data.error}`, {
              error: data.error,
            });
            setIsStreaming(false);
            eventSource.close();
            return;
          }

          if (data.done) {
            console.log("SSE stream done");
            logEvent("event", "sse", "스트림 완료", {});
            setIsStreaming(false);
            eventSource.close();
            return;
          }

          if (data.chunk) {
            console.log("SSE chunk received:", data.chunk);
            // 청크 수신 로그 (실제 백엔드 데이터 - 포스트맨처럼 표시)
            logEvent("event", "sse", `청크 수신: "${data.chunk}"`, {
              chunk: data.chunk,
              index: data.index,
              duplicate: data.duplicate || false,
            });
            setStreamingText((prev) => {
              // 중복 방지 (duplicate 모드 테스트용)
              const chunk = data.chunk!;
              if (data.duplicate && prev.includes(chunk)) {
                console.log("Duplicate chunk ignored:", chunk);
                return prev;
              }
              const newText = prev + chunk;
              console.log("Updated streaming text:", newText);
              return newText;
            });
          } else {
            console.warn("SSE message received but no chunk field:", data);
          }
        } catch (error) {
          console.error(
            "Failed to parse SSE data:",
            error,
            "Raw data:",
            event.data
          );
          logEvent("event", "sse", `파싱 에러: ${String(error)}`, {
            error: String(error),
            rawData: event.data,
          });
        }
      };

      let errorLogged = false;

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        console.error("EventSource readyState:", eventSource.readyState);
        console.error("EventSource URL:", eventSource.url);

        // EventSource는 연결이 끊겼을 때 onerror를 여러 번 호출할 수 있음
        // 첫 번째 에러만 로깅
        if (errorLogged) return;

        if (eventSource.readyState === EventSource.CLOSED) {
          if (!errorLogged) {
            errorLogged = true;
            logEvent("event", "sse", "스트림 연결 종료", {
              reason: "Connection closed",
            });
            setIsStreaming(false);
            eventSource.close();
          }
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          // 연결 중 에러 - 서버 연결 실패 가능성
          if (!errorLogged) {
            errorLogged = true;
            logEvent("event", "sse", "스트림 연결 실패 (404)", {
              reason: `Failed to connect to ${eventSource.url}. Make sure mock-server is running on port 3001 and the endpoint /api/stream/chat exists.`,
            });
            setIsStreaming(false);
            eventSource.close();
          }
        }
      };
    },
    [setStreamingText, setIsStreaming, logEvent]
  );

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  }, [setIsStreaming]);

  return {
    startStream,
    stopStream,
    streamingText,
    isStreaming,
  };
}
