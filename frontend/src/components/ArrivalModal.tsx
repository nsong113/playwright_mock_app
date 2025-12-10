import { useRecoilState, useRecoilValue } from "recoil";
import { arrivalModalOpenAtom, currentLocationAtom } from "@/store";
import { useEffect } from "react";

export function ArrivalModal() {
  const [isOpen, setIsOpen] = useRecoilState(arrivalModalOpenAtom);
  const currentLocation = useRecoilValue(currentLocationAtom);

  // 모달이 열리면 3초 후 자동으로 닫힘
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-green-600">도착 완료</h2>
          <p className="text-gray-600 mb-4">
            {currentLocation
              ? `${currentLocation}에 도착했습니다.`
              : "목적지에 도착했습니다."}
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
