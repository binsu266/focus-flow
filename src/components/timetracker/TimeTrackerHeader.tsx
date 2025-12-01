import { format, startOfWeek, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

type ViewMode = "day" | "week" | "month";

interface TimeTrackerHeaderProps {
  viewMode: ViewMode;
  selectedDate: Date;
  onViewModeChange: () => void;
  onDateSelect: (date: Date) => void;
  onCategoryEdit: () => void;
  onMorningProgramEdit: () => void;
}

// Custom calendar icon with number
const CalendarIcon = ({ number }: { number: string }) => (
  <div className="relative w-6 h-6">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold mt-1.5">
      {number}
    </span>
  </div>
);

const TimeTrackerHeader = ({
  viewMode,
  selectedDate,
  onViewModeChange,
  onDateSelect,
  onCategoryEdit,
  onMorningProgramEdit,
}: TimeTrackerHeaderProps) => {
  const getViewIcon = () => {
    switch (viewMode) {
      case "day":
        return <CalendarIcon number="1" />;
      case "week":
        return <CalendarIcon number="7" />;
      case "month":
        return <CalendarIcon number="31" />;
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();

  const getHeaderTitle = () => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    const isToday = format(selectedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
    const isTomorrow = format(selectedDate, "yyyy-MM-dd") === format(tomorrow, "yyyy-MM-dd");

    switch (viewMode) {
      case "day":
        if (isToday) return "오늘";
        if (isTomorrow) return "내일";
        return format(selectedDate, "M월 d일", { locale: ko });
      case "week":
        return `${format(weekDays[0], "d")}일 - ${format(weekDays[6], "d")}일`;
      case "month":
        return format(selectedDate, "yyyy년", { locale: ko });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onViewModeChange}>
          {getViewIcon()}
        </Button>
        
        <h1 className="text-2xl font-semibold text-center">
          {getHeaderTitle()}
        </h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onCategoryEdit}>
              시간 카테고리 수정
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMorningProgramEdit}>
              아침 동기부여 프로그램
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Week Calendar - Only show in day view */}
      {viewMode === "day" && (
        <div className="flex justify-around px-2 py-2 border-t border-border">
          {weekDays.map((day, i) => {
            const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
            return (
              <button
                key={i}
                onClick={() => onDateSelect(day)}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-xs text-muted-foreground">
                  {format(day, "EEE", { locale: ko })[0]}
                </span>
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    isSelected ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {format(day, "d")}
                </motion.div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default TimeTrackerHeader;
