import { useRecoilValue } from "recoil";
import { batteryLevelAtom, currentLocationAtom, robotStateAtom } from "@/store";
import { FaBoltLightning } from "react-icons/fa6";

export function BatteryIndicator() {
  const batteryLevel = useRecoilValue(batteryLevelAtom);
  const currentLocation = useRecoilValue(currentLocationAtom);
  const robotState = useRecoilValue(robotStateAtom);

  const isAtHomeBase = currentLocation === "Home Base";
  const isChargingState = robotState === "CHARGING";

  const getBatteryColor = () => {
    if (batteryLevel > 50) return "text-green-500";
    if (batteryLevel > 20) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex gap-2 items-center">
      <div className="relative">
        <div className="w-12 h-6 rounded-sm border-2 border-gray-700">
          <div
            className={`h-full ${getBatteryColor().replace(
              "text-",
              "bg-"
            )} transition-all duration-300`}
            style={{ width: `${batteryLevel}%` }}
            data-battery={batteryLevel}
          />
        </div>
        {/* Home Base에 있을 때 배터리 전체의 정 중앙에 충전 아이콘 표시 */}
        {isAtHomeBase && isChargingState && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <FaBoltLightning className="text-xs text-yellow-300" />
          </div>
        )}
        <div className="absolute -right-1 top-1/2 w-1 h-3 bg-gray-700 rounded-r -translate-y-1/2" />
      </div>
      <span className={`text-lg font-semibold ${getBatteryColor()}`}>
        {batteryLevel}%
      </span>
      {isChargingState && (
        <span className="text-sm font-semibold text-purple-600">⚡</span>
      )}
    </div>
  );
}
