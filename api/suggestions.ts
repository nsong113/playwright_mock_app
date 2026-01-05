import type { VercelRequest, VercelResponse } from "@vercel/node";

// SSE 스트리밍 응답 헬퍼
function sendSSEChunk(res: VercelResponse, data: string): boolean {
  try {
    if (res.writableEnded || res.destroyed || !res.writable) {
      console.warn("[sendSSEChunk] Response ended/destroyed, skipping chunk");
      return false;
    }

    const chunk = `data: ${data}\n\n`;
    try {
      const written = res.write(chunk);

      if (typeof (res as any).flush === "function") {
        try {
          (res as any).flush();
        } catch (flushError) {
          // flush 에러는 무시
        }
      }

      return written;
    } catch (writeError) {
      console.error("[sendSSEChunk] Error during write:", writeError);
      return false;
    }
  } catch (error) {
    console.error("[sendSSEChunk] Error writing chunk:", error);
    return false;
  }
}

// 텍스트를 청크로 분할
function chunkText(text: string, chunkSize: number = 3): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

const suggestions = [
  {
    id: 1,
    text: "Physical AI에 대해서 설명해줘",
  },
  {
    id: 2,
    text: "여기서 제일 핫한 전시가 뭐야?",
  },
  {
    id: 3,
    text: "어떤 AI 모델을 가지고 있어?",
  },
];

// 질문별 답변 매핑 (10초 내 완료되도록 짧게 수정)
const questionAnswers: Record<string, string> = {
  "Physical AI에 대해서 설명해줘":
    "Physical AI는 물리적 공간에서 작동하는 인공지능 시스템입니다. 로봇, 드론, 자율주행 차량 등 실제 환경과 상호작용하며 지능적인 의사결정을 내리는 AI입니다.",
  "여기서 제일 핫한 전시가 뭐야?":
    "현재 가장 인기 있는 전시는 '미래의 로봇과 함께 살아가기' 전시입니다. 실제 작동하는 Physical AI 로봇들을 직접 체험할 수 있습니다.",
  "어떤 AI 모델을 가지고 있어?":
    "저는 GPT-4 기반의 대화형 AI 모델과 Vision Transformer 모델, 그리고 물리적 환경 이해를 위한 다중 모달 AI 모델을 탑재하고 있습니다.",
};

// GET /api/suggestions - 추천 질문 목록 반환
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    console.log("[Suggestions API GET] Returning suggestions list");
    return res.json({ suggestions });
  }

  if (req.method === "POST") {
    console.log("[Suggestions API POST] Request received", {
      body: req.body,
    });

    // 25% 확률로 500 에러 반환
    const shouldFail = Math.random() < 0.25;

    if (shouldFail) {
      console.log("[Suggestions API POST] Returning 500 error");
      return res.status(500).json({
        error: "Internal Server Error",
        message: "네트워크 오류가 발생했습니다",
      });
    }

    const { question, mode } = req.body;
    const streamMode = mode || "normal";

    // 질문에 대한 답변 찾기
    let answer: string | undefined;

    if (question && typeof question === "string") {
      answer = questionAnswers[question];
      if (!answer) {
        // 정확한 매칭이 없으면 질문 텍스트가 포함된 답변 찾기
        for (const [key, value] of Object.entries(questionAnswers)) {
          if (question.includes(key) || key.includes(question)) {
            answer = value;
            break;
          }
        }
      }
    }

    // 매칭되는 답변이 없으면 기본 답변 사용
    const message =
      answer || "안녕하세요! 로봇 안내 시스템입니다. 어떤 도움이 필요하신가요?";

    const chunks = chunkText(message);

    console.log("[Suggestions API POST] Starting SSE stream", {
      question,
      answer: answer ? "found" : "default",
      mode: streamMode,
      chunksCount: chunks.length,
    });

    // SSE 헤더 설정
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "X-Accel-Buffering": "no",
    });

    console.log("[Suggestions API POST] SSE headers sent, starting stream");

    // 초기 메시지 전송
    res.write(": connection established\n\n");
    res.write(": stream started\n\n");

    if (typeof (res as any).flush === "function") {
      (res as any).flush();
    }

    let isStreamingActive = true;

    req.on("close", () => {
      console.log("[Suggestions API POST] Client connection closed");
      isStreamingActive = false;
    });

    req.on("error", (error) => {
      console.error("[Suggestions API POST] Request error:", error);
      isStreamingActive = false;
    });

    res.on("close", () => {
      console.log("[Suggestions API POST] Response connection closed");
      isStreamingActive = false;
    });

    res.on("error", (error) => {
      console.error("[Suggestions API POST] Response error:", error);
      isStreamingActive = false;
    });

    // 비동기로 스트리밍 처리
    (async () => {
      switch (streamMode) {
        case "normal": {
          // 정상 스트리밍 - 100ms 간격으로 전송
          for (let i = 0; i < chunks.length; i++) {
            if (!isStreamingActive || res.writableEnded || res.destroyed) {
              break;
            }

            sendSSEChunk(
              res,
              JSON.stringify({
                chunk: chunks[i],
                index: i,
              })
            );

            if (typeof (res as any).flush === "function") {
              try {
                (res as any).flush();
              } catch (e) {
                // flush 에러 무시
              }
            }

            // 100ms 대기 (10초 내 완료를 위해)
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          try {
            sendSSEChunk(res, JSON.stringify({ done: true }));
            if (!res.writableEnded && !res.destroyed) {
              res.end();
            }
          } catch (error) {
            console.error("[normal mode] Error ending stream:", error);
          }
          break;
        }

        case "delay": {
          // 지연 모드: 1초 간격으로 전송
          for (let i = 0; i < chunks.length; i++) {
            if (!isStreamingActive || res.writableEnded || res.destroyed) {
              break;
            }
            sendSSEChunk(res, JSON.stringify({ chunk: chunks[i], index: i }));
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          sendSSEChunk(res, JSON.stringify({ done: true }));
          if (!res.writableEnded && !res.destroyed) {
            res.end();
          }
          break;
        }

        case "missing": {
          // 누락 모드: 일부 청크 건너뛰기
          for (let i = 0; i < chunks.length; i++) {
            if (!isStreamingActive || res.writableEnded || res.destroyed) {
              break;
            }
            // 3번째, 5번째 청크 건너뛰기
            if (i !== 2 && i !== 4) {
              sendSSEChunk(res, JSON.stringify({ chunk: chunks[i], index: i }));
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          sendSSEChunk(res, JSON.stringify({ done: true }));
          if (!res.writableEnded && !res.destroyed) {
            res.end();
          }
          break;
        }

        case "duplicate": {
          // 중복 모드: 일부 청크 중복 전송
          for (let i = 0; i < chunks.length; i++) {
            if (!isStreamingActive || res.writableEnded || res.destroyed) {
              break;
            }
            sendSSEChunk(res, JSON.stringify({ chunk: chunks[i], index: i }));
            // 2번째 청크를 중복 전송
            if (i === 1) {
              await new Promise((resolve) => setTimeout(resolve, 50));
              sendSSEChunk(
                res,
                JSON.stringify({ chunk: chunks[i], index: i, duplicate: true })
              );
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          sendSSEChunk(res, JSON.stringify({ done: true }));
          if (!res.writableEnded && !res.destroyed) {
            res.end();
          }
          break;
        }

        case "error": {
          // 에러 모드: 중간에 연결 끊김
          for (let i = 0; i < chunks.length; i++) {
            if (!isStreamingActive || res.writableEnded || res.destroyed) {
              break;
            }
            if (i === Math.floor(chunks.length / 2)) {
              // 중간에 에러 발생
              sendSSEChunk(res, JSON.stringify({ error: "Connection lost" }));
              if (!res.writableEnded && !res.destroyed) {
                res.end();
              }
              return;
            }
            sendSSEChunk(res, JSON.stringify({ chunk: chunks[i], index: i }));
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          sendSSEChunk(res, JSON.stringify({ done: true }));
          if (!res.writableEnded && !res.destroyed) {
            res.end();
          }
          break;
        }

        default:
          res.status(400).json({ error: "Invalid mode" });
      }
    })();

    // Vercel에서는 함수가 종료되지 않도록 keep-alive
    return;
  }

  return res.status(405).json({ error: "Method not allowed" });
}
