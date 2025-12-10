import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  robotStateAtom,
  batteryLevelAtom,
  batteryInsufficientModalOpenAtom,
  targetLocationAtom,
} from "@/store";
import { LocationCard } from "./LocationCard";
import { BatteryIndicator } from "./BatteryIndicator";
import { MockBridgeControl } from "./MockBridgeControl";
import { useEventLogger } from "@/hooks/useEventLogger";
import { MdLocationOn, MdBusiness, MdFactory, MdHome } from "react-icons/md";

const locations = [
  { id: "home-base", name: "Home Base", icon: <MdHome /> },
  { id: "location-a", name: "Location A", icon: <MdLocationOn /> },
  { id: "location-b", name: "Location B", icon: <MdBusiness /> },
  { id: "location-c", name: "Location C", icon: <MdFactory /> },
];

export function GuideSection() {
  const [robotState, setRobotState] = useRecoilState(robotStateAtom);
  const batteryLevel = useRecoilValue(batteryLevelAtom);
  const setBatteryInsufficientModalOpen = useRecoilState(
    batteryInsufficientModalOpenAtom
  )[1];
  const setTargetLocation = useSetRecoilState(targetLocationAtom);
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
    // 여기서는 시뮬레이션을 위해 3초 후 자동으로 도착 이벤트 트리거
    setTimeout(() => {
      if (window.onArrival) {
        window.onArrival(location);
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col w-full h-full bg-primary">
      {/* 헤더 */}
      <div className="mt-[30px] flex h-[6rem] w-full items-center justify-end gap-5 bg-primary px-6">
        <BatteryIndicator />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 px-12 pb-12">
        <div className="flex flex-col items-start w-full h-full">
          {/* 위치 카드 그리드 */}
          <div className="flex justify-center w-full">
            <div className="grid grid-cols-4 gap-x-6 gap-y-6">
              {locations.map((location) => (
                <LocationCard
                  key={location.id}
                  id={location.id}
                  name={location.name}
                  icon={location.icon}
                  onClick={() => handleLocationClick(location.name)}
                  isDisabled={robotState === "MOVING"}
                />
              ))}
            </div>
          </div>

          {/* Mock Bridge Control (하단에 작게) */}
          <div className="mt-8 w-full">
            <MockBridgeControl />
          </div>
        </div>
      </div>
    </div>
  );
}
