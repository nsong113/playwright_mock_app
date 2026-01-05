import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { location, position } = req.body;
  console.log("[Bridge Mock] Arrival event:", { location, position });
  res.json({ success: true, event: "arrival", location, position });
}
