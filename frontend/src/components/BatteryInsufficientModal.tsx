import { useRecoilState } from "recoil";
import { batteryInsufficientModalOpenAtom } from "@/store";

export function BatteryInsufficientModal() {
  const [isOpen, setIsOpen] = useRecoilState(batteryInsufficientModalOpenAtom);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-red-600">이동 불가</h2>
          <p className="text-gray-600 mb-4">
            배터리가 10% 이하여서
            <br />
            이동할 수 없습니다.
            <br />
            충전 후 이동해주세요.
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
