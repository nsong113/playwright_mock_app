// 로봇 상태 타입
export type RobotState = "IDLE" | "MOVING" | "STANDBY" | "ERROR" | "CHARGING";

// Bridge 이벤트 타입
export interface BridgeEvent {
  type: "arrival" | "battery" | "standby" | "error";
  data: any;
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
