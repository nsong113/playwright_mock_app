import { Router, Request, Response } from "express";

const router = Router();

// SSE 스트리밍 응답 헬퍼
function sendSSEChunk(res: Response, data: string) {
  res.write(`data: ${data}\n\n`);
}

// 텍스트를 청크로 분할
function chunkText(text: string, chunkSize: number = 3): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

// GET /api/stream/chat?mode=normal|delay|missing|duplicate|error
router.get("/chat", (req: Request, res: Response) => {
  console.log("SSE /chat route hit");
  console.log("Query params:", req.query);
  const mode = (req.query.mode as string) || "normal";
  const message =
    (req.query.message as string) ||
    "Hello! This is a streaming response from the mock server.";

  console.log("Mode:", mode, "Message:", message);

  // SSE 헤더 설정
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const chunks = chunkText(message);

  switch (mode) {
    case "normal": {
      // 정상 스트리밍
      let index = 0;
      const interval = setInterval(() => {
        if (index < chunks.length) {
          sendSSEChunk(res, JSON.stringify({ chunk: chunks[index], index }));
          index++;
        } else {
          sendSSEChunk(res, JSON.stringify({ done: true }));
          clearInterval(interval);
          res.end();
        }
      }, 100);
      break;
    }

    case "delay": {
      // 지연 모드: 각 청크 사이에 긴 지연
      let index = 0;
      const interval = setInterval(() => {
        if (index < chunks.length) {
          sendSSEChunk(res, JSON.stringify({ chunk: chunks[index], index }));
          index++;
        } else {
          sendSSEChunk(res, JSON.stringify({ done: true }));
          clearInterval(interval);
          res.end();
        }
      }, 1000); // 1초 지연
      break;
    }

    case "missing": {
      // 누락 모드: 일부 청크 건너뛰기
      let index = 0;
      const interval = setInterval(() => {
        if (index < chunks.length) {
          // 3번째, 5번째 청크 건너뛰기
          if (index !== 2 && index !== 4) {
            sendSSEChunk(res, JSON.stringify({ chunk: chunks[index], index }));
          }
          index++;
        } else {
          sendSSEChunk(res, JSON.stringify({ done: true }));
          clearInterval(interval);
          res.end();
        }
      }, 100);
      break;
    }

    case "duplicate": {
      // 중복 모드: 일부 청크 중복 전송
      let index = 0;
      const interval = setInterval(() => {
        if (index < chunks.length) {
          sendSSEChunk(res, JSON.stringify({ chunk: chunks[index], index }));
          // 2번째 청크를 중복 전송
          if (index === 1) {
            setTimeout(() => {
              sendSSEChunk(
                res,
                JSON.stringify({ chunk: chunks[index], index, duplicate: true })
              );
            }, 50);
          }
          index++;
        } else {
          sendSSEChunk(res, JSON.stringify({ done: true }));
          clearInterval(interval);
          res.end();
        }
      }, 100);
      break;
    }

    case "error": {
      // 에러 모드: 중간에 연결 끊김
      let index = 0;
      const interval = setInterval(() => {
        if (index < chunks.length) {
          if (index === Math.floor(chunks.length / 2)) {
            // 중간에 에러 발생
            sendSSEChunk(res, JSON.stringify({ error: "Connection lost" }));
            clearInterval(interval);
            res.end();
            return;
          }
          sendSSEChunk(res, JSON.stringify({ chunk: chunks[index], index }));
          index++;
        } else {
          sendSSEChunk(res, JSON.stringify({ done: true }));
          clearInterval(interval);
          res.end();
        }
      }, 100);
      break;
    }

    default:
      res.status(400).json({ error: "Invalid mode" });
  }

  // 클라이언트 연결 종료 시 정리
  req.on("close", () => {
    res.end();
  });
});

export { router as sseRouter };
