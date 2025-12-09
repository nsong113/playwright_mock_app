import { Router, Request, Response } from "express";

const router = Router();

// Bridge 이벤트를 시뮬레이션하는 엔드포인트들
// 실제로는 클라이언트에서 window.onArrival 등을 직접 호출하지만,
// 테스트를 위한 API도 제공

// POST /api/bridge/arrival
router.post("/arrival", (req: Request, res: Response) => {
  const { location, position } = req.body;
  console.log("[Bridge Mock] Arrival event:", { location, position });
  res.json({ success: true, event: "arrival", location, position });
});

// POST /api/bridge/battery
router.post("/battery", (req: Request, res: Response) => {
  const { level } = req.body;
  console.log("[Bridge Mock] Battery updated:", level);
  res.json({ success: true, event: "battery", level });
});

// POST /api/bridge/standby
router.post("/standby", (req: Request, res: Response) => {
  const { isStandby } = req.body;
  console.log("[Bridge Mock] Standby mode updated:", isStandby);
  res.json({ success: true, event: "standby", isStandby });
});

// POST /api/bridge/error
router.post("/error", (req: Request, res: Response) => {
  const { code, message } = req.body;
  console.log("[Bridge Mock] Error event:", { code, message });
  res.json({ success: true, event: "error", code, message });
});

export { router as bridgeRouter };
