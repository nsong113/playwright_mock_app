import { useRecoilValue } from "recoil";
import { streamingTextAtom, isStreamingAtom } from "@/store";
import { useMockSSE } from "@/hooks/useMockSSE";

export function SSEViewer() {
  const streamingText = useRecoilValue(streamingTextAtom);
  const isStreaming = useRecoilValue(isStreamingAtom);
  const { startStream, stopStream } = useMockSSE();

  const handleStartNormal = () => {
    startStream(
      "This is a normal streaming response. Each word appears gradually.",
      "normal"
    );
  };

  const handleStartDelay = () => {
    startStream(
      "This is a delayed streaming response. Each chunk has a longer delay.",
      "delay"
    );
  };

  const handleStartMissing = () => {
    startStream(
      "This streaming response has some missing chunks in the middle.",
      "missing"
    );
  };

  const handleStartDuplicate = () => {
    startStream("This streaming response has duplicate chunks.", "duplicate");
  };

  const handleStartError = () => {
    startStream("This streaming response will error in the middle.", "error");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">SSE 스트리밍</h2>

      <div className="mb-3 flex gap-2 flex-wrap">
        <button
          onClick={handleStartNormal}
          disabled={isStreaming}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          정상 모드
        </button>
        <button
          onClick={handleStartDelay}
          disabled={isStreaming}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          지연 모드
        </button>
        <button
          onClick={handleStartMissing}
          disabled={isStreaming}
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          누락 모드
        </button>
        <button
          onClick={handleStartDuplicate}
          disabled={isStreaming}
          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          중복 모드
        </button>
        <button
          onClick={handleStartError}
          disabled={isStreaming}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          에러 모드
        </button>
        {isStreaming && (
          <button
            onClick={stopStream}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            중지
          </button>
        )}
      </div>

      <div
        className="min-h-[100px] p-3 bg-gray-50 rounded border border-gray-200"
        data-streaming={isStreaming}
      >
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse mr-1" />
        )}
        <span className="streaming-text">
          {streamingText || "스트리밍을 시작하세요..."}
        </span>
      </div>
    </div>
  );
}
