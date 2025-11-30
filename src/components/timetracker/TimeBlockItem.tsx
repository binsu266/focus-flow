import { motion } from "framer-motion";
import { Category, TimeBlock } from "./types";

interface TimeBlockItemProps {
  block: TimeBlock;
  category: Category | undefined;
  hourHeight: number;
  isSelected: boolean;
  showLabel: boolean;
  compact?: boolean;
  onSelect: (blockId: string) => void;
  onLongPress: (blockId: string) => void;
}

const TimeBlockItem = ({
  block,
  category,
  hourHeight,
  isSelected,
  showLabel,
  compact = false,
  onSelect,
  onLongPress,
}: TimeBlockItemProps) => {
  let pressTimer: NodeJS.Timeout | null = null;

  const handleMouseDown = () => {
    pressTimer = setTimeout(() => {
      onLongPress(block.id);
    }, 500);
  };

  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  };

  const handleClick = () => {
    onSelect(block.id);
  };

  return (
    <motion.div
      className={`absolute ${compact ? "inset-x-0.5" : "left-1 right-1"} ${category?.color} rounded-lg shadow-sm z-10 cursor-pointer ${
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      } ${compact ? "rounded-sm" : ""}`}
      style={{
        height: `${block.duration * hourHeight}px`,
        top: 0,
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: compact ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {showLabel ? (
        <div className="p-2 flex items-center gap-1 h-full">
          <span className="text-lg">{category?.icon}</span>
          <span className="text-sm font-medium">{category?.name}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <span className={compact ? "text-[8px]" : "text-sm"}>{category?.icon}</span>
        </div>
      )}
      
      {/* Resize handles when selected */}
      {isSelected && !compact && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-8 h-2 bg-primary rounded-full cursor-ns-resize" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-8 h-2 bg-primary rounded-full cursor-ns-resize" />
        </>
      )}
    </motion.div>
  );
};

export default TimeBlockItem;
