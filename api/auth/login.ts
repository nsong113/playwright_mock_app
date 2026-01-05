import type { VercelRequest, VercelResponse } from "@vercel/node";

// 하드코딩된 계정 정보
const HARDCODED_USER = {
  id: "qa",
  password: "qa123",
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({
      success: false,
      message: "ID와 비밀번호를 입력해주세요.",
    });
  }

  if (id === HARDCODED_USER.id && password === HARDCODED_USER.password) {
    // 간단한 인증 토큰 (실제로는 JWT 등 사용)
    const token = `mock_token_${Date.now()}`;
    console.log("[Auth] Login successful:", id);
    return res.json({
      success: true,
      token,
      user: { id },
    });
  } else {
    console.log("[Auth] Login failed:", id);
    return res.status(401).json({
      success: false,
      message: "ID 또는 비밀번호가 올바르지 않습니다.",
    });
  }
}
