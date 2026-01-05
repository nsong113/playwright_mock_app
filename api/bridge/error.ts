import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, message } = req.body;
  console.log("[Bridge Mock] Error event:", { code, message });
  res.json({ success: true, event: "error", code, message });
}
