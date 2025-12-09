import { atom } from "recoil";
import { RobotState } from "@/types";

// 로봇 상태
export const robotStateAtom = atom<RobotState>({
  key: "robotStateAtom",
  default: "IDLE",
});

// 배터리 레벨 (0-100)
export const batteryLevelAtom = atom<number>({
  key: "batteryLevelAtom",
  default: 100,
});

// 충전 중 여부
export const isChargingAtom = atom<boolean>({
  key: "isChargingAtom",
  default: false,
});

// 대기 모드 여부
export const isStandbyModeAtom = atom<boolean>({
  key: "isStandbyModeAtom",
  default: false,
});

// 현재 위치
export const currentLocationAtom = atom<string | null>({
  key: "currentLocationAtom",
  default: null,
});

// SSE 스트리밍 텍스트
export const streamingTextAtom = atom<string>({
  key: "streamingTextAtom",
  default: "",
});

// SSE 스트리밍 중 여부
export const isStreamingAtom = atom<boolean>({
  key: "isStreamingAtom",
  default: false,
});

// 에러 정보
export const errorAtom = atom<{ code: string; message: string } | null>({
  key: "errorAtom",
  default: null,
});
