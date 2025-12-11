import { useRecoilValue } from "recoil";
import { suggestionsAtom, selectedModeAtom, isStreamingAtom } from "@/store";
import { useMockSSE } from "@/hooks/useMockSSE";

export function SuggestionCards() {
  const suggestions = useRecoilValue(suggestionsAtom);
  const selectedMode = useRecoilValue(selectedModeAtom);
  const isStreaming = useRecoilValue(isStreamingAtom);
  const { startStream, stopStream } = useMockSSE();

  if (suggestions.length === 0) return null;

  const handleSuggestionClick = async (text: string) => {
    // 스트리밍 중이면 먼저 중단
    if (isStreaming) {
      stopStream();
      // 중단 후 잠시 대기 (상태 정리 시간)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    await startStream(text, selectedMode);
  };

  return (
    <div className="px-9">
      <div className="flex flex-col gap-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleSuggestionClick(suggestion.text)}
            className="px-4 py-3 text-left font-medium hover:scale-[1.02] transition-all duration-200 backdrop-blur-sm"
            style={{
              textAlign: "center",
              borderRadius: "40px",
              border: "1px solid #FFF",
              background:
                "linear-gradient(92deg, rgba(255, 255, 255, 0.42) 5.05%, rgba(255, 255, 255, 0.52) 91.92%)",
              boxShadow: "1px 1px 6px 0 rgba(0, 81, 255, 0.20)",
              color: "#4A90E2",
            }}
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  );
}
