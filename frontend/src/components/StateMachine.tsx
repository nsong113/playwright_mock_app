import { useRecoilValue } from "recoil";
import { robotStateAtom } from "@/store";
import { RobotState } from "@/types";

const stateColors: Record<RobotState, string> = {
  IDLE: "bg-green-500",
  MOVING: "bg-blue-500",
  ERROR: "bg-red-500",
  CHARGING: "bg-purple-500",
};

const stateLabels: Record<RobotState, string> = {
  IDLE: "대기 중",
  MOVING: "이동 중",
  ERROR: "오류",
  CHARGING: "충전 중",
};

export function StateMachine() {
  const robotState = useRecoilValue(robotStateAtom);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="mb-2">
        <h3 className="mb-1 text-sm font-medium text-gray-600">
          로봇 실시간 상태 (상태머신 모니터링)
        </h3>
        <p className="text-xs text-gray-400">
          IDLE / MOVING / ERROR / CHARGING 상태 전환 테스트용
        </p>
      </div>
      <div className="flex gap-3 items-center">
        <div
          className={`w-4 h-4 rounded-full animate-pulse ${stateColors[robotState]}`}
          data-state={robotState}
        />
        <span className="text-xl font-bold">{stateLabels[robotState]}</span>
        <span className="text-sm text-gray-500">({robotState})</span>
      </div>
    </div>
  );
}
