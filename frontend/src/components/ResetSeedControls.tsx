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
    <div className="flex gap-2 items-center">
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg shadow-md transition-colors hover:bg-gray-700"
        title="모든 상태 초기화"
      >
        🔄 Reset
      </button>

      <div className="flex gap-2 items-center">
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
          className="px-3 py-2 w-32 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleSeed}
          disabled={!seedValue.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg shadow-md transition-colors hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          title="시드 기반 시나리오 재현"
        >
          🌱 Seed
        </button>
      </div>
    </div>
  );
}
