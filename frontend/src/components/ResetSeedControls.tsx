import { useResetAndSeed } from "@/hooks/useResetAndSeed";
import { useState } from "react";

export function ResetSeedControls() {
  const { reset, seed } = useResetAndSeed();
  const [seedValue, setSeedValue] = useState("");

  const handleSeed = () => {
    if (seedValue.trim()) {
      seed(seedValue.trim());
      setSeedValue("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={reset}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transition-colors font-medium text-sm"
        title="모든 상태 초기화"
      >
        🔄 Reset
      </button>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={seedValue}
          onChange={(e) => setSeedValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSeed();
            }
          }}
          placeholder="시드 입력..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
        />
        <button
          onClick={handleSeed}
          disabled={!seedValue.trim()}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow-md transition-colors font-medium text-sm"
          title="시드 기반 시나리오 재현"
        >
          🌱 Seed
        </button>
      </div>
    </div>
  );
}
