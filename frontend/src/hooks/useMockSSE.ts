import { useRecoilState, useSetRecoilState } from "recoil";
import {
  streamingTextAtom,
  isStreamingAtom,
  networkErrorModalOpenAtom,
} from "@/store";
import { SSEChunk, SSEMode } from "@/types";
import { useCallback, useRef } from "react";
import { useEventLogger } from "./useEventLogger";
import { API_ENDPOINTS } from "@/utils/constants";
import { clearIntervalSafely } from "@/utils/timeout";

export function useMockSSE() {
  const [streamingText, setStreamingText] = useRecoilState(streamingTextAtom);
  const [isStreaming, setIsStreaming] = useRecoilState(isStreamingAtom);
  const abortControllerRef = useRef<AbortController | null>(null);
  const setNetworkErrorModalOpen = useSetRecoilState(networkErrorModalOpenAtom);
  const { logEvent } = useEventLogger();
  const chunkBufferRef = useRef<
    Array<{ chunk: string; index: number; duplicate: boolean }>
  >([]);
  const displayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isReadingRef = useRef<boolean>(false);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null
  );
  const shouldDisplayRef = useRef<boolean>(true);

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
      clearIntervalSafely(displayIntervalRef.current);
      displayIntervalRef.current = null;
      chunkBufferRef.current = [];
      shouldDisplayRef.current = true;

      logEvent("event", "sse", `스트림 시작: ${mode} 모드`, { mode, question });

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const response = await fetch(API_ENDPOINTS.SUGGESTIONS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({ question, mode }),
          signal: abortController.signal,
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
        readerRef.current = reader;
        const decoder = new TextDecoder("utf-8");

        logEvent("event", "sse", "스트림 연결 성공", {});

        let buffer = "";
        isReadingRef.current = true;

        while (isReadingRef.current) {
          // 중단 플래그 체크
          if (!isReadingRef.current || !shouldDisplayRef.current) {
            break;
          }

          const readResult = await reader.read();
          const { done, value } = readResult;

          if (done) {
            logEvent("event", "sse", "스트림 완료", {});
            // 버퍼에 남은 청크가 모두 표시될 때까지 대기
            // interval이 버퍼를 비우면 자동으로 정리됨
            const checkBuffer = setInterval(() => {
              if (chunkBufferRef.current.length === 0) {
                clearInterval(checkBuffer);
                setIsStreaming(false);
              }
            }, 50);
            isReadingRef.current = false;
            try {
              reader.releaseLock();
            } catch (e) {
              // 이미 해제되었을 수 있음
            }
            readerRef.current = null;
            break;
          }

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // 여러 SSE 메시지가 한 번에 올 수 있으므로 분리
            const messages = buffer.split("\n\n");
            buffer = messages.pop() || "";

            for (const message of messages) {
              if (!message.trim()) {
                continue;
              }

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
                    isReadingRef.current = false;
                    clearIntervalSafely(displayIntervalRef.current);
                    displayIntervalRef.current = null;
                    chunkBufferRef.current = [];
                    setIsStreaming(false);
                    break;
                  }

                  if (data.done) {
                    logEvent("event", "sse", "스트림 완료", {});
                    // 버퍼에 남은 청크를 모두 표시한 후 스트리밍 종료
                    // interval이 자동으로 정리됨
                    isReadingRef.current = false;
                    break;
                  }

                  if (data.chunk) {
                    // 중단 플래그 체크
                    if (!isReadingRef.current || !shouldDisplayRef.current) {
                      break;
                    }

                    // 중복 체크
                    const chunk = data.chunk;
                    if (
                      data.duplicate &&
                      chunkBufferRef.current.some(
                        (item) => item.chunk === chunk
                      )
                    ) {
                      continue;
                    }

                    // 버퍼에 청크와 메타데이터 함께 저장 (표시 시 로그에 사용)
                    chunkBufferRef.current.push({
                      chunk,
                      index: data.index ?? 0,
                      duplicate: data.duplicate || false,
                    });

                    // 첫 번째 청크면 interval 시작
                    if (
                      chunkBufferRef.current.length === 1 &&
                      !displayIntervalRef.current
                    ) {
                      // mode에 따라 다른 간격 설정
                      const intervalMs = mode === "delay" ? 1000 : 10; // delay는 1초, 나머지는 10ms

                      displayIntervalRef.current = setInterval(() => {
                        // 중지되었는지 확인 (매번 체크)
                        if (!shouldDisplayRef.current) {
                          clearIntervalSafely(displayIntervalRef.current);
                          displayIntervalRef.current = null;
                          return;
                        }

                        if (chunkBufferRef.current.length > 0) {
                          // 다시 한 번 체크 (버퍼에서 꺼내기 전)
                          if (!shouldDisplayRef.current) {
                            clearIntervalSafely(displayIntervalRef.current);
                            displayIntervalRef.current = null;
                            return;
                          }
                          const nextItem = chunkBufferRef.current.shift()!;
                          // 상태 업데이트 전 마지막 체크
                          if (shouldDisplayRef.current) {
                            // 실제 화면에 표시될 때 로그 추가
                            logEvent(
                              "event",
                              "sse",
                              `청크 표시: "${nextItem.chunk}"`,
                              {
                                chunk: nextItem.chunk,
                                index: nextItem.index,
                                duplicate: nextItem.duplicate,
                              }
                            );

                            setStreamingText((prev) => {
                              // 함수형 업데이트 내부에서도 체크
                              if (!shouldDisplayRef.current) {
                                return prev; // 업데이트 안 함
                              }
                              return prev + nextItem.chunk;
                            });
                          }
                        } else {
                          clearIntervalSafely(displayIntervalRef.current);
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
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          logEvent("event", "sse", "스트림 사용자 중단", {});
          isReadingRef.current = false;
          if (readerRef.current) {
            try {
              readerRef.current.releaseLock();
            } catch (e) {
              // 이미 해제되었을 수 있음
            }
            readerRef.current = null;
          }
          clearIntervalSafely(displayIntervalRef.current);
          displayIntervalRef.current = null;
          chunkBufferRef.current = [];
          setIsStreaming(false);
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        console.error("[useMockSSE] Stream error:", error);

        logEvent("event", "network", "스트림 연결 실패", {
          error: errorMessage,
        });
        clearIntervalSafely(displayIntervalRef.current);
        displayIntervalRef.current = null;
        chunkBufferRef.current = [];
        setIsStreaming(false);
        setNetworkErrorModalOpen(true);
      }
    },
    [setStreamingText, setIsStreaming, setNetworkErrorModalOpen, logEvent]
  );

  const stopStream = useCallback(() => {
    // 1. 표시 중단 플래그를 먼저 설정 (가장 중요!)
    shouldDisplayRef.current = false;

    // 2. 읽기 루프 중단 (데이터 수신도 즉시 중단)
    isReadingRef.current = false;

    // 3. abort controller로 요청 취소 (reader.read()에서 예외 발생시켜 루프 빠져나가게)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 4. display interval 정리 (즉시)
    clearIntervalSafely(displayIntervalRef.current);
    displayIntervalRef.current = null;

    // 5. 버퍼 비우기 (이미 interval이 정리되었으므로 안전)
    chunkBufferRef.current = [];

    // 6. reader 해제
    if (readerRef.current) {
      try {
        readerRef.current.releaseLock();
      } catch (e) {
        // 이미 해제되었을 수 있음
      }
      readerRef.current = null;
    }

    // 7. 스트리밍 상태 해제 및 텍스트 고정
    setIsStreaming(false);
    // 현재 텍스트를 고정 (추가 업데이트 방지)
    setStreamingText((prev) => prev);
  }, [setIsStreaming, setStreamingText]);

  return {
    startStream,
    stopStream,
    streamingText,
    isStreaming,
  };
}
