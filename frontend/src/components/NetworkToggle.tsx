import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { NetworkStatus } from "@/types";

const statusConfig: Record<
  NetworkStatus,
  { label: string; color: string; icon: string }
> = {
  online: {
    label: "Online",
    color: "bg-green-500 hover:bg-green-600",
    icon: "🟢",
  },
  offline: {
    label: "Offline",
    color: "bg-red-500 hover:bg-red-600",
    icon: "🔴",
  },
  slow: {
    label: "Slow",
    color: "bg-yellow-500 hover:bg-yellow-600",
    icon: "🟡",
  },
};

export function NetworkToggle() {
  const { networkStatus, setNetworkStatus } = useNetworkStatus();

  const cycleStatus = () => {
    const statuses: NetworkStatus[] = ["online", "offline", "slow"];
    const currentIndex = statuses.indexOf(networkStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setNetworkStatus(statuses[nextIndex]);
  };

  const config = statusConfig[networkStatus];

  return (
    <button
      onClick={cycleStatus}
      className={`${config.color} text-white px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2 font-medium text-sm`}
      title="네트워크 상태 토글 (Online → Offline → Slow)"
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </button>
  );
}
