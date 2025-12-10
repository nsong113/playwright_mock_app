import { useSetRecoilState } from "recoil";
import { networkErrorModalOpenAtom } from "@/store";
import { useEventLogger } from "./useEventLogger";

export function useSuggestions() {
  const setNetworkErrorModalOpen = useSetRecoilState(networkErrorModalOpenAtom);
  const { logEvent } = useEventLogger();

  // 재시도 핸들러 (NetworkErrorModal에서 사용)
  const handleRetry = () => {
    // 재시도는 실제로는 질문을 다시 선택해야 하므로 여기서는 모달만 닫음
    setNetworkErrorModalOpen(false);
    logEvent("event", "network", "네트워크 에러 모달 닫기", {});
  };

  return { handleRetry };
}
