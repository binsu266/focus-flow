import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getDummyData, categories, categoryColors } from "@/data/timeTrackerData";
import { TimeBlock } from "@/components/timetracker/types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const Calendar = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1)); // December 2025
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 11, 1));
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  
  const timeBlocks = useMemo(() => getDummyData(), []);

  // Get blocks grouped by date
  const blocksByDate = useMemo(() => {
    const grouped: Record<string, TimeBlock[]> = {};
    timeBlocks.forEach(block => {
      if (block.date) {
        if (!grouped[block.date]) {
          grouped[block.date] = [];
        }
        grouped[block.date].push(block);
      }
    });
    return grouped;
  }, [timeBlocks]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Get top category colors for a date (max 3)
  const getDateDots = useCallback((date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const blocks = blocksByDate[dateStr] || [];
    if (blocks.length === 0) return [];

    // Count duration per category
    const categoryDurations: Record<string, number> = {};
    blocks.forEach(block => {
      categoryDurations[block.categoryId] = (categoryDurations[block.categoryId] || 0) + block.duration;
    });

    // Sort by duration and get top 3
    const sortedCategories = Object.entries(categoryDurations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([categoryId]) => categoryId);

    return sortedCategories;
  }, [blocksByDate]);

  // Get blocks for selected date
  const selectedDateBlocks = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return (blocksByDate[dateStr] || []).sort((a, b) => a.startHour - b.startHour);
  }, [selectedDate, blocksByDate]);

  const handlePrevMonth = () => {
    setSwipeDirection("right");
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSwipeDirection("left");
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDateDoubleClick = (date: Date) => {
    // Navigate to TimeTracker with selected date
    navigate("/", { state: { selectedDate: date } });
  };

  const handleAgendaItemClick = () => {
    navigate("/", { state: { selectedDate: selectedDate } });
  };

  // Swipe handlers
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handlePrevMonth();
    } else if (info.offset.x < -100) {
      handleNextMonth();
    }
  };

  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const today = new Date();

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button className="text-lg font-semibold">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </button>
          
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border bg-background sticky top-[57px] z-20">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "py-2 text-center text-sm font-medium",
              index === 0 && "text-red-500",
              index === 6 && "text-blue-500",
              index !== 0 && index !== 6 && "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, x: swipeDirection === "left" ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: swipeDirection === "left" ? -100 : 100 }}
          transition={{ duration: 0.2 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="grid grid-cols-7"
        >
          {calendarDays.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selectedDate);
            const dots = getDateDots(day);
            const dayOfWeek = day.getDay();

            return (
              <motion.button
                key={index}
                onClick={() => handleDateClick(day)}
                onDoubleClick={() => handleDateDoubleClick(day)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center gap-1 relative border-b border-r border-border/30",
                  !isCurrentMonth && "opacity-40"
                )}
              >
                <span
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isToday && "bg-primary text-primary-foreground",
                    isSelected && !isToday && "border-2 border-primary",
                    !isToday && !isSelected && dayOfWeek === 0 && "text-red-500",
                    !isToday && !isSelected && dayOfWeek === 6 && "text-blue-500"
                  )}
                >
                  {format(day, "d")}
                </span>
                
                {/* Category dots */}
                {dots.length > 0 && (
                  <div className="flex gap-0.5">
                    {dots.map((categoryId, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: categoryColors[categoryId] }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Agenda Section */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-border mt-2">
        {/* Handle bar */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Selected date header */}
        <div className="px-4 pb-2">
          <h3 className="font-semibold text-foreground">
            {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
          </h3>
        </div>

        {/* Agenda list */}
        <ScrollArea className="flex-1">
          <div className="px-4 pb-4 space-y-2">
            {selectedDateBlocks.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                기록된 일정이 없습니다
              </div>
            ) : (
              selectedDateBlocks.map((block) => {
                const category = categories.find(c => c.id === block.categoryId);
                if (!category) return null;

                const endHour = block.startHour + block.duration;

                return (
                  <motion.button
                    key={block.id}
                    onClick={handleAgendaItemClick}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
                  >
                    {/* Color bar */}
                    <div
                      className="w-1 h-10 rounded-full"
                      style={{ backgroundColor: categoryColors[block.categoryId] }}
                    />
                    
                    {/* Time range */}
                    <div className="text-sm text-muted-foreground min-w-[80px]">
                      {formatTime(block.startHour)} - {formatTime(endHour)}
                    </div>
                    
                    {/* Category info */}
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium">{category.name}</span>
                    </div>

                    {/* Duration badge */}
                    <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {block.duration}시간
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Calendar;
