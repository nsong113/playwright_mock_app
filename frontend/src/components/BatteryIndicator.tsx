import { useRecoilValue } from "recoil";
import { batteryLevelAtom, isChargingAtom } from "@/store";

export function BatteryIndicator() {
  const batteryLevel = useRecoilValue(batteryLevelAtom);
  const isCharging = useRecoilValue(isChargingAtom);

  const getBatteryColor = () => {
    if (batteryLevel > 50) return "bg-green-500";
    if (batteryLevel > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">배터리</h2>
      <div className="flex items-center gap-3">
        <div className="w-32 h-8 border-2 border-gray-300 rounded relative overflow-hidden">
          <div
            className={`h-full ${getBatteryColor()} transition-all duration-300`}
            style={{ width: `${batteryLevel}%` }}
            data-battery={batteryLevel}
          />
        </div>
        <span className="text-lg font-bold">{batteryLevel}%</span>
        {isCharging && (
          <span className="text-sm text-purple-600 font-semibold">
            ⚡ 충전 중
          </span>
        )}
      </div>
    </div>
  );
}
