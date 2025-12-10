// 로봇 상태 타입
export type RobotState = "IDLE" | "MOVING" | "STANDBY" | "ERROR" | "CHARGING";

// Bridge 이벤트 타입
export interface BridgeEvent {
  type: "arrival" | "battery" | "standby" | "error";
  data:
    | { location: string; position?: { x: number; y: number; yaw: number } }
    | { level: string | number }
    | { isStandby: boolean }
    | { code: string; message: string };
}

// SSE 청크 타입
export interface SSEChunk {
  chunk?: string;
  index?: number;
  done?: boolean;
  error?: string;
  duplicate?: boolean;
}

// 위치 정보
export interface Location {
  id: string;
  name: string;
}

// 이벤트 로그 타입
export interface EventLog {
  id: string;
  timestamp: number;
  type: "event" | "state-change";
  category: "bridge" | "sse" | "network" | "system";
  message: string;
  details?: Record<string, unknown>;
}

// 이벤트 로거 파라미터 타입
export type EventLogType = "event" | "state-change";
export type EventLogCategory = "bridge" | "sse" | "network" | "system";

// 네트워크 상태 타입
export type NetworkStatus = "online" | "offline" | "slow";

// 시드 정보 타입
export interface SeedConfig {
  seed: string;
  scenario: string;
}
