import { motion } from "framer-motion";

interface LocationCardProps {
  id: string;
  name: string;
  icon?: string;
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
      className={`relative flex h-[260px] w-[260px] rounded-[1.25rem] p-4 flex-col items-start border text-sm font-medium text-white shadow-lg transition-all duration-200 ${
        isDisabled
          ? "cursor-default opacity-20 bg-gray-400"
          : "cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
      }`}
      data-location={name}
    >
      {icon && (
        <div className="mb-3 h-20 w-20 flex items-center justify-center text-4xl">
          {icon}
        </div>
      )}
      <div className="whitespace-pre-line text-2xl font-bold leading-tight">
        {name}
      </div>
      {!isDisabled && (
        <div className="absolute bottom-5 flex h-11 w-54 items-center justify-between rounded-lg bg-white bg-opacity-[0.12] px-5 text-xl font-extralight text-[#E0EAFF] shadow-[1px_1px_2px_0_rgba(0,0,0,0.08)]">
          이동하기
          <span className="ml-2">→</span>
        </div>
      )}
    </motion.div>
  );
}
