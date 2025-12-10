import { useRecoilState, useSetRecoilState } from "recoil";
import {
  streamingTextAtom,
  isStreamingAtom,
  networkErrorModalOpenAtom,
} from "@/store";
import { SSEChunk } from "@/types";
import { useCallback, useRef } from "react";
import { useEventLogger } from "./useEventLogger";

type SSEMode = "normal" | "delay" | "missing" | "duplicate" | "error";

export function useMockSSE() {
  const [streamingText, setStreamingText] = useRecoilState(streamingTextAtom);
  const [isStreaming, setIsStreaming] = useRecoilState(isStreamingAtom);
  const abortControllerRef = useRef<AbortController | null>(null);
  const setNetworkErrorModalOpen = useSetRecoilState(networkErrorModalOpenAtom);
  const { logEvent } = useEventLogger();

  const startStream = useCallback(
    async (
      question: string = "안녕하세요! 로봇 안내 시스템입니다.",
      mode: SSEMode = "normal"
    ) => {
      // 기존 연결 종료
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setStreamingText("");
      setIsStreaming(true);
      setNetworkErrorModalOpen(false);

      logEvent("event", "sse", `스트림 시작: ${mode} 모드`, { mode, question });

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        console.log("[useMockSSE] Sending POST request to /api/suggestions", {
          question,
          mode,
        });

        const url = new URL("http://localhost:3001/api/suggestions");

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ question, mode }),
          signal: abortController.signal,
        });

        console.log("[useMockSSE] Response received", {
          status: response.status,
          ok: response.ok,
        });

        // 500 에러 처리
        if (!response.ok) {
          if (response.status === 500) {
            const errorData = await response.json().catch(() => ({}));
            logEvent("event", "network", "네트워크 오류 발생 (500)", {
              status: response.status,
              error: errorData,
            });
            setNetworkErrorModalOpen(true);
            setIsStreaming(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // SSE 스트림 읽기
        if (!response.body) {
          throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        logEvent("event", "sse", "스트림 연결 성공", {});
        console.log("[useMockSSE] Stream reader created, starting to read...");

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("[useMockSSE] SSE stream done");
            logEvent("event", "sse", "스트림 완료", {});
            setIsStreaming(false);
            break;
          }

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // 여러 SSE 메시지가 한 번에 올 수 있으므로 분리
            const messages = buffer.split("\n\n");
            buffer = messages.pop() || "";

            for (const message of messages) {
              if (!message.trim()) continue;

              // 주석 라인(`: `로 시작)은 무시
              if (message.trim().startsWith(": ")) {
                continue;
              }

              if (message.trim() && message.startsWith("data: ")) {
                const dataStr = message.slice(6).trim();
                try {
                  const data: SSEChunk = JSON.parse(dataStr);

                  if (data.error) {
                    console.error("[useMockSSE] SSE Error:", data.error);
                    logEvent("event", "sse", `스트림 에러: ${data.error}`, {
                      error: data.error,
                    });
                    setIsStreaming(false);
                    break;
                  }

                  if (data.done) {
                    console.log("[useMockSSE] SSE stream done (done flag)");
                    logEvent("event", "sse", "스트림 완료", {});
                    setIsStreaming(false);
                    break;
                  }

                  if (data.chunk) {
                    logEvent("event", "sse", `청크 수신: "${data.chunk}"`, {
                      chunk: data.chunk,
                      index: data.index,
                      duplicate: data.duplicate || false,
                    });
                    setStreamingText((prev) => {
                      const chunk = data.chunk!;
                      if (data.duplicate && prev.includes(chunk)) {
                        return prev;
                      }
                      return prev + chunk;
                    });
                  }
                } catch (parseError) {
                  console.error("Failed to parse SSE data:", parseError);
                  logEvent("event", "sse", `파싱 에러: ${String(parseError)}`, {
                    error: String(parseError),
                  });
                }
              }
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("[useMockSSE] Stream aborted by user");
          logEvent("event", "sse", "스트림 사용자 중단", {});
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        console.error("[useMockSSE] Stream error:", error);

        logEvent("event", "network", "스트림 연결 실패", {
          error: errorMessage,
        });
        setIsStreaming(false);
        setNetworkErrorModalOpen(true);
      }
    },
    [setStreamingText, setIsStreaming, setNetworkErrorModalOpen, logEvent]
  );

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
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
