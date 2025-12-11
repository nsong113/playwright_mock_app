import { useRecoilState, useSetRecoilState } from "recoil";
import {
  lowBatteryModalOpenAtom,
  lowBatteryModalShownAtom,
  criticalBatteryModalOpenAtom,
  robotStateAtom,
  targetLocationAtom,
  movementTimeoutIdAtom,
} from "@/store";
import { useEventLogger } from "@/hooks/useEventLogger";
import { MOVEMENT_DURATION_MS } from "@/utils/constants";

export function BatteryWarningModal() {
  const [lowBatteryOpen, setLowBatteryOpen] = useRecoilState(
    lowBatteryModalOpenAtom
  );
  const setLowBatteryModalShown = useSetRecoilState(lowBatteryModalShownAtom);
  const [criticalBatteryOpen, setCriticalBatteryOpen] = useRecoilState(
    criticalBatteryModalOpenAtom
  );
  const setRobotState = useSetRecoilState(robotStateAtom);
  const setTargetLocation = useSetRecoilState(targetLocationAtom);
  const setMovementTimeoutId = useSetRecoilState(movementTimeoutIdAtom);
  const { logEvent } = useEventLogger();

  // 25% 경고 모달
  if (lowBatteryOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
          <div className="text-center">
            <div className="inline-block w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-orange-600">
              배터리 부족
            </h2>
            <p className="text-gray-600 mb-4">
              배터리가 25% 이하입니다.
              <br />
              충전기로 이동하겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLowBatteryOpen(false);
                  // "예"를 선택하면 충전기로 이동하므로 플래그를 유지 (MOVING 상태가 되므로 모달이 다시 열리지 않음)
                  setLowBatteryModalShown(true);
                  logEvent("event", "bridge", "충전기로 이동 시작", {
                    action: "move_to_charging_station",
                  });
                  // Charging Station으로 이동 시작
                  setRobotState("MOVING");
                  setTargetLocation("Charging Station"); // 이동 목적지 설정
                  // 이동 시뮬레이션 - window.onArrival을 호출하여 useMockBridge의 로직 사용
                  const timeoutId = setTimeout(() => {
                    if (window.onArrival) {
                      window.onArrival("Charging Station");
                    }
                    setMovementTimeoutId(null);
                  }, MOVEMENT_DURATION_MS);
                  setMovementTimeoutId(timeoutId);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                예
              </button>
              <button
                onClick={() => {
                  setLowBatteryOpen(false);
                  // "아니요"를 선택하면 플래그를 리셋하여 배터리 레벨이 변경되면 다시 모달을 열 수 있도록 함
                  setLowBatteryModalShown(false);
                  logEvent("event", "bridge", "충전기 이동 취소", {
                    action: "cancel",
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                아니요
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 10% 위험 모달
  if (criticalBatteryOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
          <div className="text-center">
            <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🔴</span>
            </div>
            <h2 className="text-xl font-bold mb-2 text-red-600">배터리 위험</h2>
            <p className="text-gray-600 mb-4">
              로봇의 배터리가 10% 이하여서
              <br />
              충전기로 바로 이동하겠습니다.
            </p>
            <button
              onClick={() => {
                setCriticalBatteryOpen(false);
                logEvent(
                  "event",
                  "bridge",
                  "배터리 위험 - 자동으로 충전기로 이동",
                  {
                    action: "auto_move_to_homebase",
                  }
                );
                // 자동으로 Charging Station으로 이동
                setRobotState("MOVING");
                setTargetLocation("Charging Station"); // 이동 목적지 설정
                // 이동 시뮬레이션 - window.onArrival을 호출하여 useMockBridge의 로직 사용
                const timeoutId = setTimeout(() => {
                  if (window.onArrival) {
                    window.onArrival("Charging Station");
                  }
                  setMovementTimeoutId(null);
                }, MOVEMENT_DURATION_MS);
                setMovementTimeoutId(timeoutId);
              }}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
