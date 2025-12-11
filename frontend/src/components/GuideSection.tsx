import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  robotStateAtom,
  batteryLevelAtom,
  batteryInsufficientModalOpenAtom,
  targetLocationAtom,
  movementTimeoutIdAtom,
} from "@/store";
import { LocationCard } from "./LocationCard";
import { BatteryIndicator } from "./BatteryIndicator";
import { MockBridgeControl } from "./MockBridgeControl";
import { NetworkToggle } from "./NetworkToggle";
import { useEventLogger } from "@/hooks/useEventLogger";
import { LOCATIONS, MOVEMENT_DURATION_MS } from "@/utils/constants";
import { MdLocationOn, MdBusiness, MdHome } from "react-icons/md";

const locationIcons: Record<string, JSX.Element> = {
  "charging-station": <MdHome />,
  "location-a": <MdLocationOn />,
  "location-b": <MdBusiness />,
};

export function GuideSection() {
  const [robotState, setRobotState] = useRecoilState(robotStateAtom);
  const batteryLevel = useRecoilValue(batteryLevelAtom);
  const setBatteryInsufficientModalOpen = useRecoilState(
    batteryInsufficientModalOpenAtom
  )[1];
  const setTargetLocation = useSetRecoilState(targetLocationAtom);
  const setMovementTimeoutId = useSetRecoilState(movementTimeoutIdAtom);
  const { logEvent } = useEventLogger();

  const handleLocationClick = (location: string) => {
    if (robotState === "MOVING") {
      return; // 이미 이동 중이면 무시
    }

    // 배터리가 10% 이하면 이동 방지 (CHARGING 상태여도)
    if (batteryLevel <= 10) {
      setBatteryInsufficientModalOpen(true);
      logEvent("event", "bridge", "배터리 부족으로 이동 취소", {
        batteryLevel,
        attemptedLocation: location,
        robotState,
      });
      return;
    }

    logEvent("event", "bridge", `이동 시작: ${location}`, { location });
    setRobotState("MOVING");
    setTargetLocation(location); // 이동 목적지 설정
    // 실제로는 Bridge를 통해 이동 명령을 보내고, 도착 이벤트를 기다림
    // 여기서는 시뮬레이션을 위해 일정 시간 후 자동으로 도착 이벤트 트리거
    const timeoutId = setTimeout(() => {
      if (window.onArrival) {
        window.onArrival(location);
      }
      setMovementTimeoutId(null); // timeout 완료 후 초기화
    }, MOVEMENT_DURATION_MS);
    setMovementTimeoutId(timeoutId); // timeout ID 저장
  };

  return (
    <div className="flex flex-col w-full h-full bg-primary">
      {/* 헤더 */}
      <div className=" flex h-[4rem] w-full items-center justify-end gap-5 bg-primary px-6">
        <BatteryIndicator />
        <NetworkToggle />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-12 pb-12">
        <div className="flex flex-col items-start w-full h-full">
          {/* 위치 이동 시뮬레이션 섹션 */}
          <div className="mb-4 w-full">
            <h2 className="mb-1 text-lg font-semibold text-gray-800">
              ① 로봇 위치 이동 시뮬레이션
            </h2>
            <p className="text-sm text-gray-600">
              각 위치 버튼을 눌러 로봇 이동을 시뮬레이션하고, 상태·이벤트 로그가
              제대로 갱신되는지 테스트합니다.
            </p>
          </div>

          {/* 위치 카드 그리드 */}
          <div className="flex justify-start w-full">
            <div className="grid grid-cols-4 gap-x-6 gap-y-6">
              {LOCATIONS.map((location) => (
                <LocationCard
                  key={location.id}
                  id={location.id}
                  name={location.name}
                  icon={locationIcons[location.id]}
                  onClick={() => handleLocationClick(location.name)}
                  isDisabled={robotState === "MOVING"}
                />
              ))}
            </div>
          </div>

          {/* Mock Bridge Control (하단에 작게) */}
          <div className="mt-8 w-full pr-[540px]">
            <MockBridgeControl />
          </div>
        </div>
      </div>
    </div>
  );
}
