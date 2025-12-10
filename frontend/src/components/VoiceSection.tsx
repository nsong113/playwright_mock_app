import { useRecoilValue } from "recoil";
import { streamingTextAtom, isStreamingAtom } from "@/store";
import { useMockSSE } from "@/hooks/useMockSSE";
import { StateMachine } from "./StateMachine";

export function VoiceSection() {
  const streamingText = useRecoilValue(streamingTextAtom);
  const isStreaming = useRecoilValue(isStreamingAtom);
  const { startStream, stopStream } = useMockSSE();

  const handleStartNormal = () => {
    startStream(
      "안녕하세요! 로봇 안내 시스템입니다. 어떤 도움이 필요하신가요?",
      "normal"
    );
  };

  const handleStartDelay = () => {
    startStream("이 메시지는 지연 모드로 전송됩니다.", "delay");
  };

  const handleStartError = () => {
    startStream("이 메시지는 중간에 에러가 발생합니다.", "error");
  };

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 영역 */}
      <div className="flex h-[112px] w-full items-start justify-start pl-9 pt-3">
        <div className="flex h-14 w-32 items-center justify-between gap-0">
          <div className="h-14 w-14 rounded-lg bg-white shadow-md flex items-center justify-center">
            <span className="text-2xl">⚙️</span>
          </div>
        </div>
      </div>

      {/* 상태 머신 */}
      <div className="px-9 mb-6">
        <StateMachine />
      </div>

      {/* SSE 스트리밍 영역 */}
      <div className="flex-1 px-9 flex flex-col">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          스트리밍 테스트
        </h3>

        <div className="mb-3 flex gap-2 flex-wrap">
          <button
            onClick={handleStartNormal}
            disabled={isStreaming}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
          >
            정상
          </button>
          <button
            onClick={handleStartDelay}
            disabled={isStreaming}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
          >
            지연
          </button>
          <button
            onClick={handleStartError}
            disabled={isStreaming}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
          >
            에러
          </button>
          {isStreaming && (
            <button
              onClick={stopStream}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              중지
            </button>
          )}
        </div>

        {/* 스트리밍 텍스트 표시 영역 */}
        <div
          className="flex-1 min-h-[200px] p-4 bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto"
          data-streaming={isStreaming}
        >
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse mr-1" />
          )}
          <span className="streaming-text text-gray-800">
            {streamingText || "스트리밍을 시작하세요..."}
          </span>
        </div>
      </div>
    </div>
  );
}
