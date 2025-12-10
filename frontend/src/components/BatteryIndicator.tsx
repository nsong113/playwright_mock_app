import { useRecoilValue } from "recoil";
import { batteryLevelAtom, isChargingAtom } from "@/store";

export function BatteryIndicator() {
  const batteryLevel = useRecoilValue(batteryLevelAtom);
  const isCharging = useRecoilValue(isChargingAtom);

  const getBatteryColor = () => {
    if (batteryLevel > 50) return "text-green-500";
    if (batteryLevel > 20) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-12 h-6 border-2 border-gray-700 rounded-sm">
          <div
            className={`h-full ${getBatteryColor().replace(
              "text-",
              "bg-"
            )} transition-all duration-300`}
            style={{ width: `${batteryLevel}%` }}
            data-battery={batteryLevel}
          />
        </div>
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-gray-700 rounded-r" />
      </div>
      <span className={`text-lg font-semibold ${getBatteryColor()}`}>
        {batteryLevel}%
      </span>
      {isCharging && (
        <span className="text-sm text-purple-600 font-semibold">⚡</span>
      )}
    </div>
  );
}
