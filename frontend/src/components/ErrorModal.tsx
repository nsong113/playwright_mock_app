import { useRecoilState } from "recoil";
import { errorAtom } from "@/store";

export function ErrorModal() {
  const [error, setError] = useRecoilState(errorAtom);

  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-red-600 mb-3">오류 발생</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">에러 코드:</p>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded">
            {error.code}
          </p>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">에러 메시지:</p>
          <p className="text-sm bg-gray-100 p-2 rounded">{error.message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setError(null)}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            닫기
          </button>
          <button
            onClick={() => {
              setError(null);
              // 재시도 로직 (필요시)
              window.location.reload();
            }}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            재시도
          </button>
        </div>
      </div>
    </div>
  );
}
