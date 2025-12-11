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
  const chunkBufferRef = useRef<string[]>([]);
  const displayIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

      // 기존 interval 정리
      if (displayIntervalRef.current) {
        clearInterval(displayIntervalRef.current);
        displayIntervalRef.current = null;
      }
      chunkBufferRef.current = [];

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
        let isReading = true;

        while (isReading) {
          console.log("[useMockSSE] Calling reader.read()...");
          const readResult = await reader.read();
          console.log("[useMockSSE] reader.read() result:", {
            done: readResult.done,
            hasValue: !!readResult.value,
            valueLength: readResult.value?.length,
          });

          const { done, value } = readResult;

          if (done) {
            console.log("[useMockSSE] SSE stream done");
            logEvent("event", "sse", "스트림 완료", {});
            // 버퍼에 남은 청크가 모두 표시될 때까지 대기
            // interval이 버퍼를 비우면 자동으로 정리됨
            const checkBuffer = setInterval(() => {
              if (chunkBufferRef.current.length === 0) {
                clearInterval(checkBuffer);
                setIsStreaming(false);
              }
            }, 50);
            isReading = false;
            break;
          }

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            console.log(
              "[useMockSSE] Raw chunk received:",
              chunk.substring(0, 200)
            );
            buffer += chunk;

            // 여러 SSE 메시지가 한 번에 올 수 있으므로 분리
            const messages = buffer.split("\n\n");
            buffer = messages.pop() || "";

            console.log("[useMockSSE] Split into", messages.length, "messages");

            for (const message of messages) {
              if (!message.trim()) {
                console.log("[useMockSSE] Empty message, skipping");
                continue;
              }

              // 주석 라인(`: `로 시작)은 무시
              if (message.trim().startsWith(": ")) {
                console.log(
                  "[useMockSSE] Comment line, skipping:",
                  message.trim()
                );
                continue;
              }

              console.log(
                "[useMockSSE] Processing message:",
                message.substring(0, 300)
              );

              if (message.trim() && message.startsWith("data: ")) {
                const dataStr = message.slice(6).trim();
                console.log("[useMockSSE] Data string:", dataStr);
                try {
                  const data: SSEChunk = JSON.parse(dataStr);
                  console.log("[useMockSSE] Parsed data:", data);

                  if (data.error) {
                    console.error("[useMockSSE] SSE Error:", data.error);
                    logEvent("event", "sse", `스트림 에러: ${data.error}`, {
                      error: data.error,
                    });
                    if (displayIntervalRef.current) {
                      clearInterval(displayIntervalRef.current);
                      displayIntervalRef.current = null;
                    }
                    chunkBufferRef.current = [];
                    setIsStreaming(false);
                    break;
                  }

                  if (data.done) {
                    console.log("[useMockSSE] SSE stream done (done flag)");
                    logEvent("event", "sse", "스트림 완료", {});
                    // 버퍼에 남은 청크를 모두 표시한 후 스트리밍 종료
                    // interval이 자동으로 정리됨
                    break;
                  }

                  if (data.chunk) {
                    console.log("[useMockSSE] Chunk received:", data.chunk);
                    logEvent("event", "sse", `청크 수신: "${data.chunk}"`, {
                      chunk: data.chunk,
                      index: data.index,
                      duplicate: data.duplicate || false,
                    });

                    // 중복 체크
                    const chunk = data.chunk;
                    if (
                      data.duplicate &&
                      chunkBufferRef.current.includes(chunk)
                    ) {
                      console.log("[useMockSSE] Duplicate chunk ignored");
                      return;
                    }

                    // 버퍼에 저장
                    chunkBufferRef.current.push(chunk);

                    // 첫 번째 청크면 interval 시작
                    if (
                      chunkBufferRef.current.length === 1 &&
                      !displayIntervalRef.current
                    ) {
                      // mode에 따라 다른 간격 설정
                      const intervalMs = mode === "delay" ? 1000 : 10; // delay는 1초, 나머지는 10ms

                      displayIntervalRef.current = setInterval(() => {
                        if (chunkBufferRef.current.length > 0) {
                          const nextChunk = chunkBufferRef.current.shift()!;
                          setStreamingText((prev) => prev + nextChunk);
                        } else if (displayIntervalRef.current) {
                          clearInterval(displayIntervalRef.current);
                          displayIntervalRef.current = null;
                        }
                      }, intervalMs);
                    }
                  }
                } catch (parseError) {
                  console.error(
                    "[useMockSSE] Failed to parse SSE data:",
                    parseError,
                    "Raw:",
                    dataStr
                  );
                  logEvent("event", "sse", `파싱 에러: ${String(parseError)}`, {
                    error: String(parseError),
                  });
                }
              }
            }
          } else {
            console.warn("[useMockSSE] No value in read result");
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("[useMockSSE] Stream aborted by user");
          logEvent("event", "sse", "스트림 사용자 중단", {});
          if (displayIntervalRef.current) {
            clearInterval(displayIntervalRef.current);
            displayIntervalRef.current = null;
          }
          chunkBufferRef.current = [];
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        console.error("[useMockSSE] Stream error:", error);

        logEvent("event", "network", "스트림 연결 실패", {
          error: errorMessage,
        });
        if (displayIntervalRef.current) {
          clearInterval(displayIntervalRef.current);
          displayIntervalRef.current = null;
        }
        chunkBufferRef.current = [];
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
    if (displayIntervalRef.current) {
      clearInterval(displayIntervalRef.current);
      displayIntervalRef.current = null;
    }
    chunkBufferRef.current = [];
    setIsStreaming(false);
  }, [setIsStreaming]);

  return {
    startStream,
    stopStream,
    streamingText,
    isStreaming,
  };
}
