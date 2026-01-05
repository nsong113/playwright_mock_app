import { useRecoilValue, useRecoilState, useSetRecoilState } from "recoil";
import {
  robotStateAtom,
  targetLocationAtom,
  isEmergencyStoppedAtom,
  movementTimeoutIdAtom,
} from "@/store";
import { useEventLogger } from "@/hooks/useEventLogger";
import { useEffect, useRef } from "react";
import { MOVEMENT_DURATION_MS } from "@/utils/constants";
import { clearTimeoutSafely } from "@/utils/timeout";

export function MovingModal() {
  const robotState = useRecoilValue(robotStateAtom);
  const targetLocation = useRecoilValue(targetLocationAtom);
  const [isEmergencyStopped, setIsEmergencyStopped] = useRecoilState(
    isEmergencyStoppedAtom
  );
  const setRobotState = useSetRecoilState(robotStateAtom);
  const setTargetLocation = useSetRecoilState(targetLocationAtom);
  const [movementTimeoutId, setMovementTimeoutId] = useRecoilState(
    movementTimeoutIdAtom
  );
  const { logEvent } = useEventLogger();
  const arrivalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 모든 hooks를 먼저 호출한 후 조건부 렌더링
  useEffect(() => {
    return () => {
      clearTimeoutSafely(arrivalTimeoutRef.current);
    };
  }, []);

  // MOVING 상태이거나 비상 정지로 인한 ERROR 상태일 때 표시
  if (
    robotState !== "MOVING" &&
    !(robotState === "ERROR" && isEmergencyStopped)
  ) {
    return null;
  }

  const isPaused = robotState === "ERROR" && isEmergencyStopped;

  const handleEmergencyStop = () => {
    // 진행 중인 이동 timeout 취소
    clearTimeoutSafely(movementTimeoutId);
    setMovementTimeoutId(null);

    setIsEmergencyStopped(true);
    setRobotState("ERROR");
    logEvent("event", "system", "비상 정지 활성화", {
      action: "emergency_stop",
    });
    logEvent("state-change", "system", "상태 변경: MOVING → ERROR (비상 정지)", {
      from: "MOVING",
      to: "ERROR",
      reason: "emergency_stop",
    });
  };

  const handleResume = () => {
    if (!targetLocation) return;

    setIsEmergencyStopped(false);
    setRobotState("MOVING");
    logEvent("event", "system", "이동 재개", {
      action: "resume",
      targetLocation,
    });
    logEvent("state-change", "system", "상태 변경: ERROR → MOVING (재개)", {
      from: "ERROR",
      to: "MOVING",
      targetLocation,
    });

    // 이동 재개 - 목적지로 계속 이동
    const timeoutId = setTimeout(() => {
      if (window.onArrival) {
        window.onArrival(targetLocation);
      }
      setMovementTimeoutId(null); // timeout 완료 후 초기화
    }, MOVEMENT_DURATION_MS);
    setMovementTimeoutId(timeoutId); // timeout ID 저장
    arrivalTimeoutRef.current = timeoutId;
  };

  const handleCancel = () => {
    // 진행 중인 timeout 취소 (있다면)
    clearTimeoutSafely(movementTimeoutId);
    setMovementTimeoutId(null);
    clearTimeoutSafely(arrivalTimeoutRef.current);
    arrivalTimeoutRef.current = null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          {isPaused ? (
            <>
              <div className="inline-block w-12 h-12 border-4 border-yellow-500 rounded-full mb-4 flex items-center justify-center">
                <span className="text-2xl">⏸</span>
              </div>
              <h2 className="text-xl font-bold mb-2 text-yellow-600">
                이동 일시 중지
              </h2>
              <p className="text-gray-600 mb-4">
                {targetLocation
                  ? `${targetLocation}로의 이동이 일시 중지되었습니다.`
                  : "이동이 일시 중지되었습니다."}
              </p>
              {/* 이동 재개/취소 버튼 */}
              <div className="flex gap-2 justify-center">
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
            </>
          ) : (
            <>
              <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h2 className="text-xl font-bold mb-2">이동 중</h2>
              <p className="text-gray-600 mb-4">
                {targetLocation
                  ? `${targetLocation}로 이동 중입니다...`
                  : "이동 중입니다..."}
              </p>
              {/* 비상 정지 버튼 */}
              <button
                onClick={handleEmergencyStop}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <span className="text-xl">🛑</span>
                <span>비상 정지</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
