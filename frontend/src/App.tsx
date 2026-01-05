import { RecoilRoot, useRecoilValue, useSetRecoilState } from "recoil";
import { VoiceSection } from "./components/VoiceSection";
import { GuideSection } from "./components/GuideSection";
import { ErrorModal } from "./components/ErrorModal";
import { MovingModal } from "./components/MovingModal";
import { ArrivalModal } from "./components/ArrivalModal";
import { BatteryWarningModal } from "./components/BatteryWarningModal";
import { BatteryInsufficientModal } from "./components/BatteryInsufficientModal";
import { NetworkErrorModal } from "./components/NetworkErrorModal";
import { EventLogPanel } from "./components/EventLogPanel";
import { HelpButton, HelpModal } from "./components/HelpModal";
import { LoginForm } from "./components/LoginForm";
import { useMockBridge } from "./hooks/useMockBridge";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { useSuggestions } from "./hooks/useSuggestions";
import { isAuthenticatedAtom, authTokenAtom } from "./store";
import { useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "./utils/constants";

function LogoutButton() {
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom);
  const setAuthToken = useSetRecoilState(authTokenAtom);

  const handleLogout = async () => {
    try {
      await axios.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      // 로그아웃 실패해도 클라이언트에서는 로그아웃 처리
      console.error("Logout error:", err);
    } finally {
      setIsAuthenticated(false);
      setAuthToken(null);
      localStorage.removeItem("authToken");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
    >
      로그아웃
    </button>
  );
}

function AuthenticatedApp() {
  // Bridge 이벤트 리스너 초기화
  useMockBridge();
  // 네트워크 상태 관리
  useNetworkStatus();
  // 네트워크 에러 모달 재시도 핸들러
  const { handleRetry } = useSuggestions();

  return (
    <div className="flex flex-col w-screen h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 최상단 배너 */}
      <div className="relative px-8 py-4 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              하이브리드 안내 로봇 QA Mock 콘솔
            </h1>
            <HelpButton />
          </div>
          <LogoutButton />
        </div>
        <p className="text-sm text-gray-600">
          실제 안내 로봇 프로젝트에서 겪은 스트리밍·이벤트·상태 이슈를 재현하고
          자동화 테스트를 위한 QA 포트폴리오용 Mock 콘솔입니다.
        </p>
      </div>

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
      <BatteryWarningModal />
      <BatteryInsufficientModal />
      <NetworkErrorModal onRetry={handleRetry} />
      <HelpModal />

      {/* 이벤트 로그 패널 */}
      <EventLogPanel />
    </div>
  );
}

function AppContent() {
  const isAuthenticated = useRecoilValue(isAuthenticatedAtom);
  const setIsAuthenticated = useSetRecoilState(isAuthenticatedAtom);
  const setAuthToken = useSetRecoilState(authTokenAtom);

  // 페이지 로드 시 localStorage에서 토큰 확인
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthenticated(true);
    }
  }, [setAuthToken, setIsAuthenticated]);

  // 인증되지 않은 경우 로그인 화면 표시
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <RecoilRoot>
      <AppContent />
    </RecoilRoot>
  );
}

export default App;
