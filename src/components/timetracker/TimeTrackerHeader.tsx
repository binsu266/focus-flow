import { format, startOfWeek, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, CalendarDays, CalendarRange, MoreHorizontal } from "lucide-react";
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
        return <Calendar className="w-5 h-5" />;
      case "week":
        return <CalendarDays className="w-5 h-5" />;
      case "month":
        return <CalendarRange className="w-5 h-5" />;
    }
  };

  const getViewLabel = () => {
    switch (viewMode) {
      case "day":
        return "일";
      case "week":
        return "주";
      case "month":
        return "월";
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();

  const getHeaderTitle = () => {
    switch (viewMode) {
      case "day":
        return "오늘";
      case "week":
        return `${format(weekDays[0], "d")}일 - ${format(weekDays[6], "d")}일`;
      case "month":
        return format(selectedDate, "yyyy년", { locale: ko });
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onViewModeChange} className="relative">
          {getViewIcon()}
          <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
            {getViewLabel()}
          </span>
        </Button>
        
        <h1 className="text-lg font-semibold text-center">
          {format(selectedDate, "M월", { locale: ko })}
          <br />
          <span className="text-2xl">{getHeaderTitle()}</span>
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
