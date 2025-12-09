import { useRecoilState } from "recoil";
import { streamingTextAtom, isStreamingAtom } from "@/store";
import { SSEChunk } from "@/types";
import { useCallback, useRef } from "react";

type SSEMode = "normal" | "delay" | "missing" | "duplicate" | "error";

export function useMockSSE() {
  const [streamingText, setStreamingText] = useRecoilState(streamingTextAtom);
  const [isStreaming, setIsStreaming] = useRecoilState(isStreamingAtom);
  const eventSourceRef = useRef<EventSource | null>(null);

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

      const url = `/api/stream/chat?mode=${mode}&message=${encodeURIComponent(
        message
      )}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data: SSEChunk = JSON.parse(event.data);

          if (data.error) {
            console.error("SSE Error:", data.error);
            setIsStreaming(false);
            eventSource.close();
            return;
          }

          if (data.done) {
            setIsStreaming(false);
            eventSource.close();
            return;
          }

          if (data.chunk) {
            setStreamingText((prev) => {
              // 중복 방지 (duplicate 모드 테스트용)
              const chunk = data.chunk!;
              if (data.duplicate && prev.includes(chunk)) {
                return prev;
              }
              return prev + chunk;
            });
          }
        } catch (error) {
          console.error("Failed to parse SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        setIsStreaming(false);
        eventSource.close();
      };
    },
    [setStreamingText, setIsStreaming]
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
