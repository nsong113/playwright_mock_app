import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { level } = req.body;
  console.log("[Bridge Mock] Battery updated:", level);
  res.json({ success: true, event: "battery", level });
}
