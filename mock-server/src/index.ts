import express from "express";
import cors from "cors";
import { sseRouter } from "./routes/sse.js";
import { bridgeRouter } from "./routes/bridge.js";
import { suggestionsRouter } from "./routes/suggestions.js";
import { authRouter } from "./routes/auth.js";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
    credentials: false,
  })
);
app.use(express.json());

// 모든 요청 로깅
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 라우트 설정
app.use("/api/auth", authRouter);
app.use("/api/stream", sseRouter);
app.use("/api/bridge", bridgeRouter);
app.use("/api/suggestions", suggestionsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
});
