import { RecoilRoot } from "recoil";
import { StateMachine } from "./components/StateMachine";
import { BatteryIndicator } from "./components/BatteryIndicator";
import { SSEViewer } from "./components/SSEViewer";
import { MockBridgeControl } from "./components/MockBridgeControl";
import { RobotControl } from "./components/RobotControl";
import { ErrorModal } from "./components/ErrorModal";
import { MovingModal } from "./components/MovingModal";
import { useMockBridge } from "./hooks/useMockBridge";

function AppContent() {
  // Bridge 이벤트 리스너 초기화
  useMockBridge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          QA Mock Portfolio - Robot Control System
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측 컬럼 */}
          <div className="space-y-6">
            <StateMachine />
            <BatteryIndicator />
            <SSEViewer />
          </div>

          {/* 우측 컬럼 */}
          <div className="space-y-6">
            <RobotControl />
            <MockBridgeControl />
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <ErrorModal />
      <MovingModal />
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
