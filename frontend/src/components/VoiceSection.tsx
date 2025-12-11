import { useRecoilValue, useRecoilState } from "recoil";
import { streamingTextAtom, isStreamingAtom, selectedModeAtom } from "@/store";
import { useMockSSE } from "@/hooks/useMockSSE";
import { StateMachine } from "./StateMachine";
import { SuggestionCards } from "./SuggestionCards";
import { SSEMode } from "@/types";
import { SSE_MODES } from "@/utils/constants";

export function VoiceSection() {
  const streamingText = useRecoilValue(streamingTextAtom);
  const isStreaming = useRecoilValue(isStreamingAtom);
  const [selectedMode, setSelectedMode] = useRecoilState(selectedModeAtom);

  const { stopStream } = useMockSSE();

  const handleModeSelect = (mode: SSEMode) => {
    // 스트리밍 중이면 먼저 중단
    if (isStreaming) {
      stopStream();
    }
    setSelectedMode(mode);
  };

  return (
    <div className="flex flex-col mb-10 h-full">
      {/* 상태 머신 */}
      <div className="px-9 mt-10 mb-6">
        <StateMachine />
      </div>

      {/* SSE 스트리밍 영역 */}
      <div className="flex flex-col px-9">
        <div className="mb-3">
          <div className="flex gap-2 items-center mb-1">
            <h3 className="text-lg font-semibold text-gray-700">
              ② LLM 응답 스트리밍(SSE) 장애 재현
            </h3>
          </div>
          <p className="mb-3 text-xs text-gray-600">
            <span className="font-semibold text-blue-600">정상</span>·
            {/* <span className="font-semibold text-orange-600">누락</span>· */}
            <span className="font-semibold text-yellow-600">지연</span>·
            <span className="font-semibold text-red-600">에러</span> 스트리밍을
            재현해 LLM 응답 표시를 테스트합니다.{" "}
            <span className="text-[10px] text-gray-400">
              (15% 확률로 500 에러 발생)
            </span>
          </p>
        </div>

        <div
          className="flex flex-col justify-center items-center py-4 pb-4 mb-2 w-full h-full"
          style={{
            borderRadius: "8px",
            border: "1px solid #E8E8E8",
            background: "rgba(255, 255, 255, 0.20)",
          }}
        >
          {/* 상태 코드 */}
          <div className="flex flex-wrap gap-4 justify-center mt-3 mb-3 w-full">
            {SSE_MODES.map((modeConfig) => {
              const isSelected = selectedMode === modeConfig.value;
              const colorClasses = {
                normal: "bg-blue-500 hover:bg-blue-600 ring-blue-300",
                delay: "bg-yellow-500 hover:bg-yellow-600 ring-yellow-300",
                error: "bg-red-500 hover:bg-red-600 ring-red-300",
              }[modeConfig.value];

              return (
                <div
                  key={modeConfig.value}
                  className="flex flex-col gap-1 items-center"
                >
                  <button
                    onClick={() => handleModeSelect(modeConfig.value)}
                    className={`px-3 py-1 text-sm text-white rounded ${colorClasses} ${
                      isSelected ? "ring-2 ring-offset-2" : ""
                    }`}
                  >
                    {modeConfig.label}
                  </button>
                  <span className="text-[10px] text-gray-400">
                    {modeConfig.description}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 추천 질문 카드 영역 */}
          <div className="flex flex-col mt-2 mb-4 w-full flex-start">
            <SuggestionCards />
          </div>
          {/* 스트리밍 텍스트 표시 영역 */}
          <div
            className="h-[150px] w-[calc(100%-80px)] p-4 my-4 mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto"
            data-streaming={isStreaming}
          >
            {isStreaming && (
              <span className="inline-block mr-1 w-2 h-4 bg-blue-500 animate-pulse" />
            )}
            <span className="text-gray-800 streaming-text">
              {streamingText || "스트리밍을 시작하세요..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
