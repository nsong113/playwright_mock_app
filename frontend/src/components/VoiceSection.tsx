import { useRecoilValue } from "recoil";
import { streamingTextAtom, isStreamingAtom } from "@/store";
import { useMockSSE } from "@/hooks/useMockSSE";
import { StateMachine } from "./StateMachine";
import { SuggestionCards } from "./SuggestionCards";
import { IoIosSettings } from "react-icons/io";

export function VoiceSection() {
  const streamingText = useRecoilValue(streamingTextAtom);
  const isStreaming = useRecoilValue(isStreamingAtom);
  const { startStream, stopStream } = useMockSSE();

  const handleStartNormal = async () => {
    await startStream(
      "안녕하세요! 로봇 안내 시스템입니다. 어떤 도움이 필요하신가요?",
      "normal"
    );
  };

  const handleStartDelay = async () => {
    await startStream("이 메시지는 지연 모드로 전송됩니다.", "delay");
  };

  const handleStartMissing = async () => {
    await startStream("이 메시지는 일부 청크가 누락될 수 있습니다.", "missing");
  };

  const handleStartDuplicate = async () => {
    await startStream(
      "이 메시지는 일부 청크가 중복될 수 있습니다.",
      "duplicate"
    );
  };

  const handleStartError = async () => {
    await startStream("이 메시지는 중간에 에러가 발생합니다.", "error");
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 영역 */}
      <div className="flex h-[112px] w-full items-start justify-start pl-9 pt-3">
        <div className="flex gap-0 justify-between items-center w-32 h-14">
          <div className="flex justify-center items-center w-14 h-14 bg-white rounded-lg shadow-md">
            <span className="text-2xl">
              <IoIosSettings width={30} height={30} />
            </span>
          </div>
        </div>
      </div>

      {/* 상태 머신 */}
      <div className="px-9 mb-6">
        <StateMachine />
      </div>

      {/* SSE 스트리밍 영역 */}
      <div className="flex flex-col px-9">
        <h3 className="mb-3 text-lg font-semibold text-gray-700">
          SSE 스트리밍 테스트
        </h3>
        <p className="mb-3 text-xs text-gray-500">
          Server-Sent Events를 통해 실시간 텍스트 스트리밍을 테스트합니다. 각
          모드별로 다른 시나리오를 시뮬레이션합니다. 40%의 확률로 500 에러가
          발생하도록 설정했습니다.
        </p>

        {/* 추천 질문 카드 영역 */}
        <div className="flex flex-col mt-4 flex-start">
          <SuggestionCards />
        </div>

        {/* 상태 코드 */}
        <div className="flex flex-wrap gap-2 mb-3 w-full">
          <button
            onClick={handleStartNormal}
            disabled={isStreaming}
            className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            정상
          </button>
          <button
            onClick={handleStartDelay}
            disabled={isStreaming}
            className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            지연
          </button>
          <button
            onClick={handleStartMissing}
            disabled={isStreaming}
            className="px-3 py-1 text-sm text-white bg-orange-500 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            누락
          </button>
          <button
            onClick={handleStartDuplicate}
            disabled={isStreaming}
            className="px-3 py-1 text-sm text-white bg-purple-500 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            중복
          </button>
          <button
            onClick={handleStartError}
            disabled={isStreaming}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50"
          >
            에러
          </button>
          {isStreaming && (
            <button
              onClick={stopStream}
              className="px-3 py-1 text-sm text-white bg-gray-500 rounded hover:bg-gray-600"
            >
              중지
            </button>
          )}
        </div>

        {/* 스트리밍 텍스트 표시 영역 */}
        <div
          className="h-[150px] p-4 bg-white rounded-lg shadow-md border border-gray-200 overflow-y-auto"
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
  );
}
