import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  robotStateAtom,
  isEmergencyStoppedAtom,
  targetLocationAtom,
} from "@/store";
import { useEventLogger } from "@/hooks/useEventLogger";
import { useEffect, useRef } from "react";

export function ResumeCancelButtons() {
  const robotState = useRecoilValue(robotStateAtom);
  const [isEmergencyStopped, setIsEmergencyStopped] = useRecoilState(
    isEmergencyStoppedAtom
  );
  const targetLocation = useRecoilValue(targetLocationAtom);
  const setRobotState = useSetRecoilState(robotStateAtom);
  const setTargetLocation = useSetRecoilState(targetLocationAtom);
  const { logEvent } = useEventLogger();
  const arrivalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (arrivalTimeoutRef.current) {
        clearTimeout(arrivalTimeoutRef.current);
      }
    };
  }, []);

  // 비상 정지로 인한 IDLE 상태일 때만 표시
  if (robotState !== "IDLE" || !isEmergencyStopped) return null;

  const handleResume = () => {
    if (!targetLocation) return;

    setIsEmergencyStopped(false);
    setRobotState("MOVING");
    logEvent("event", "system", "이동 재개", {
      action: "resume",
      targetLocation,
    });
    logEvent("state-change", "system", "상태 변경: IDLE → MOVING (재개)", {
      from: "IDLE",
      to: "MOVING",
      targetLocation,
    });

    // 이동 재개 - 목적지로 계속 이동
    arrivalTimeoutRef.current = setTimeout(() => {
      if (window.onArrival) {
        window.onArrival(targetLocation);
      }
    }, 3000);
  };

  const handleCancel = () => {
    setIsEmergencyStopped(false);
    setRobotState("IDLE");
    setTargetLocation(null);
    logEvent("event", "system", "이동 취소", {
      action: "cancel",
    });
    logEvent("event", "system", "이동 취소 완료", {
      action: "cancel",
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleResume}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
      >
        <span>▶</span>
        <span>이동 재개</span>
      </button>
      <button
        onClick={handleCancel}
        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
      >
        <span>✕</span>
        <span>이동 취소</span>
      </button>
    </div>
  );
}
