import { useMockBridge } from "@/hooks/useMockBridge";
import { useRecoilValue } from "recoil";
import { currentLocationAtom, isStandbyModeAtom } from "@/store";

export function MockBridgeControl() {
  const {
    triggerArrival,
    triggerBatteryUpdate,
    triggerStandbyMode,
    triggerError,
  } = useMockBridge();
  const currentLocation = useRecoilValue(currentLocationAtom);
  const isStandbyMode = useRecoilValue(isStandbyModeAtom);

  const locations = ["Location A", "Location B", "Location C", "Home Base"];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">Mock Bridge 이벤트</h2>

      <div className="space-y-3">
        {/* 도착 이벤트 */}
        <div>
          <label className="block text-sm font-medium mb-1">도착 이벤트</label>
          <div className="flex gap-2 flex-wrap">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => triggerArrival(location)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                {location} 도착
              </button>
            ))}
          </div>
        </div>

        {/* 배터리 업데이트 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            배터리 업데이트
          </label>
          <div className="flex gap-2 flex-wrap">
            {[100, 75, 50, 25, 10].map((level) => (
              <button
                key={level}
                onClick={() => triggerBatteryUpdate(level)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                {level}%
              </button>
            ))}
          </div>
        </div>

        {/* 대기 모드 */}
        <div>
          <label className="block text-sm font-medium mb-1">대기 모드</label>
          <div className="flex gap-2">
            <button
              onClick={() => triggerStandbyMode(true)}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            >
              대기 모드 ON
            </button>
            <button
              onClick={() => triggerStandbyMode(false)}
              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
            >
              대기 모드 OFF
            </button>
          </div>
        </div>

        {/* 에러 이벤트 */}
        <div>
          <label className="block text-sm font-medium mb-1">에러 이벤트</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                triggerError("NETWORK_ERROR", "Network connection failed")
              }
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              네트워크 에러
            </button>
            <button
              onClick={() =>
                triggerError("MOTOR_ERROR", "Motor system malfunction")
              }
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              모터 에러
            </button>
          </div>
        </div>

        {/* 현재 상태 표시 */}
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">
            현재 위치:{" "}
            <span className="font-semibold">{currentLocation || "없음"}</span>
          </p>
          <p className="text-sm text-gray-600">
            대기 모드:{" "}
            <span className="font-semibold">
              {isStandbyMode ? "ON" : "OFF"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
