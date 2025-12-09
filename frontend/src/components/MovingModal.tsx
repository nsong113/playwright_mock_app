import { useRecoilValue } from "recoil";
import { robotStateAtom, currentLocationAtom } from "@/store";

export function MovingModal() {
  const robotState = useRecoilValue(robotStateAtom);
  const currentLocation = useRecoilValue(currentLocationAtom);

  if (robotState !== "MOVING") return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold mb-2">이동 중</h2>
          <p className="text-gray-600">
            {currentLocation
              ? `${currentLocation}로 이동 중입니다...`
              : "이동 중입니다..."}
          </p>
        </div>
      </div>
    </div>
  );
}
