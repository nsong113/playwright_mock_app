import type { VercelRequest, VercelResponse } from "@vercel/node";

// SSE 스트리밍 응답 헬퍼
function sendSSEChunk(res: VercelResponse, data: string) {
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("SSE /chat route hit");
  console.log("Query params:", req.query);
  const mode = (req.query.mode as string) || "normal";
  const message =
    (req.query.message as string) ||
    "Hello! This is a streaming response from the mock server.";

  console.log("Mode:", mode, "Message:", message);

  // SSE 헤더 설정
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  const chunks = chunkText(message);

  // 비동기로 스트리밍 처리
  (async () => {
    switch (mode) {
      case "normal": {
        // 정상 스트리밍 - 100ms 간격
        for (let i = 0; i < chunks.length; i++) {
          if (res.writableEnded || res.destroyed) {
            break;
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

      case "delay": {
        // 지연 모드: 1초 간격
        for (let i = 0; i < chunks.length; i++) {
          if (res.writableEnded || res.destroyed) {
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
          if (res.writableEnded || res.destroyed) {
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
          if (res.writableEnded || res.destroyed) {
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
          if (res.writableEnded || res.destroyed) {
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

