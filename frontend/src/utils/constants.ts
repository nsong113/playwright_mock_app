// API 엔드포인트
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  SUGGESTIONS: `${API_BASE_URL}/api/suggestions`,
} as const;

// 위치 목록
export const LOCATIONS = [
  { id: "charging-station", name: "Charging Station" },
  { id: "location-a", name: "Location A" },
  { id: "location-b", name: "Location B" },
] as const;

// 배터리 레벨 프리셋
export const BATTERY_LEVELS = [100, 75, 50, 25, 10] as const;

// SSE 모드 설정
export const SSE_MODES = [
  {
    value: "normal" as const,
    label: "정상",
    description: "정상: 일반 스트리밍",
  },
  {
    value: "delay" as const,
    label: "지연",
    description: "지연: 청크 사이 지연",
  },
  {
    value: "error" as const,
    label: "에러",
    description: "에러: 중간에 연결 끊김",
  },
] as const;

// 이동 시뮬레이션 시간 (ms)
export const MOVEMENT_DURATION_MS = 3000;
