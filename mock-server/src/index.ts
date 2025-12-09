import express from "express";
import cors from "cors";
import { sseRouter } from "./routes/sse.js";
import { bridgeRouter } from "./routes/bridge.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 라우트 설정
app.use("/api/stream", sseRouter);
app.use("/api/bridge", bridgeRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
});
