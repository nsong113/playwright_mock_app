import { motion } from "framer-motion";
import { ReactElement } from "react";

interface LocationCardProps {
  id: string;
  name: string;
  icon?: ReactElement;
  onClick: () => void;
  isDisabled?: boolean;
}

export function LocationCard({
  name,
  icon,
  onClick,
  isDisabled,
}: LocationCardProps) {
  return (
    <motion.div
      onPointerUp={onClick}
      whileHover={isDisabled ? {} : { scale: 1.05 }}
      whileTap={isDisabled ? {} : { scale: 0.95 }}
      className={`relative flex h-[208px] w-[208px] p-4 flex-col items-start border text-sm font-medium text-white transition-all duration-200 ${
        isDisabled ? "bg-gray-400 opacity-20 cursor-default" : "cursor-pointer"
      }`}
      style={
        !isDisabled
          ? {
              borderRadius: "20px",
              background:
                name === "Home Base"
                  ? "linear-gradient(136deg, #00CDAD 2.49%, #07C8CE 96.9%)"
                  : "var(--primary_color2, linear-gradient(135deg, #5899FD 0%, #2B7FFF 100%))",
              boxShadow: "2px 2px 2px 0 rgba(7, 152, 255, 0.12)",
            }
          : {
              borderRadius: "20px",
            }
      }
      data-location={name}
    >
      {icon && (
        <div className="flex justify-center items-center mb-2 w-16 h-16 text-4xl">
          {icon}
        </div>
      )}
      <div className="text-xl font-bold leading-tight whitespace-pre-line">
        {name}
      </div>
      {!isDisabled && (
        <div className="absolute bottom-4 flex h-9 w-[11rem] items-center justify-between rounded-lg bg-white bg-opacity-[0.12] px-4 text-lg font-extralight text-[#E0EAFF] shadow-[1px_1px_2px_0_rgba(0,0,0,0.08)]">
          이동하기
          <span className="ml-2">→</span>
        </div>
      )}
    </motion.div>
  );
}
