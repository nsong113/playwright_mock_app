import { atom } from "recoil";
import { RobotState, EventLog, NetworkStatus, Suggestion } from "@/types";

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

// 현재 위치
export const currentLocationAtom = atom<string | null>({
  key: "currentLocationAtom",
  default: null,
});

// 이동 목적지
export const targetLocationAtom = atom<string | null>({
  key: "targetLocationAtom",
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

// 도착 모달 표시 여부
export const arrivalModalOpenAtom = atom<boolean>({
  key: "arrivalModalOpenAtom",
  default: false,
});

// 이벤트 로그
export const eventLogsAtom = atom<EventLog[]>({
  key: "eventLogsAtom",
  default: [],
});

// 네트워크 상태
export const networkStatusAtom = atom<NetworkStatus>({
  key: "networkStatusAtom",
  default: "online",
});

// 배터리 경고 모달 (25%)
export const lowBatteryModalOpenAtom = atom<boolean>({
  key: "lowBatteryModalOpenAtom",
  default: false,
});

// 배터리 위험 모달 (10% 이하)
export const criticalBatteryModalOpenAtom = atom<boolean>({
  key: "criticalBatteryModalOpenAtom",
  default: false,
});

// 배터리 부족으로 인한 이동 방지 모달
export const batteryInsufficientModalOpenAtom = atom<boolean>({
  key: "batteryInsufficientModalOpenAtom",
  default: false,
});

// 비상 정지 상태 (비상 정지로 인한 STANDBY인지 구분)
export const isEmergencyStoppedAtom = atom<boolean>({
  key: "isEmergencyStoppedAtom",
  default: false,
});

// 이동 타임아웃 ID (비상 정지 시 취소하기 위해)
export const movementTimeoutIdAtom = atom<NodeJS.Timeout | null>({
  key: "movementTimeoutIdAtom",
  default: null,
});

// 추천 질문 목록 (하드코딩)
export const suggestionsAtom = atom<Suggestion[]>({
  key: "suggestionsAtom",
  default: [
    { id: 1, text: "Physical AI에 대해서 설명해줘" },
    { id: 2, text: "여기서 제일 핫한 전시가 뭐야?" },
    { id: 3, text: "어떤 AI 모델을 가지고 있어?" },
  ],
});

// 네트워크 에러 모달 표시 여부
export const networkErrorModalOpenAtom = atom<boolean>({
  key: "networkErrorModalOpenAtom",
  default: false,
});

// 선택된 스트리밍 모드
export const selectedModeAtom = atom<"normal" | "delay" | "error">({
  key: "selectedModeAtom",
  default: "normal",
});

// Help 모달 열림 상태
export const helpModalOpenAtom = atom<boolean>({
  key: "helpModalOpenAtom",
  default: false,
});
