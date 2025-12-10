import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  robotStateAtom,
  isEmergencyStoppedAtom,
  targetLocationAtom,
} from "@/store";
import { useEventLogger } from "@/hooks/useEventLogger";

export function EmergencyStopButton() {
  const robotState = useRecoilValue(robotStateAtom);
  const [isEmergencyStopped, setIsEmergencyStopped] = useRecoilState(
    isEmergencyStoppedAtom
  );
  const setTargetLocation = useSetRecoilState(targetLocationAtom);
  const setRobotState = useSetRecoilState(robotStateAtom);
  const { logEvent } = useEventLogger();

  // MOVING 상태에서만 비상 정지 버튼 표시
  if (robotState !== "MOVING") return null;

  const handleEmergencyStop = () => {
    setIsEmergencyStopped(true);
    setRobotState("STANDBY");
    logEvent("event", "system", "비상 정지 활성화", {
      action: "emergency_stop",
    });
    logEvent(
      "state-change",
      "system",
      "상태 변경: MOVING → STANDBY (비상 정지)",
      {
        from: "MOVING",
        to: "STANDBY",
        reason: "emergency_stop",
      }
    );
  };

  return (
    <button
      onClick={handleEmergencyStop}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
    >
      <span className="text-xl">🛑</span>
      <span>비상 정지</span>
    </button>
  );
}
