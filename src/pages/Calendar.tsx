import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, isBefore, isAfter } from "date-fns";
import { ko } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 할일 타입 정의 (연속 일정 지원)
interface TodoItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  color: string;
}

// 12월 더미 할일 데이터 (단일 + 연속 일정)
const dummyTodos: TodoItem[] = [
  { id: "1", title: "프로젝트 마감", startDate: "2025-12-05", endDate: "2025-12-07", completed: false, color: "#EF4444" },
  { id: "2", title: "운동", startDate: "2025-12-10", endDate: "2025-12-10", completed: false, color: "#10B981" },
  { id: "3", title: "팀 미팅", startDate: "2025-12-08", endDate: "2025-12-09", completed: true, color: "#F59E0B" },
  { id: "4", title: "독서", startDate: "2025-12-15", endDate: "2025-12-15", completed: false, color: "#3B82F6" },
  { id: "5", title: "여행", startDate: "2025-12-20", endDate: "2025-12-25", completed: false, color: "#22C55E" },
  { id: "6", title: "연말 정산", startDate: "2025-12-28", endDate: "2025-12-31", completed: false, color: "#8B5CF6" },
  { id: "7", title: "크리스마스 파티", startDate: "2025-12-25", endDate: "2025-12-25", completed: false, color: "#EC4899" },
  { id: "8", title: "회의 준비", startDate: "2025-12-03", endDate: "2025-12-03", completed: true, color: "#06B6D4" },
  { id: "9", title: "보고서 작성", startDate: "2025-12-12", endDate: "2025-12-14", completed: false, color: "#F97316" },
  { id: "10", title: "코드 리뷰", startDate: "2025-12-18", endDate: "2025-12-19", completed: false, color: "#6366F1" },
];

const Calendar = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>(dummyTodos);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

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

  // 주 단위로 날짜 그룹화
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  // 특정 날짜에 해당하는 할일들 가져오기
  const getTodosForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return todos.filter(todo => {
      const start = new Date(todo.startDate);
      const end = new Date(todo.endDate);
      const current = new Date(dateStr);
      return isWithinInterval(current, { start, end }) || 
             isSameDay(current, start) || 
             isSameDay(current, end);
    });
  };

  // 특정 주에서 할일의 시작/끝 위치 계산
  const getTodoBarInfo = (todo: TodoItem, week: Date[]) => {
    const todoStart = new Date(todo.startDate);
    const todoEnd = new Date(todo.endDate);
    const weekStart = week[0];
    const weekEnd = week[6];

    // 이 주에 할일이 포함되는지 확인
    if (isAfter(todoStart, weekEnd) || isBefore(todoEnd, weekStart)) {
      return null;
    }

    // 시작 인덱스 계산
    let startIdx = 0;
    for (let i = 0; i < 7; i++) {
      if (isSameDay(week[i], todoStart) || isAfter(week[i], todoStart)) {
        startIdx = i;
        break;
      }
    }
    if (isBefore(todoStart, weekStart)) {
      startIdx = 0;
    }

    // 끝 인덱스 계산
    let endIdx = 6;
    for (let i = 6; i >= 0; i--) {
      if (isSameDay(week[i], todoEnd) || isBefore(week[i], todoEnd)) {
        endIdx = i;
        break;
      }
    }
    if (isAfter(todoEnd, weekEnd)) {
      endIdx = 6;
    }

    const isRealStart = isSameDay(week[startIdx], todoStart);
    const isRealEnd = isSameDay(week[endIdx], todoEnd);

    return {
      startIdx,
      endIdx,
      isRealStart,
      isRealEnd,
      span: endIdx - startIdx + 1
    };
  };

  // 선택된 날짜의 할일 목록
  const selectedDateTodos = useMemo(() => {
    if (!selectedDate) return [];
    return getTodosForDate(selectedDate);
  }, [selectedDate, todos]);

  const handlePrevMonth = () => {
    setSwipeDirection("right");
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSwipeDirection("left");
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    setSwipeDirection(null);
    setSelectedDate(date);
  };

  const handleDateDoubleClick = (date: Date) => {
    navigate("/", { state: { selectedDate: date } });
  };

  const handleToggleTodo = (todoId: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handlePrevMonth();
    } else if (info.offset.x < -100) {
      handleNextMonth();
    }
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
              "py-2 text-center text-xs font-medium",
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
          initial={swipeDirection === null ? false : { opacity: 0, x: swipeDirection === "left" ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: swipeDirection === "left" ? -100 : 100 }}
          transition={{ duration: 0.2 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          dragSnapToOrigin={true}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          className="flex-1"
        >
          {weeks.map((week, weekIndex) => {
            // 이 주에 표시할 할일들 계산
            const weekTodos = todos.map(todo => ({
              todo,
              barInfo: getTodoBarInfo(todo, week)
            })).filter(item => item.barInfo !== null);

            return (
              <div key={weekIndex} className="relative">
                {/* 날짜 행 */}
                <div className="grid grid-cols-7">
                  {week.map((day, dayIndex) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, today);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const dayOfWeek = day.getDay();

                    return (
                      <motion.button
                        key={dayIndex}
                        onClick={() => handleDateClick(day)}
                        onDoubleClick={() => handleDateDoubleClick(day)}
                        onPointerDown={(e) => e.stopPropagation()}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "min-h-[90px] flex flex-col items-center pt-1 relative border-b border-r border-border/20",
                          !isCurrentMonth && "opacity-40"
                        )}
                      >
                        <span
                          className={cn(
                            "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                            isToday && "bg-primary text-primary-foreground",
                            isSelected && !isToday && "border-2 border-primary",
                            !isToday && !isSelected && dayOfWeek === 0 && "text-red-500",
                            !isToday && !isSelected && dayOfWeek === 6 && "text-blue-500"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* 할일 바 오버레이 */}
                <div className="absolute top-8 left-0 right-0 px-0.5 pointer-events-none">
                  {weekTodos.slice(0, 3).map(({ todo, barInfo }, idx) => {
                    if (!barInfo) return null;
                    const { startIdx, isRealStart, isRealEnd, span } = barInfo;
                    const leftPercent = (startIdx / 7) * 100;
                    const widthPercent = (span / 7) * 100;

                    return (
                      <div
                        key={todo.id}
                        className={cn(
                          "h-[18px] flex items-center px-1 text-[10px] font-medium text-white truncate absolute",
                          isRealStart && "rounded-l",
                          isRealEnd && "rounded-r",
                          !isRealStart && "rounded-l-none",
                          !isRealEnd && "rounded-r-none"
                        )}
                        style={{
                          backgroundColor: todo.color,
                          left: `${leftPercent}%`,
                          top: `${idx * 20}px`,
                          width: `calc(${widthPercent}% - 2px)`,
                          opacity: todo.completed ? 0.5 : 1
                        }}
                      >
                        {(isRealStart || startIdx === 0) && (
                          <span className="truncate">{todo.title}</span>
                        )}
                      </div>
                    );
                  })}
                  {weekTodos.length > 3 && (
                    <div 
                      className="absolute text-[10px] text-muted-foreground pl-1"
                      style={{ top: `${3 * 20}px` }}
                    >
                      +{weekTodos.length - 3}개
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Sheet */}
      <Sheet open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <SheetContent side="bottom" className="h-[45vh] rounded-t-2xl">
          <div className="flex flex-col h-full">
            {/* Handle bar */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
              <h3 className="font-semibold text-foreground">
                {selectedDate && format(selectedDate, "M월 d일 EEEE", { locale: ko })}
              </h3>
              <button 
                onClick={() => setSelectedDate(null)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Todo list */}
            <ScrollArea className="flex-1">
              <div className="px-4 py-3 space-y-2">
                {selectedDateTodos.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    등록된 할일이 없습니다
                  </div>
                ) : (
                  selectedDateTodos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                    >
                      {/* Color bar */}
                      <div
                        className="w-1 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: todo.color }}
                      />
                      
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleTodo(todo.id)}
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ 
                          borderColor: todo.color,
                          backgroundColor: todo.completed ? todo.color : 'transparent'
                        }}
                      >
                        {todo.completed && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>
                      
                      {/* Todo content */}
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "font-medium block truncate",
                          todo.completed && "line-through text-muted-foreground"
                        )}>
                          {todo.title}
                        </span>
                        {todo.startDate !== todo.endDate && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(todo.startDate), "M/d")} - {format(new Date(todo.endDate), "M/d")}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Calendar;
