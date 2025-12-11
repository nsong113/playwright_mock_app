import { useRecoilValue } from "recoil";
import { networkErrorModalOpenAtom } from "@/store";

interface NetworkErrorModalProps {
  onRetry: () => void;
}

export function NetworkErrorModal({ onRetry }: NetworkErrorModalProps) {
  const isOpen = useRecoilValue(networkErrorModalOpenAtom);

  if (!isOpen) return null;

  const handleRetry = () => {
    onRetry();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="inline-block w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-red-600">네트워크 오류</h2>
          <p className="text-gray-600 mb-4">
            네트워크 오류가 발생했습니다.
            <br />
            다시 시도해주세요.
          </p>
          <button
            onClick={handleRetry}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
}
