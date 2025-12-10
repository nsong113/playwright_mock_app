import { useRecoilValue } from "recoil";
import { robotStateAtom } from "@/store";
import { RobotState } from "@/types";

const stateColors: Record<RobotState, string> = {
  IDLE: "bg-green-500",
  MOVING: "bg-blue-500",
  STANDBY: "bg-yellow-500",
  ERROR: "bg-red-500",
  CHARGING: "bg-purple-500",
};

const stateLabels: Record<RobotState, string> = {
  IDLE: "대기 중",
  MOVING: "이동 중",
  STANDBY: "대기 모드",
  ERROR: "오류",
  CHARGING: "충전 중",
};

export function StateMachine() {
  const robotState = useRecoilValue(robotStateAtom);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="mb-3 text-lg font-semibold">로봇 상태</h3>
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
