import { Router, Request, Response } from "express";

const router = Router();

// SSE 스트리밍 응답 헬퍼
function sendSSEChunk(res: Response, data: string) {
  try {
    // 응답이 이미 종료되었거나 파괴되었는지 확인
    if (res.writableEnded || res.destroyed || !res.writable) {
      console.warn("[sendSSEChunk] Response ended/destroyed, skipping chunk");
      return false;
    }

    const chunk = `data: ${data}\n\n`;

    // 에러 처리를 위해 try-catch로 감싸기
    try {
      const written = res.write(chunk);

      // Express가 버퍼링하지 않도록 flush 시도
      if (typeof (res as any).flush === "function") {
        try {
          (res as any).flush();
        } catch (flushError) {
          // flush 에러는 무시 (일부 환경에서 지원하지 않을 수 있음)
        }
      }

      // 버퍼가 가득 차면 drain 이벤트를 기다림
      if (!written) {
        res.once("drain", () => {
          console.log("[sendSSEChunk] Drain event - buffer cleared");
        });
      }

      return written;
    } catch (writeError) {
      console.error("[sendSSEChunk] Error during write:", writeError);
      throw writeError; // 상위로 에러 전달
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

// 질문별 답변 매핑
const questionAnswers: Record<string, string> = {
  "Physical AI에 대해서 설명해줘":
    "Physical AI는 물리적 공간에서 작동하는 인공지능 시스템입니다. 로봇, 드론, 자율주행 차량 등 실제 환경과 상호작용하며 지능적인 의사결정을 내리는 AI를 의미합니다. 이는 단순히 데이터를 처리하는 것이 아니라, 센서를 통해 환경을 인식하고, 물리적 행동을 통해 환경에 영향을 미치는 지능형 시스템입니다.",
  "여기서 제일 핫한 전시가 뭐야?":
    "현재 가장 인기 있는 전시는 '미래의 로봇과 함께 살아가기' 전시입니다. 이 전시에서는 실제 작동하는 Physical AI 로봇들을 직접 체험하고, 로봇과의 상호작용을 통해 미래의 생활 방식을 미리 경험해볼 수 있습니다. 특히 가정용 서비스 로봇, 교육용 AI 로봇, 그리고 산업용 협동 로봇의 데모를 제공하고 있어 많은 관심을 받고 있습니다.",
  "어떤 AI 모델을 가지고 있어?":
    "저는 GPT-4 기반의 대화형 AI 모델과 컴퓨터 비전을 위한 Vision Transformer 모델, 그리고 물리적 환경 이해를 위한 다중 모달 AI 모델을 탑재하고 있습니다. 이러한 모델들이 통합되어 언어 이해, 시각 인식, 공간 인식, 그리고 의사결정을 종합적으로 수행할 수 있습니다. 특히 Reinforcement Learning을 통해 환경과의 상호작용을 학습하여 지속적으로 성능을 개선하고 있습니다.",
};

// GET /api/suggestions - 추천 질문 목록 반환 (최초 로드용)
router.get("/", (req: Request, res: Response) => {
  console.log("[Suggestions API GET] Returning suggestions list");
  res.json({ suggestions });
});

// POST /api/suggestions - 질문과 mode를 받아서 SSE 스트림 응답
router.post("/", async (req: Request, res: Response) => {
  console.log("[Suggestions API POST] Request received", {
    body: req.body,
  });

  // 40% 확률로 500 에러 반환
  const shouldFail = Math.random() < 0.4;

  if (shouldFail) {
    console.log("[Suggestions API POST] Returning 500 error (40% probability)");
    return res.status(500).json({
      error: "Internal Server Error",
      message: "네트워크 오류가 발생했습니다",
    });
  }

  const { question, mode } = req.body;
  const streamMode = mode || "normal";

  // 질문에 대한 답변 찾기 (정확한 매칭 또는 포함 여부로 검색)
  let answer: string | undefined;

  // question이 문자열인지 확인
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
    "Transfer-Encoding": "chunked",
  });

  console.log("[Suggestions API POST] SSE headers sent, starting stream");

  // 초기 메시지 전송
  res.write(": connection established\n\n");
  res.write(": stream started\n\n");

  // 초기 메시지 flush
  if (typeof (res as any).flush === "function") {
    (res as any).flush();
  }

  let isStreamingActive = true;
  let currentIndex = 0;

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

  switch (streamMode) {
    case "normal": {
      // 정상 스트리밍 - Promise 기반으로 순차적으로 텀을 두고 전송
      currentIndex = 0;
      console.log(
        "[normal mode] Starting stream with",
        chunks.length,
        "chunks"
      );

      // Promise 기반으로 순차적으로 청크 전송
      const sendChunksSequentially = async () => {
        console.log("[normal mode] sendChunksSequentially started");
        for (let i = 0; i < chunks.length; i++) {
          console.log(
            `[normal mode] Loop iteration ${i}, isStreamingActive=${isStreamingActive}, writableEnded=${res.writableEnded}, destroyed=${res.destroyed}`
          );

          if (!isStreamingActive || res.writableEnded || res.destroyed) {
            console.log("[normal mode] Stream inactive or ended at chunk", i, {
              isStreamingActive,
              writableEnded: res.writableEnded,
              destroyed: res.destroyed,
            });
            break;
          }

          console.log(
            `[normal mode] Sending chunk ${i + 1}/${chunks.length}: "${
              chunks[i]
            }"`
          );

          const chunkSent = sendSSEChunk(
            res,
            JSON.stringify({
              chunk: chunks[i],
              index: i,
            })
          );

          // 각 청크 전송 후 즉시 flush
          if (typeof (res as any).flush === "function") {
            try {
              (res as any).flush();
            } catch (e) {
              // flush 에러 무시
            }
          }

          console.log(`[normal mode] Chunk ${i} sent result: ${chunkSent}`);

          if (!chunkSent) {
            console.warn(
              `[normal mode] Failed to send chunk ${i}, stream may be closed`
            );
            isStreamingActive = false;
            break;
          }

          currentIndex = i + 1;

          // 딜레이 없이 모든 청크를 즉시 전송 (프론트에서 스트리밍 효과 처리)
        }
        console.log(
          "[normal mode] Loop completed, currentIndex:",
          currentIndex
        );

        // 모든 청크 전송 완료
        try {
          sendSSEChunk(res, JSON.stringify({ done: true }));
          console.log("[normal mode] Stream completed, ending response");
          isStreamingActive = false;
          if (!res.writableEnded && !res.destroyed) {
            res.end();
          }
        } catch (error) {
          console.error("[normal mode] Error ending stream:", error);
          isStreamingActive = false;
        }
      };

      // 비동기 함수 실행 (await로 완료될 때까지 대기)
      await sendChunksSequentially();

      break;
    }

    case "delay": {
      // 지연 모드: 딜레이 없이 즉시 전송 (프론트에서 긴 간격으로 표시)
      const sendChunksWithDelay = async () => {
        for (let i = 0; i < chunks.length; i++) {
          if (!isStreamingActive || res.writableEnded || res.destroyed) {
            break;
          }
          sendSSEChunk(res, JSON.stringify({ chunk: chunks[i], index: i }));
        }
        sendSSEChunk(res, JSON.stringify({ done: true }));
        if (!res.writableEnded && !res.destroyed) {
          res.end();
        }
      };
      await sendChunksWithDelay();
      break;
    }

    case "missing": {
      // 누락 모드: 일부 청크 건너뛰기
      const sendChunksWithMissing = async () => {
        for (let i = 0; i < chunks.length; i++) {
          if (!isStreamingActive || res.writableEnded || res.destroyed) {
            break;
          }
          // 3번째, 5번째 청크 건너뛰기
          if (i !== 2 && i !== 4) {
            sendSSEChunk(res, JSON.stringify({ chunk: chunks[i], index: i }));
          }
        }
        sendSSEChunk(res, JSON.stringify({ done: true }));
        if (!res.writableEnded && !res.destroyed) {
          res.end();
        }
      };
      await sendChunksWithMissing();
      break;
    }

    case "duplicate": {
      // 중복 모드: 일부 청크 중복 전송
      const sendChunksWithDuplicate = async () => {
        for (let i = 0; i < chunks.length; i++) {
          if (!isStreamingActive || res.writableEnded || res.destroyed) {
            break;
          }
          sendSSEChunk(res, JSON.stringify({ chunk: chunks[i], index: i }));
          // 2번째 청크를 중복 전송
          if (i === 1) {
            sendSSEChunk(
              res,
              JSON.stringify({ chunk: chunks[i], index: i, duplicate: true })
            );
          }
        }
        sendSSEChunk(res, JSON.stringify({ done: true }));
        if (!res.writableEnded && !res.destroyed) {
          res.end();
        }
      };
      await sendChunksWithDuplicate();
      break;
    }

    case "error": {
      // 에러 모드: 중간에 연결 끊김
      const sendChunksWithError = async () => {
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
        }
        sendSSEChunk(res, JSON.stringify({ done: true }));
        if (!res.writableEnded && !res.destroyed) {
          res.end();
        }
      };
      await sendChunksWithError();
      break;
    }

    default:
      res.status(400).json({ error: "Invalid mode" });
  }
});

export { router as suggestionsRouter };
