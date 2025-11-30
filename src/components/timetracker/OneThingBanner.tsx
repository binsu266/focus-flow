import { Pin } from "lucide-react";
import { motion } from "framer-motion";

interface OneThingBannerProps {
  oneThing: string;
  onClick: () => void;
}

const OneThingBanner = ({ oneThing, onClick }: OneThingBannerProps) => {
  return (
    <motion.button
      className="mx-4 mt-4 p-3 bg-destructive/20 rounded-xl flex items-center gap-2 w-[calc(100%-2rem)] text-left"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <Pin className="w-4 h-4 text-destructive rotate-45 shrink-0" />
      <span className="text-sm font-medium flex-1">
        {oneThing ? (
          <>오늘의 one-thing : {oneThing}</>
        ) : (
          <span className="text-muted-foreground">오늘의 one-thing을 설정하세요</span>
        )}
      </span>
    </motion.button>
  );
};

export default OneThingBanner;
