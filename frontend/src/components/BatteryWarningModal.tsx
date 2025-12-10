import { useRecoilState, useSetRecoilState } from "recoil";
import {
  lowBatteryModalOpenAtom,
  criticalBatteryModalOpenAtom,
  robotStateAtom,
  currentLocationAtom,
  targetLocationAtom,
  isChargingAtom,
} from "@/store";
import { useEventLogger } from "@/hooks/useEventLogger";

export function BatteryWarningModal() {
  const [lowBatteryOpen, setLowBatteryOpen] = useRecoilState(
    lowBatteryModalOpenAtom
  );
  const [criticalBatteryOpen, setCriticalBatteryOpen] = useRecoilState(
    criticalBatteryModalOpenAtom
  );
  const setRobotState = useSetRecoilState(robotStateAtom);
  const setCurrentLocation = useSetRecoilState(currentLocationAtom);
  const setTargetLocation = useSetRecoilState(targetLocationAtom);
  const setIsCharging = useSetRecoilState(isChargingAtom);
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
                  logEvent("event", "bridge", "충전기로 이동 시작", {
                    action: "move_to_homebase",
                  });
                  // Home Base로 이동 시작
                  setRobotState("MOVING");
                  setTargetLocation("Home Base"); // 이동 목적지 설정
                  setTimeout(() => {
                    setCurrentLocation("Home Base");
                    setTargetLocation(null); // 목적지 초기화
                    setRobotState("CHARGING");
                    setIsCharging(true);
                    logEvent(
                      "state-change",
                      "system",
                      "상태 변경: MOVING → CHARGING",
                      {
                        from: "MOVING",
                        to: "CHARGING",
                        location: "Home Base",
                      }
                    );
                    logEvent("event", "bridge", "Home Base 도착 - 충전 시작", {
                      location: "Home Base",
                    });
                  }, 3000);
                }}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                예
              </button>
              <button
                onClick={() => {
                  setLowBatteryOpen(false);
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
                // 자동으로 Home Base로 이동
                setRobotState("MOVING");
                setTargetLocation("Home Base"); // 이동 목적지 설정
                setTimeout(() => {
                  setCurrentLocation("Home Base");
                  setTargetLocation(null); // 목적지 초기화
                  setRobotState("CHARGING");
                  setIsCharging(true);
                  logEvent(
                    "state-change",
                    "system",
                    "상태 변경: MOVING → CHARGING",
                    {
                      from: "MOVING",
                      to: "CHARGING",
                      location: "Home Base",
                    }
                  );
                  logEvent("event", "bridge", "Home Base 도착 - 충전 시작", {
                    location: "Home Base",
                  });
                }, 3000);
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
