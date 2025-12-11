import { useMockBridge } from "@/hooks/useMockBridge";
import { useRecoilValue } from "recoil";
import { batteryLevelAtom } from "@/store";
import { useState, ChangeEvent, useEffect, useRef } from "react";
import { useEventLogger } from "@/hooks/useEventLogger";

export function MockBridgeControl() {
  const { triggerArrival, triggerBatteryUpdate, triggerError } =
    useMockBridge();
  const batteryLevel = useRecoilValue(batteryLevelAtom);
  const [inputValue, setInputValue] = useState(batteryLevel.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const { logEvent } = useEventLogger();

  const locations = ["Home Base", "Location A", "Location B"];

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
      <div className="mb-4">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 whitespace-nowrap">
          ③ 로봇 ↔ 앱 통신(Mock Bridge) 이벤트 시뮬레이터
        </h3>
        <p className="mb-3 text-sm text-gray-600">
          <span className="font-semibold text-green-600">도착</span>·
          <span className="font-semibold text-blue-600">배터리</span>·
          <span className="font-semibold text-red-600">에러</span> 이벤트를
          수동으로 발생시켜, UI와 로그 반응을 테스트합니다.
        </p>
      </div>

      <div className="space-y-3">
        {/* 도착 이벤트 */}
        <div>
          <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-700 uppercase">
            도착 이벤트
          </label>
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => triggerArrival(location)}
                className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600"
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        {/* 배터리 업데이트 */}
        <div>
          <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-700 uppercase">
            배터리 이벤트
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {[100, 75, 50, 25, 10].map((level) => (
              <button
                key={level}
                onClick={() => triggerBatteryUpdate(level)}
                className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
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

        {/* 에러 */}
        <div>
          <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-700 uppercase">
            에러 이벤트
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => triggerError("NETWORK_ERROR", "Connection failed")}
              className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
            >
              에러 발생
            </button>
          </div>
        </div>

        {/* 현재 상태 */}
        <div className="pt-2 text-xs text-gray-500 border-t">
          현재 위치는 위 버튼으로 변경하고, 오른쪽 로그에서 결과를 확인하세요.
        </div>
      </div>
    </div>
  );
}
