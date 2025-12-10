import { useMockBridge } from "@/hooks/useMockBridge";
import { useRecoilValue } from "recoil";
import {
  currentLocationAtom,
  isStandbyModeAtom,
  batteryLevelAtom,
} from "@/store";
import { useState, ChangeEvent, useEffect, useRef } from "react";
import { useEventLogger } from "@/hooks/useEventLogger";

export function MockBridgeControl() {
  const {
    triggerArrival,
    triggerBatteryUpdate,
    triggerStandbyMode,
    triggerError,
  } = useMockBridge();
  const currentLocation = useRecoilValue(currentLocationAtom);
  const isStandbyMode = useRecoilValue(isStandbyModeAtom);
  const batteryLevel = useRecoilValue(batteryLevelAtom);
  const [inputValue, setInputValue] = useState(batteryLevel.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const { logEvent } = useEventLogger();

  const locations = ["Location A", "Location B", "Location C", "Home Base"];

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      triggerBatteryUpdate(value);
      logEvent("event", "bridge", `배터리 수동 설정: ${value}%`, {
        level: value,
      });
    } else {
      // 유효하지 않은 값이면 원래 값으로 복원
      setInputValue(batteryLevel.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  // batteryLevel이 외부에서 변경되면 inputValue도 업데이트 (입력 중이 아닐 때만)
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(batteryLevel.toString());
    }
  }, [batteryLevel]);

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
          <div className="flex gap-2 flex-wrap items-center">
            {[100, 75, 50, 25, 10].map((level) => (
              <button
                key={level}
                onClick={() => triggerBatteryUpdate(level)}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
              >
                {level}%
              </button>
            ))}
            <input
              ref={inputRef}
              type="number"
              min="0"
              max="100"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="px-1 w-12 h-6 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="%"
            />
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
