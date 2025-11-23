import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfWeek, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Play, ChevronRight, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [oneThing, setOneThing] = useState("아바투스 다 읽기");
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    { id: "1", categoryId: "sleep", startHour: 0, duration: 4 },
    { id: "2", categoryId: "exercise", startHour: 8, duration: 1 },
    { id: "3", categoryId: "study", startHour: 10, duration: 2 },
    { id: "4", categoryId: "rest", startHour: 13, duration: 1 },
    { id: "5", categoryId: "waste", startHour: 14, duration: 1 },
    { id: "6", categoryId: "work", startHour: 16, duration: 2 },
  ]);

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon">
            <div className="w-6 h-6 flex flex-col gap-1">
              <div className="w-full h-0.5 bg-foreground" />
              <div className="w-full h-0.5 bg-foreground" />
              <div className="w-full h-0.5 bg-foreground" />
            </div>
          </Button>
          <h1 className="text-lg font-semibold">
            {format(selectedDate, "M월", { locale: ko })}
            <br />
            <span className="text-2xl">오늘</span>
          </h1>
          <Button variant="ghost" size="icon">
            <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
              ))}
            </div>
          </Button>
        </div>

        {/* Week Calendar */}
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
      </header>

      {/* One Thing Pin */}
      <div className="mx-4 mt-4 p-3 bg-destructive/20 rounded-xl flex items-center gap-2">
        <Pin className="w-4 h-4 text-destructive rotate-45" />
        <span className="text-sm font-medium flex-1">오늘의 one-thing : {oneThing}</span>
      </div>

      {/* Main Content */}
      <div className="flex mt-4">
        {/* Timeline */}
        <div className="flex-1 relative px-2">
          {hours.map((hour) => (
            <div key={hour} className="flex items-start h-12 border-b border-border/50">
              <span className="text-xs text-muted-foreground w-8 pt-1">{hour.toString().padStart(2, "0")}</span>
              <div className="flex-1 relative">
                {timeBlocks
                  .filter((block) => block.startHour === hour)
                  .map((block) => {
                    const category = categories.find((c) => c.id === block.categoryId);
                    return (
                      <motion.div
                        key={block.id}
                        className={`absolute left-2 right-2 ${category?.color} rounded-lg p-2 flex items-center gap-1 shadow-sm`}
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
            </div>
          ))}
        </div>

        {/* Categories Sidebar */}
        <div className="w-32 pr-2 space-y-1">
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
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;
