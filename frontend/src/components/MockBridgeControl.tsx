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
      <h3 className="text-sm font-semibold mb-3 text-gray-600">
        Mock Bridge 이벤트 (테스트용)
      </h3>

      <div className="space-y-2">
        {/* 도착 이벤트 */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-500">
            도착 이벤트
          </label>
          <div className="flex gap-2 flex-wrap">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => triggerArrival(location)}
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* 배터리 업데이트 */}
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-500">
            배터리
          </label>
          <div className="flex gap-2 flex-wrap">
            {[100, 75, 50, 25, 10].map((level) => (
              <button
                key={level}
                onClick={() => triggerBatteryUpdate(level)}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
              >
                {level}%
              </button>
            ))}
          </div>
        </div>

        {/* 대기 모드 & 에러 */}
        <div className="flex gap-2">
          <button
            onClick={() => triggerStandbyMode(!isStandbyMode)}
            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
          >
            대기모드 {isStandbyMode ? "OFF" : "ON"}
          </button>
          <button
            onClick={() => triggerError("NETWORK_ERROR", "Connection failed")}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
          >
            에러 발생
          </button>
        </div>

        {/* 현재 상태 */}
        <div className="pt-2 border-t text-xs text-gray-500">
          위치: {currentLocation || "없음"} | 대기모드:{" "}
          {isStandbyMode ? "ON" : "OFF"}
        </div>
      </div>
    </div>
  );
}
