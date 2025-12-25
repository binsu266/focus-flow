import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, isBefore, isAfter } from "date-fns";
import { ko } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface TodoItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  color: string;
  category?: string;
}

const dummyTodos: TodoItem[] = [
  { id: "1", title: "프로젝트 마감", startDate: "2025-12-05", endDate: "2025-12-07", completed: false, color: "#EF4444", category: "업무" },
  { id: "2", title: "운동", startDate: "2025-12-10", endDate: "2025-12-10", completed: false, color: "#10B981", category: "건강" },
  { id: "3", title: "팀 미팅", startDate: "2025-12-08", endDate: "2025-12-09", completed: true, color: "#F59E0B", category: "업무" },
  { id: "4", title: "독서", startDate: "2025-12-15", endDate: "2025-12-15", completed: false, color: "#3B82F6", category: "자기계발" },
  { id: "5", title: "여행", startDate: "2025-12-20", endDate: "2025-12-25", completed: false, color: "#22C55E", category: "개인" },
  { id: "6", title: "연말 정산", startDate: "2025-12-28", endDate: "2025-12-31", completed: false, color: "#8B5CF6", category: "업무" },
  { id: "7", title: "크리스마스 파티", startDate: "2025-12-25", endDate: "2025-12-25", completed: false, color: "#EC4899", category: "개인" },
  { id: "8", title: "회의 준비", startDate: "2025-12-03", endDate: "2025-12-03", completed: true, color: "#06B6D4", category: "업무" },
  { id: "9", title: "보고서 작성", startDate: "2025-12-12", endDate: "2025-12-14", completed: false, color: "#F97316", category: "업무" },
  { id: "10", title: "코드 리뷰", startDate: "2025-12-18", endDate: "2025-12-19", completed: false, color: "#6366F1", category: "업무" },
  { id: "11", title: "새해 준비", startDate: "2026-01-01", endDate: "2026-01-03", completed: false, color: "#EC4899", category: "개인" },
  { id: "12", title: "신년 계획", startDate: "2026-01-05", endDate: "2026-01-05", completed: false, color: "#10B981", category: "자기계발" },
];

// 월별 캘린더 데이터 생성 (항상 5주로 맞춤)
const generateMonthData = (monthDate: Date) => {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // 주 단위로 그룹화
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return { monthDate, weeks };
};

const Calendar = () => {
  const navigate = useNavigate();
  const today = new Date();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>(dummyTodos);
  const [visibleMonth, setVisibleMonth] = useState(new Date(2025, 11, 1));
  
  // 현재 월 기준 ±12개월 생성
  const [monthsRange, setMonthsRange] = useState(() => {
    const baseMonth = new Date(2025, 11, 1);
    const months: Date[] = [];
    for (let i = -12; i <= 12; i++) {
      months.push(addMonths(baseMonth, i));
    }
    return months;
  });

  const monthsData = useMemo(() => {
    return monthsRange.map(month => generateMonthData(month));
  }, [monthsRange]);

  const getTodoBarInfo = (todo: TodoItem, week: Date[]) => {
    const todoStart = new Date(todo.startDate);
    const todoEnd = new Date(todo.endDate);
    const weekStart = week[0];
    const weekEnd = week[6];

    if (isAfter(todoStart, weekEnd) || isBefore(todoEnd, weekStart)) {
      return null;
    }

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

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.top + containerRect.height / 2;

    let closestMonth: Date | null = null;
    let closestDistance = Infinity;

    monthRefs.current.forEach((element, key) => {
      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distance = Math.abs(elementCenter - containerCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestMonth = new Date(key);
      }
    });

    if (closestMonth && !isSameMonth(closestMonth, visibleMonth)) {
      setVisibleMonth(closestMonth);
    }

    // 무한 스크롤
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop < 500) {
      setMonthsRange(prev => {
        const firstMonth = prev[0];
        const newMonths: Date[] = [];
        for (let i = 6; i >= 1; i--) {
          newMonths.push(subMonths(firstMonth, i));
        }
        return [...newMonths, ...prev];
      });
    }

    if (scrollHeight - scrollTop - clientHeight < 500) {
      setMonthsRange(prev => {
        const lastMonth = prev[prev.length - 1];
        const newMonths: Date[] = [];
        for (let i = 1; i <= 6; i++) {
          newMonths.push(addMonths(lastMonth, i));
        }
        return [...prev, ...newMonths];
      });
    }
  }, [visibleMonth]);

  const scrollToToday = useCallback(() => {
    const todayMonthKey = format(today, "yyyy-MM");
    const element = monthRefs.current.get(todayMonthKey);
    
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [today]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const initialMonthKey = format(new Date(2025, 11, 1), "yyyy-MM");
      const element = monthRefs.current.get(initialMonthKey);
      if (element) {
        element.scrollIntoView({ block: "start" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const selectedDateTodos = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return todos.filter(todo => {
      const start = new Date(todo.startDate);
      const end = new Date(todo.endDate);
      const current = new Date(dateStr);
      return isWithinInterval(current, { start, end }) || 
             isSameDay(current, start) || 
             isSameDay(current, end);
    });
  }, [selectedDate, todos]);

  // 카테고리별로 그룹화
  const groupedTodos = useMemo(() => {
    const groups: { [key: string]: TodoItem[] } = {};
    selectedDateTodos.forEach(todo => {
      const category = todo.category || "기타";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(todo);
    });
    return groups;
  }, [selectedDateTodos]);

  const handleDateClick = (date: Date) => {
    if (selectedDate && isSameDay(date, selectedDate)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  const handleDateDoubleClick = (date: Date) => {
    navigate("/", { state: { selectedDate: date } });
  };

  const handleToggleTodo = (todoId: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const setMonthRef = useCallback((key: string, element: HTMLDivElement | null) => {
    if (element) {
      monthRefs.current.set(key, element);
    } else {
      monthRefs.current.delete(key);
    }
  }, []);

  // 캘린더 영역 높이 계산 (헤더 57px + 요일 헤더 32px + 하단 nav 80px 제외)
  const HEADER_HEIGHT = 57;
  const WEEKDAY_HEIGHT = 32;
  const BOTTOM_NAV_HEIGHT = 80;
  
  // 날짜 선택 시 캘린더 높이를 줄임
  const calendarHeight = selectedDate 
    ? `calc(45vh - ${HEADER_HEIGHT + WEEKDAY_HEIGHT}px)` 
    : `calc(100vh - ${HEADER_HEIGHT + WEEKDAY_HEIGHT + BOTTOM_NAV_HEIGHT}px)`;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <header className="flex-shrink-0 bg-background border-b border-border px-4 py-3" style={{ height: HEADER_HEIGHT }}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {format(visibleMonth, "yyyy년 M월", { locale: ko })}
          </h1>
          
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToToday}
            className="text-sm font-medium"
          >
            오늘
          </Button>
        </div>
      </header>

      {/* Fixed Weekday Header */}
      <div className="flex-shrink-0 grid grid-cols-7 border-b border-border bg-background" style={{ height: WEEKDAY_HEIGHT }}>
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              "flex items-center justify-center text-xs font-medium",
              index === 0 && "text-red-500",
              index === 6 && "text-blue-500",
              index !== 0 && index !== 6 && "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Scrollable Calendar Area - 날짜 선택 시 축소됨 */}
      <motion.div 
        ref={scrollContainerRef}
        className="overflow-y-auto snap-y snap-mandatory"
        onScroll={handleScroll}
        animate={{ height: calendarHeight }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {monthsData.map(({ monthDate, weeks }) => {
          const monthKey = format(monthDate, "yyyy-MM");
          const weekCount = weeks.length;
          const monthHeight = selectedDate
            ? `calc(45vh - ${HEADER_HEIGHT + WEEKDAY_HEIGHT}px)`
            : `calc(100vh - ${HEADER_HEIGHT + WEEKDAY_HEIGHT + BOTTOM_NAV_HEIGHT}px)`;
          
          return (
            <div 
              key={monthKey}
              ref={(el) => setMonthRef(monthKey, el)}
              className="snap-start"
              style={{ 
                height: monthHeight,
                minHeight: monthHeight
              }}
            >
              {/* Weeks - 화면을 균등 분할 */}
              <div className="h-full flex flex-col">
                {weeks.map((week, weekIndex) => {
                  const weekTodos = todos.map(todo => ({
                    todo,
                    barInfo: getTodoBarInfo(todo, week)
                  })).filter(item => item.barInfo !== null);

                  return (
                    <div 
                      key={weekIndex} 
                      className="relative border-b border-border/30"
                      style={{ flex: `1 1 ${100 / weekCount}%` }}
                    >
                      {/* 날짜 행 */}
                      <div className="grid grid-cols-7 h-full">
                        {week.map((day, dayIndex) => {
                          const isCurrentMonth = isSameMonth(day, monthDate);
                          const isToday = isSameDay(day, today);
                          const isSelected = selectedDate && isSameDay(day, selectedDate);
                          const dayOfWeek = day.getDay();

                          return (
                            <motion.button
                              key={dayIndex}
                              onClick={() => handleDateClick(day)}
                              onDoubleClick={() => handleDateDoubleClick(day)}
                              whileTap={{ scale: 0.95 }}
                              className={cn(
                                "h-full flex flex-col items-center pt-1 relative border-r border-border/20",
                                !isCurrentMonth && "opacity-40"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                                  isToday && "bg-primary text-primary-foreground",
                                  isSelected && !isToday && "bg-primary/20 border-2 border-primary",
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
                                "h-[18px] flex items-center px-1 text-[10px] font-medium text-gray-800 truncate absolute",
                                isRealStart && "rounded-l",
                                isRealEnd && "rounded-r",
                                !isRealStart && "rounded-l-none",
                                !isRealEnd && "rounded-r-none"
                              )}
                              style={{
                                backgroundColor: `${todo.color}30`,
                                left: `${leftPercent}%`,
                                top: `${idx * 20}px`,
                                width: `calc(${widthPercent}% - 2px)`,
                                opacity: todo.completed ? 0.6 : 1
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
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* 할 일 목록 영역 (날짜 선택 시 나타남) */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `calc(55vh - ${BOTTOM_NAV_HEIGHT}px)`, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-background border-t border-border overflow-hidden"
          >
            {/* 선택된 날짜 헤더 */}
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="font-semibold text-foreground">
                {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
              </h3>
            </div>

            {/* 할 일 목록 */}
            <ScrollArea className="h-[calc(100%-52px)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={format(selectedDate, "yyyy-MM-dd")}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-3"
                >
                  {selectedDateTodos.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground mb-4">이 날짜에 할 일이 없습니다</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => navigate("/todo")}
                      >
                        <Plus className="w-4 h-4" />
                        할 일 추가
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(groupedTodos).map(([category, categoryTodos]) => (
                        <div key={category}>
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {categoryTodos.map((todo) => (
                              <motion.div
                                key={todo.id}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                              >
                                <div
                                  className="w-1 h-10 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: todo.color }}
                                />
                                
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
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* 할 일 추가 버튼 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate("/todo")}
                      >
                        <Plus className="w-4 h-4" />
                        할 일 추가
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
