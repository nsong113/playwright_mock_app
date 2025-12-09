import { useRecoilState } from "recoil";
import { robotStateAtom } from "@/store";

const locations = ["Location A", "Location B", "Location C", "Home Base"];

export function RobotControl() {
  const [robotState, setRobotState] = useRecoilState(robotStateAtom);

  const handleMove = (location: string) => {
    if (robotState === "MOVING") {
      return; // 이미 이동 중이면 무시
    }
    setRobotState("MOVING");
    // 실제로는 Bridge를 통해 이동 명령을 보내고, 도착 이벤트를 기다림
    // 여기서는 시뮬레이션을 위해 3초 후 자동으로 도착 이벤트 트리거
    setTimeout(() => {
      if (window.onArrival) {
        window.onArrival(location);
      }
    }, 3000);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">로봇 이동 제어</h2>

      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => handleMove(location)}
              disabled={robotState === "MOVING"}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              data-action="move"
              data-location={location}
            >
              {location}로 이동
            </button>
          ))}
        </div>

        {robotState === "MOVING" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              이동 중입니다... 잠시만 기다려주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
