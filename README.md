# QA Mock Portfolio - Robot Control System

Playwright 자동화 테스트 포트폴리오용 Mock 애플리케이션

## 프로젝트 구조

```
qa-mock-portfolio/
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/    # UI 컴포넌트
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Recoil 상태 관리
│   │   └── types/         # TypeScript 타입 정의
│   └── package.json
├── mock-server/       # Express Mock 서버
│   ├── src/
│   │   ├── routes/        # API 라우트
│   │   └── index.ts       # 서버 진입점
│   └── package.json
└── README.md
```

## 주요 기능

### 1. 상태 머신

- **상태**: IDLE, MOVING, STANDBY, ERROR, CHARGING
- 상태 전환 시각화 및 실시간 업데이트

### 2. Mock SSE 서버

- **정상 모드**: 일반적인 스트리밍 응답
- **지연 모드**: 각 청크 사이 긴 지연
- **누락 모드**: 일부 청크 건너뛰기
- **중복 모드**: 일부 청크 중복 전송
- **에러 모드**: 중간에 연결 끊김 시뮬레이션

### 3. Mock Bridge 이벤트

- `onArrival`: 로봇 도착 이벤트
- `onBatteryUpdated`: 배터리 레벨 업데이트
- `onBatteryStatusChanged`: 충전 상태 변경
- `onStandbyModeUpdated`: 대기 모드 전환
- `onError`: 에러 발생

### 4. UI 컴포넌트

- **StateMachine**: 로봇 상태 표시
- **BatteryIndicator**: 배터리 레벨 및 충전 상태
- **SSEViewer**: SSE 스트리밍 테스트 UI
- **RobotControl**: 로봇 이동 제어
- **MockBridgeControl**: Bridge 이벤트 수동 트리거
- **ErrorModal**: 에러 모달
- **MovingModal**: 이동 중 모달

## 시작하기

### 1. 의존성 설치

```bash
# 프론트엔드
cd frontend
yarn install

# Mock 서버
cd ../mock-server
yarn install
```

### 2. 개발 서버 실행

**터미널 1 - Mock 서버:**

```bash
cd mock-server
yarn dev
```

서버는 `http://localhost:3001`에서 실행됩니다.

**터미널 2 - 프론트엔드:**

```bash
cd frontend
yarn dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 3. 사용 방법

1. 브라우저에서 `http://localhost:3000` 접속
2. **로봇 이동 제어**: 위치 버튼 클릭하여 이동 시뮬레이션
3. **SSE 스트리밍**: 다양한 모드로 스트리밍 테스트
4. **Bridge 이벤트**: Mock Bridge Control에서 이벤트 수동 트리거

## 기술 스택

- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - Recoil (상태 관리)
  - Tailwind CSS
- **Mock Server**:
  - Express
  - TypeScript
  - Server-Sent Events (SSE)
  - CORS

## API 엔드포인트

### SSE 스트리밍

```
GET /api/stream/chat?mode=normal|delay|missing|duplicate|error&message=텍스트
```

### Bridge 이벤트 (테스트용)

```
POST /api/bridge/arrival
POST /api/bridge/battery
POST /api/bridge/standby
POST /api/bridge/error
```

## 커밋 전략 제안

포트폴리오용이므로 기능별로 커밋을 나누는 것을 권장합니다:

1. 프로젝트 초기 설정
2. Mock 서버 기본 구조
3. SSE 스트리밍 구현
4. 상태 머신 구현
5. Bridge 이벤트 시스템
6. UI 컴포넌트 구현
7. 통합 및 개선
