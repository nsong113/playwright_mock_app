import { useRecoilState, useSetRecoilState } from "recoil";
import { helpModalOpenAtom } from "@/store";
import { IoClose, IoHelpCircleOutline } from "react-icons/io5";

export function HelpButton() {
  const setIsOpen = useSetRecoilState(helpModalOpenAtom);

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
      title="사용 방법"
    >
      <IoHelpCircleOutline className="w-4 h-4" />
      <span>사용 방법</span>
    </button>
  );
}

export function HelpModal() {
  const [isOpen, setIsOpen] = useRecoilState(helpModalOpenAtom);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">사용 방법</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">전체 플로우</h3>
            <p>
              이 앱에서는 ① 로봇 이동 → ② 스트리밍 품질 → ③ Bridge 이벤트를
              인위적으로 깨뜨려 보고, 로그와 UI가 정상적으로 반응하는지
              확인합니다.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">사용 예시</h3>
            <p>
              로봇을 Location A로 보낸 뒤 → SSE를 지연 모드로 재생 → 배터리 10%
              이벤트 발생 → 로그에서 상태·시간이 올바른지 확인
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">① 로봇 이동</h3>
            <p className="text-xs text-gray-600">
              위치 버튼을 눌러 로봇 이동을 시뮬레이션하고, 상태·이벤트 로그가
              제대로 갱신되는지 테스트합니다.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              ② SSE 스트리밍{" "}
              <span className="font-normal text-gray-500">(LLM 응답)</span>
            </h3>
            <p className="text-xs text-gray-600">
              지연·누락·중복·에러 스트리밍을 재현해 LLM 응답 표시를
              테스트합니다.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              ③ Bridge 이벤트{" "}
              <span className="font-normal text-gray-500">(로봇 ↔ 앱)</span>
            </h3>
            <p className="text-xs text-gray-600">
              도착·배터리·에러 이벤트를 수동으로 발생시켜 UI와 로그 반응을
              테스트합니다.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
