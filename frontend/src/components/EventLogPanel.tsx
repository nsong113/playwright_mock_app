import { useRecoilValue } from "recoil";
import { eventLogsAtom } from "@/store";
import { EventLog } from "@/types";
import { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

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

// 심각도에 따른 색상 결정
function getSeverityColor(log: EventLog): string {
  const message = log.message.toLowerCase();
  const details = log.details || {};

  // 상태 변경: IDLE로 변경되면 초록색
  if (log.type === "state-change" && details.to === "IDLE") {
    return "bg-green-100 text-green-800 border-green-300";
  }

  // 네트워크 상태: online은 초록색, offline은 빨간색, slow는 주황색
  if (log.category === "network" && message.includes("네트워크 상태 변경")) {
    if (details.status === "online" || message.includes("online")) {
      return "bg-green-100 text-green-800 border-green-300";
    } else if (
      details.status === "offline" ||
      message.includes("offline") ||
      message.includes("오프라인")
    ) {
      return "bg-red-100 text-red-800 border-red-300";
    } else if (details.status === "slow" || message.includes("slow")) {
      return "bg-orange-100 text-orange-800 border-orange-300";
    }
  }

  // 에러: 빨간색
  if (
    message.includes("에러") ||
    message.includes("error") ||
    message.includes("실패") ||
    message.includes("failed") ||
    message.includes("offline") ||
    message.includes("오프라인")
  ) {
    return "bg-red-100 text-red-800 border-red-300";
  }

  // 배터리 레벨에 따른 색상
  if (message.includes("배터리") && typeof details.level === "number") {
    const level = details.level;
    if (level < 10) {
      return "bg-red-100 text-red-800 border-red-300"; // 10% 미만: 빨간색
    } else if (level <= 25) {
      return "bg-orange-100 text-orange-800 border-orange-300"; // 25% 이하: 주황색
    }
  }

  // 경고: 주황색
  if (
    message.includes("경고") ||
    message.includes("warning") ||
    message.includes("slow") ||
    message.includes("지연")
  ) {
    return "bg-orange-100 text-orange-800 border-orange-300";
  }

  // 기본 카테고리 색상
  return categoryColors[log.category];
}

function LogItem({ log }: { log: EventLog }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = log.details && Object.keys(log.details).length > 0;
  const severityColor = getSeverityColor(log);

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

  const formatJSON = (obj: Record<string, unknown>) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <div
      className={`text-xs rounded border transition-all ${severityColor} ${
        hasDetails ? "cursor-pointer hover:shadow-sm" : ""
      }`}
      onClick={() => hasDetails && setIsExpanded(!isExpanded)}
    >
      <div className="p-2">
        <div className="flex items-start gap-2">
          <span className="text-base flex-shrink-0">{typeIcons[log.type]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-medium break-words">{log.message}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {hasDetails && (
                  <span className="text-xs">
                    {isExpanded ? (
                      <IoChevronUp className="inline" />
                    ) : (
                      <IoChevronDown className="inline" />
                    )}
                  </span>
                )}
                <span className="text-xs opacity-70">
                  {formatTime(log.timestamp)}
                </span>
              </div>
            </div>
            {hasDetails && isExpanded && log.details && (
              <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                <div className="text-xs font-semibold mb-1 opacity-80">
                  페이로드:
                </div>
                <pre className="text-xs bg-black bg-opacity-10 rounded p-2 overflow-x-auto whitespace-pre-wrap break-words">
                  {formatJSON(log.details)}
                </pre>
              </div>
            )}
            {hasDetails && !isExpanded && log.details && (
              <div className="text-xs opacity-60 mt-1">
                {Object.keys(log.details).length}개 필드 • 클릭하여 확장
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventLogPanel() {
  const logs = useRecoilValue(eventLogsAtom);

  return (
    <div className="fixed bottom-4 right-4 w-[500px] max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
      {/* 헤더 */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-800">
            ④ 로봇 이벤트 로그 (테스트 결과)
          </h3>
          <span className="text-xs text-gray-500">{logs.length}개</span>
        </div>
        <p className="text-xs text-gray-600">
          위에서 발생시킨 이동·Bridge·SSE 이벤트가 시간순으로 기록됩니다.
          Playwright 자동화에서 검증 대상이 되는 로그입니다.
        </p>
      </div>

      {/* 로그 리스트 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {logs.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            로그가 없습니다
          </div>
        ) : (
          logs
            .slice()
            .reverse()
            .map((log) => <LogItem key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
}
