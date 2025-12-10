import { RecoilRoot } from "recoil";
import { VoiceSection } from "./components/VoiceSection";
import { GuideSection } from "./components/GuideSection";
import { ErrorModal } from "./components/ErrorModal";
import { MovingModal } from "./components/MovingModal";
import { ArrivalModal } from "./components/ArrivalModal";
import { EventLogPanel } from "./components/EventLogPanel";
import { NetworkToggle } from "./components/NetworkToggle";
import { ResetSeedControls } from "./components/ResetSeedControls";
import { useMockBridge } from "./hooks/useMockBridge";
import { useNetworkStatus } from "./hooks/useNetworkStatus";

function AppContent() {
  // Bridge 이벤트 리스너 초기화
  useMockBridge();
  // 네트워크 상태 관리
  useNetworkStatus();

  return (
    <div className="flex flex-col w-screen h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="flex flex-1 w-full">
        {/* 좌측 영역 - 608px */}
        <div className="w-[608px] bg-gradient-to-b from-[#c0d3fe] via-[#ebe5ff] to-[#d7f5fb]">
          <VoiceSection />
        </div>

        {/* 우측 영역 - 1312px */}
        <div
          id="right-pane"
          className="relative flex w-[1312px] flex-col bg-primary"
        >
          <GuideSection />
        </div>
      </div>

      {/* 모달들 */}
      <ErrorModal />
      <MovingModal />
      <ArrivalModal />

      {/* 컨트롤 패널 (상단 우측) */}
      <div className="flex fixed top-4 right-4 z-40 gap-3 items-center">
        <ResetSeedControls />
        <NetworkToggle />
      </div>

      {/* 이벤트 로그 패널 */}
      <EventLogPanel />
    </div>
  );
}

function App() {
  return (
    <RecoilRoot>
      <AppContent />
    </RecoilRoot>
  );
}

export default App;
