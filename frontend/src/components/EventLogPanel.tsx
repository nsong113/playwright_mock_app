import { useRecoilValue } from "recoil";
import { eventLogsAtom } from "@/store";
import { EventLog } from "@/types";

const categoryColors: Record<EventLog["category"], string> = {
  bridge: "bg-blue-100 text-blue-800 border-blue-300",
  sse: "bg-green-100 text-green-800 border-green-300",
  network: "bg-orange-100 text-orange-800 border-orange-300",
  system: "bg-gray-100 text-gray-800 border-gray-300",
};

const typeIcons: Record<EventLog["type"], string> = {
  event: "📢",
  "state-change": "🔄",
};

export function EventLogPanel() {
  const logs = useRecoilValue(eventLogsAtom);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const timeString = date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const ms = date.getMilliseconds().toString().padStart(3, "0");
    return `${timeString}.${ms}`;
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-80 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* 헤더 */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between rounded-t-lg">
        <h3 className="text-sm font-semibold text-gray-700">이벤트 로그</h3>
        <span className="text-xs text-gray-500">{logs.length}개</span>
      </div>

      {/* 로그 리스트 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {logs.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            로그가 없습니다
          </div>
        ) : (
          logs
            .slice()
            .reverse()
            .map((log) => (
              <div
                key={log.id}
                className={`text-xs p-2 rounded border ${
                  categoryColors[log.category]
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base">{typeIcons[log.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium truncate">
                        {log.message}
                      </span>
                      <span className="text-xs opacity-70 flex-shrink-0">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-xs opacity-80 mt-1 truncate">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
