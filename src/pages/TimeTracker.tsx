import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, startOfMonth, addDays, getDaysInMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { Play, ChevronRight, Pin, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "day" | "week" | "month";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface TimeBlock {
  id: string;
  categoryId: string;
  startHour: number;
  duration: number;
  dayOffset?: number; // For week/month view
}

const categories: Category[] = [
  { id: "sleep", name: "잠", icon: "😴", color: "bg-category-sleep" },
  { id: "meal", name: "밥", icon: "🍚", color: "bg-category-meal" },
  { id: "exercise", name: "운동", icon: "🏃", color: "bg-category-exercise" },
  { id: "work", name: "알바", icon: "⚒️", color: "bg-category-work" },
  { id: "reading", name: "독서", icon: "📚", color: "bg-category-reading" },
  { id: "study", name: "공부", icon: "✏️", color: "bg-category-study" },
  { id: "housework", name: "집안일", icon: "🧹", color: "bg-category-housework" },
  { id: "rest", name: "힐링", icon: "🧘", color: "bg-category-rest" },
  { id: "waste", name: "시간 낭비", icon: "🗑️", color: "bg-category-waste" },
];

const TimeTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [oneThing, setOneThing] = useState("아바투스 다 읽기");
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    { id: "1", categoryId: "sleep", startHour: 0, duration: 4, dayOffset: 0 },
    { id: "2", categoryId: "exercise", startHour: 8, duration: 1, dayOffset: 0 },
    { id: "3", categoryId: "study", startHour: 10, duration: 2, dayOffset: 0 },
    { id: "4", categoryId: "rest", startHour: 13, duration: 1, dayOffset: 0 },
    { id: "5", categoryId: "waste", startHour: 14, duration: 1, dayOffset: 0 },
    { id: "6", categoryId: "work", startHour: 16, duration: 2, dayOffset: 0 },
    // Sample data for week/month view
    { id: "7", categoryId: "sleep", startHour: 0, duration: 6, dayOffset: 1 },
    { id: "8", categoryId: "meal", startHour: 12, duration: 1, dayOffset: 1 },
    { id: "9", categoryId: "study", startHour: 14, duration: 3, dayOffset: 2 },
    { id: "10", categoryId: "exercise", startHour: 7, duration: 1, dayOffset: 3 },
    { id: "11", categoryId: "work", startHour: 9, duration: 4, dayOffset: 4 },
    { id: "12", categoryId: "rest", startHour: 15, duration: 2, dayOffset: 5 },
    { id: "13", categoryId: "reading", startHour: 20, duration: 2, dayOffset: 6 },
  ]);

  const cycleViewMode = () => {
    setViewMode((prev) => {
      if (prev === "day") return "week";
      if (prev === "week") return "month";
      return "day";
    });
  };

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

  const getMonthDays = () => {
    const start = startOfMonth(selectedDate);
    const daysCount = getDaysInMonth(selectedDate);
    return Array.from({ length: daysCount }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColumnsForView = () => {
    if (viewMode === "week") return 7;
    if (viewMode === "month") return getDaysInMonth(selectedDate);
    return 1;
  };

  const columnCount = getColumnsForView();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={cycleViewMode} className="relative">
            {getViewIcon()}
            <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
              {getViewLabel()}
            </span>
          </Button>
          <h1 className="text-lg font-semibold text-center">
            {format(selectedDate, "M월", { locale: ko })}
            <br />
            <span className="text-2xl">
              {viewMode === "day" && "오늘"}
              {viewMode === "week" && `${format(weekDays[0], "d")}일 - ${format(weekDays[6], "d")}일`}
              {viewMode === "month" && format(selectedDate, "yyyy년", { locale: ko })}
            </span>
          </h1>
          <Button variant="ghost" size="icon">
            <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
              ))}
            </div>
          </Button>
        </div>

        {/* Week Calendar - Only show in day view */}
        {viewMode === "day" && (
          <div className="flex justify-around px-2 py-2 border-t border-border">
            {weekDays.map((day, i) => {
              const isToday = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-xs text-muted-foreground">
                    {format(day, "EEE", { locale: ko })[0]}
                  </span>
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      isToday ? "bg-primary text-primary-foreground" : "text-foreground"
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

        {/* Week/Month column headers */}
        {viewMode !== "day" && (
          <div className="flex border-t border-border">
            <div className="w-8 shrink-0" /> {/* Spacer for time column */}
            <div className="flex-1 flex">
              {viewMode === "week" &&
                weekDays.map((day, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center py-2 text-xs text-muted-foreground border-l border-border first:border-l-0"
                  >
                    {format(day, "EEE", { locale: ko })[0]}
                    <br />
                    <span className="font-medium text-foreground">{format(day, "d")}</span>
                  </div>
                ))}
              {viewMode === "month" && (
                <div className="flex w-full">
                  {monthDays.map((day, i) => (
                    <div
                      key={i}
                      className="flex-1 text-center py-1 text-[8px] text-muted-foreground border-l border-border/50 first:border-l-0"
                      style={{ minWidth: 0 }}
                    >
                      {format(day, "d")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* One Thing Pin */}
      <div className="mx-4 mt-4 p-3 bg-destructive/20 rounded-xl flex items-center gap-2">
        <Pin className="w-4 h-4 text-destructive rotate-45" />
        <span className="text-sm font-medium flex-1">오늘의 one-thing : {oneThing}</span>
      </div>

      {/* Main Content */}
      <div className="flex mt-4">
        {/* Timeline */}
        <div className={`relative px-2 ${viewMode === "day" ? "flex-1" : "flex-1"}`}>
          <div className="flex">
            {/* Time labels */}
            <div className="w-8 shrink-0">
              {hours.map((hour) => (
                <div key={hour} className="h-12 flex items-start">
                  <span className="text-xs text-muted-foreground pt-1">
                    {hour.toString().padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>

            {/* Time blocks area */}
            <div className={`flex ${viewMode === "day" ? "flex-1" : "flex-1"}`}>
              {viewMode === "day" ? (
                /* Day View - Single column */
                <div className="flex-1 relative">
                  {hours.map((hour) => (
                    <div key={hour} className="h-12 border-b border-border/50 relative">
                      {timeBlocks
                        .filter((block) => block.startHour === hour && (block.dayOffset === 0 || block.dayOffset === undefined))
                        .map((block) => {
                          const category = categories.find((c) => c.id === block.categoryId);
                          return (
                            <motion.div
                              key={block.id}
                              className={`absolute left-1 right-1 ${category?.color} rounded-lg p-2 flex items-center gap-1 shadow-sm z-10`}
                              style={{
                                height: `${block.duration * 48}px`,
                              }}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <span className="text-lg">{category?.icon}</span>
                              <span className="text-sm font-medium">{category?.name}</span>
                            </motion.div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              ) : (
                /* Week/Month View - Multiple columns */
                <div className="flex-1 flex">
                  {Array.from({ length: columnCount }, (_, colIndex) => (
                    <div
                      key={colIndex}
                      className="flex-1 border-l border-border/30 first:border-l-0 relative"
                      style={{ minWidth: 0 }}
                    >
                      {hours.map((hour) => (
                        <div key={hour} className="h-12 border-b border-border/50 relative">
                          {timeBlocks
                            .filter((block) => block.startHour === hour && block.dayOffset === colIndex)
                            .map((block) => {
                              const category = categories.find((c) => c.id === block.categoryId);
                              return (
                                <motion.div
                                  key={block.id}
                                  className={`absolute inset-x-0.5 ${category?.color} rounded-sm flex items-center justify-center shadow-sm z-10`}
                                  style={{
                                    height: `${block.duration * 48}px`,
                                  }}
                                  initial={{ scale: 0.9, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                >
                                  <span className={viewMode === "week" ? "text-sm" : "text-[8px]"}>
                                    {category?.icon}
                                  </span>
                                </motion.div>
                              );
                            })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Sidebar - Only show in day view */}
        <AnimatePresence>
          {viewMode === "day" && (
            <motion.div
              className="flex-1 pr-2 space-y-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  className="w-full flex items-center gap-2 p-2 rounded-lg bg-card hover:bg-muted transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="w-3 h-3 text-primary fill-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-lg">{category.icon}</div>
                    <div className="text-xs">{category.name}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TimeTracker;
