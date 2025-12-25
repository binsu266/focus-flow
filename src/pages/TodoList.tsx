import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Menu, X, Flame, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Todo {
  id: string;
  content: string;
  time?: string;
  categoryTags: string[];
  priority: "high" | "medium" | "low";
  completed: boolean;
  section: "today" | "tomorrow";
  type: "task" | "habit";
  repeatDays?: number[]; // 0=일, 1=월, ..., 6=토
  streak?: number;
}

interface CategoryOption {
  icon: string;
  label: string;
  id: string;
}

const priorityColors = {
  high: "bg-destructive",
  medium: "bg-accent",
  low: "bg-primary",
};

const categoryOptions: CategoryOption[] = [
  { icon: "☕", label: "커피", id: "coffee" },
  { icon: "📚", label: "독서", id: "reading" },
  { icon: "🏢", label: "업무", id: "work" },
  { icon: "👤", label: "인물", id: "person" },
  { icon: "✏️", label: "공부", id: "study" },
  { icon: "🛒", label: "쇼핑", id: "shopping" },
];

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

const LONG_PRESS_DURATION = 180;

const TodoList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [draggingTodoId, setDraggingTodoId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Add modal state
  const [addModalTab, setAddModalTab] = useState<"task" | "habit">("task");
  const [newTodoContent, setNewTodoContent] = useState("");
  const [selectedRepeatDays, setSelectedRepeatDays] = useState<number[]>([1, 2, 3, 4, 5]);
  
  // Edit modal state
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRepeatDays, setEditRepeatDays] = useState<number[]>([]);
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const categoryRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  const [todos, setTodos] = useState<Todo[]>([
    // 습관 데이터
    {
      id: "h1",
      content: "물 2L 마시기",
      categoryTags: [],
      priority: "medium",
      completed: false,
      section: "today",
      type: "habit",
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      streak: 12,
    },
    {
      id: "h2",
      content: "영양제 챙겨먹기",
      categoryTags: [],
      priority: "medium",
      completed: true,
      section: "today",
      type: "habit",
      repeatDays: [1, 2, 3, 4, 5],
      streak: 8,
    },
    {
      id: "h3",
      content: "스트레칭 5분",
      categoryTags: [],
      priority: "low",
      completed: false,
      section: "today",
      type: "habit",
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      streak: 3,
    },
    {
      id: "h4",
      content: "일기 쓰기",
      categoryTags: [],
      priority: "low",
      completed: false,
      section: "today",
      type: "habit",
      repeatDays: [0, 1, 2, 3, 4, 5, 6],
      streak: 21,
    },
    // 일반 할일 데이터
    {
      id: "1",
      content: "청년프론티어십 3차시 과제",
      time: "오늘 13:00",
      categoryTags: ["study"],
      priority: "high",
      completed: false,
      section: "today",
      type: "task",
    },
    {
      id: "2",
      content: "도서관에서 책 반납하기",
      time: "오늘 15:30",
      categoryTags: ["reading"],
      priority: "medium",
      completed: false,
      section: "today",
      type: "task",
    },
    {
      id: "3",
      content: "재학증명서 발급받기",
      time: "오늘 16:00",
      categoryTags: [],
      priority: "low",
      completed: false,
      section: "today",
      type: "task",
    },
    {
      id: "4",
      content: "디지털 창업 공모전 회의",
      time: "내일 11:30",
      categoryTags: ["work"],
      priority: "high",
      completed: false,
      section: "tomorrow",
      type: "task",
    },
  ]);

  const toggleTodo = (id: string) => {
    if (isDragging) return;
    setTodos(todos.map((todo) => {
      if (todo.id === id) {
        const newCompleted = !todo.completed;
        // 습관 완료 시 streak 업데이트
        if (todo.type === "habit" && newCompleted && todo.streak !== undefined) {
          return { ...todo, completed: newCompleted, streak: todo.streak + 1 };
        }
        return { ...todo, completed: newCompleted };
      }
      return todo;
    }));
  };

  const handleFilterClick = (categoryId: string | null) => {
    setSelectedFilter(categoryId === selectedFilter ? null : categoryId);
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === null || todo.categoryTags.includes(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (categoryId: string) => {
    return categoryOptions.find((c) => c.id === categoryId)?.icon || "";
  };

  const getCategoryLabel = (categoryId: string) => {
    return categoryOptions.find((c) => c.id === categoryId)?.label || "";
  };

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent, todoId: string) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    dragStartPosRef.current = { x: clientX, y: clientY };
    
    longPressTimerRef.current = setTimeout(() => {
      setDraggingTodoId(todoId);
      setIsDragging(true);
      setDragPosition({ x: clientX, y: clientY });
      
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, LONG_PRESS_DURATION);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const distance = Math.sqrt(
        Math.pow(clientX - dragStartPosRef.current.x, 2) +
        Math.pow(clientY - dragStartPosRef.current.y, 2)
      );
      if (distance > 10 && longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      return;
    }

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    setDragPosition({ x: clientX, y: clientY });

    let foundCategory: string | null = null;
    categoryRefs.current.forEach((ref, categoryId) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          foundCategory = categoryId;
        }
      }
    });
    setHoveredCategory(foundCategory);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isDragging && draggingTodoId && hoveredCategory) {
      setTodos((prev) =>
        prev.map((todo) => {
          if (todo.id === draggingTodoId) {
            if (!todo.categoryTags.includes(hoveredCategory)) {
              return { ...todo, categoryTags: [...todo.categoryTags, hoveredCategory] };
            }
          }
          return todo;
        })
      );

      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }

      const category = categoryOptions.find((c) => c.id === hoveredCategory);
      toast.success(`'${category?.icon} ${category?.label}'에 추가되었습니다`);
    }

    setDraggingTodoId(null);
    setIsDragging(false);
    setHoveredCategory(null);
  }, [isDragging, draggingTodoId, hoveredCategory]);

  const removeTag = (todoId: string, categoryId: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === todoId) {
          return { ...todo, categoryTags: todo.categoryTags.filter((t) => t !== categoryId) };
        }
        return todo;
      })
    );
  };

  const getDraggingTodo = () => {
    return todos.find((t) => t.id === draggingTodoId);
  };

  const toggleRepeatDay = (day: number) => {
    setSelectedRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleAddTodo = () => {
    if (!newTodoContent.trim()) return;

    const newTodo: Todo = {
      id: `${Date.now()}`,
      content: newTodoContent,
      categoryTags: [],
      priority: "medium",
      completed: false,
      section: "today",
      type: addModalTab,
      ...(addModalTab === "habit" && {
        repeatDays: selectedRepeatDays,
        streak: 0,
      }),
    };

    setTodos((prev) => [...prev, newTodo]);
    setNewTodoContent("");
    setShowAddModal(false);
    toast.success(addModalTab === "habit" ? "새 습관이 추가되었습니다" : "할 일이 추가되었습니다");
  };

  const openEditModal = (todo: Todo) => {
    if (isDragging) return;
    setEditingTodo(todo);
    setEditContent(todo.content);
    setEditRepeatDays(todo.repeatDays || []);
  };

  const handleEditTodo = () => {
    if (!editingTodo || !editContent.trim()) return;

    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === editingTodo.id) {
          return {
            ...todo,
            content: editContent,
            ...(todo.type === "habit" && { repeatDays: editRepeatDays }),
          };
        }
        return todo;
      })
    );

    setEditingTodo(null);
    toast.success("수정되었습니다");
  };

  const handleDeleteTodo = () => {
    if (!editingTodo) return;
    setTodos((prev) => prev.filter((todo) => todo.id !== editingTodo.id));
    setEditingTodo(null);
    toast.success("삭제되었습니다");
  };

  const toggleEditRepeatDay = (day: number) => {
    setEditRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const getRepeatDaysLabel = (days?: number[]) => {
    if (!days || days.length === 0) return "";
    if (days.length === 7) return "매일";
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return "평일";
    if (days.length === 2 && days.includes(0) && days.includes(6)) return "주말";
    return days.map((d) => dayLabels[d]).join(", ");
  };

  // 습관 칩 렌더링
  const chipTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const renderHabitChip = (habit: Todo) => {
    const handleChipPress = () => {
      chipTimerRef.current = setTimeout(() => {
        chipTimerRef.current = null;
        openEditModal(habit);
      }, 400);
    };
    
    const handleChipRelease = () => {
      if (chipTimerRef.current) {
        clearTimeout(chipTimerRef.current);
        chipTimerRef.current = null;
        toggleTodo(habit.id);
      }
    };
    
    return (
      <motion.button
        key={habit.id}
        className={`
          shrink-0 flex items-center gap-2 px-3 py-2 rounded-full 
          border-2 transition-all select-none cursor-pointer
          ${habit.completed 
            ? "bg-accent/20 border-accent" 
            : "bg-muted/50 border-muted hover:border-accent/50"
          }
        `}
        whileTap={{ scale: 0.95 }}
        onMouseDown={handleChipPress}
        onMouseUp={handleChipRelease}
        onMouseLeave={() => {
          if (chipTimerRef.current) {
            clearTimeout(chipTimerRef.current);
            chipTimerRef.current = null;
          }
        }}
        onTouchStart={handleChipPress}
        onTouchEnd={handleChipRelease}
      >
        {/* 체크 아이콘 */}
        <div className={`
          w-5 h-5 rounded-full flex items-center justify-center shrink-0
          ${habit.completed 
            ? "bg-accent text-accent-foreground" 
            : "border-2 border-muted-foreground/30"
          }
        `}>
          {habit.completed && <Check className="w-3 h-3" />}
        </div>
        
        {/* 습관 이름 */}
        <span className={`text-sm font-medium whitespace-nowrap ${
          habit.completed ? "text-accent-foreground" : "text-foreground"
        }`}>
          {habit.content}
        </span>
        
        {/* 스트릭 뱃지 */}
        {habit.streak !== undefined && habit.streak > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-orange-500">
            <Flame className="w-3 h-3" />
            {habit.streak}
          </span>
        )}
      </motion.button>
    );
  };

  // 일반 할일 아이템 렌더링
  const renderTaskItem = (todo: Todo) => {
    const isBeingDragged = draggingTodoId === todo.id && isDragging;

    return (
      <div key={todo.id} className="relative">
        {isBeingDragged && (
          <div className="bg-muted/50 rounded-xl p-4 border-2 border-dashed border-muted-foreground/30 h-[72px]" />
        )}
        
        <motion.div
          className={`bg-card rounded-xl p-4 shadow-sm ${isBeingDragged ? "fixed pointer-events-none z-50" : ""}`}
          style={
            isBeingDragged
              ? {
                  left: dragPosition.x - 150,
                  top: dragPosition.y - 36,
                  width: 300,
                }
              : {}
          }
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isBeingDragged ? 0.65 : 1,
            y: 0,
            scale: isBeingDragged ? 0.5 : 1,
            boxShadow: isBeingDragged
              ? "0 8px 16px -4px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          whileTap={!isDragging ? { scale: 0.98 } : undefined}
          onClick={() => openEditModal(todo)}
          onMouseDown={(e) => handleTouchStart(e, todo.id)}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onMouseLeave={() => {
            if (longPressTimerRef.current) {
              clearTimeout(longPressTimerRef.current);
            }
          }}
          onTouchStart={(e) => handleTouchStart(e, todo.id)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex items-center gap-3">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => toggleTodo(todo.id)}
              className="w-6 h-6"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-medium truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                  {todo.content}
                </p>
                {todo.categoryTags.length > 0 && (
                  <div className="flex gap-1 shrink-0">
                    {todo.categoryTags.map((tag) => (
                      <span key={tag} className="text-sm">
                        {getCategoryIcon(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{todo.time}</span>
                {todo.categoryTags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {todo.categoryTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(todo.id, tag);
                        }}
                        className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full flex items-center gap-0.5 hover:bg-muted/80 transition-colors"
                      >
                        {getCategoryIcon(tag)} {getCategoryLabel(tag)}
                        <X className="w-2.5 h-2.5 ml-0.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full shrink-0 ${priorityColors[todo.priority]}`} />
          </div>
        </motion.div>
      </div>
    );
  };

  const renderTodoItem = (todo: Todo) => {
    return renderTaskItem(todo);
  };

  // 필터링된 데이터 분리
  const habits = filteredTodos.filter((t) => t.type === "habit" && t.section === "today");
  const todayTodos = filteredTodos.filter((t) => t.type === "task" && t.section === "today");
  const tomorrowTodos = filteredTodos.filter((t) => t.type === "task" && t.section === "tomorrow");

  const completedHabits = habits.filter((h) => h.completed).length;
  const totalHabits = habits.length;

  return (
    <div 
      className="min-h-screen bg-background pb-20"
      onMouseMove={isDragging ? handleTouchMove : undefined}
      onMouseUp={isDragging ? handleTouchEnd : undefined}
      onTouchMove={isDragging ? handleTouchMove : undefined}
      onTouchEnd={isDragging ? handleTouchEnd : undefined}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">할 일</h1>
          <Button variant="ghost" size="icon">
            <div className="grid grid-cols-3 gap-0.5 w-5 h-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
              ))}
            </div>
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="할 일을 검색할 수 있어요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Category Filter with Drop Target */}
        <div className={`px-4 pb-3 overflow-x-auto transition-all ${isDragging ? "bg-primary/5 py-2" : ""}`}>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === null ? "secondary" : "ghost"}
              size="sm"
              className={`rounded-full shrink-0 transition-all ${
                selectedFilter === null ? "bg-primary/20 text-primary" : "bg-muted/50"
              }`}
              onClick={() => handleFilterClick(null)}
            >
              전체
            </Button>
            {categoryOptions.map((cat) => (
              <motion.button
                key={cat.id}
                ref={(el) => {
                  if (el) categoryRefs.current.set(cat.id, el);
                }}
                className={`h-9 px-3 rounded-full shrink-0 text-sm font-medium transition-all ${
                  selectedFilter === cat.id
                    ? "bg-primary/20 text-primary ring-2 ring-primary/30"
                    : hoveredCategory === cat.id && isDragging
                    ? "bg-primary/30 ring-2 ring-primary"
                    : "bg-muted/50 hover:bg-muted"
                }`}
                animate={{
                  scale: hoveredCategory === cat.id && isDragging ? 1.2 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => !isDragging && handleFilterClick(cat.id)}
              >
                {cat.icon}
              </motion.button>
            ))}
          </div>
          {isDragging && (
            <motion.p
              className="text-xs text-primary text-center mt-2"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              카테고리에 드롭하여 태그 지정
            </motion.p>
          )}
        </div>

        {/* Current Filter Indicator */}
        {selectedFilter && (
          <motion.div
            className="px-4 pb-3 flex items-center gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span className="text-sm text-muted-foreground">
              {getCategoryIcon(selectedFilter)} {getCategoryLabel(selectedFilter)} 카테고리
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setSelectedFilter(null)}
            >
              <X className="w-3 h-3 mr-1" />
              필터 해제
            </Button>
          </motion.div>
        )}
      </header>

      {/* Todo Sections */}
      <div className="px-4 py-4 space-y-6">
        {/* 오늘의 습관 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">오늘의 습관</h2>
              <span className="text-sm text-muted-foreground">
                {completedHabits}/{totalHabits}
              </span>
            </div>
            {totalHabits > 0 && (
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedHabits / totalHabits) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
          <AnimatePresence mode="popLayout">
            {habits.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {habits.map((habit) => renderHabitChip(habit))}
              </div>
            ) : (
              <motion.div
                className="text-center py-6 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p>오늘 반복할 습관이 없습니다</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setAddModalTab("habit");
                    setShowAddModal(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  습관 추가
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 오늘 할 일 */}
        <section>
          <h2 className="text-lg font-bold mb-3">오늘 할 일</h2>
          <AnimatePresence mode="popLayout">
            {todayTodos.length > 0 ? (
              <div className="space-y-2">
                {todayTodos.map((todo) => renderTodoItem(todo))}
              </div>
            ) : (
              <motion.div
                className="text-center py-8 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {selectedFilter ? (
                  <>
                    <p>{getCategoryIcon(selectedFilter)} {getCategoryLabel(selectedFilter)} 카테고리에 할 일이 없습니다</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowAddModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      할 일 추가
                    </Button>
                  </>
                ) : (
                  <p>오늘 할 일이 없습니다</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 내일 할 일 */}
        <section>
          <h2 className="text-lg font-bold mb-3">내일 할 일</h2>
          <AnimatePresence mode="popLayout">
            {tomorrowTodos.length > 0 ? (
              <div className="space-y-2">
                {tomorrowTodos.map((todo) => renderTodoItem(todo))}
              </div>
            ) : (
              <motion.div
                className="text-center py-8 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {selectedFilter ? (
                  <p>{getCategoryIcon(selectedFilter)} {getCategoryLabel(selectedFilter)} 카테고리에 할 일이 없습니다</p>
                ) : (
                  <p>내일 할 일이 없습니다</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Floating Add Button */}
      <motion.button
        className="fixed right-6 bottom-24 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Todo Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-background rounded-t-3xl w-full p-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
              
              {/* 탭 선택 */}
              <div className="flex gap-2 mb-6">
                <button
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    addModalTab === "task"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => setAddModalTab("task")}
                >
                  📝 할 일
                </button>
                <button
                  className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                    addModalTab === "habit"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => setAddModalTab("habit")}
                >
                  🔄 습관
                </button>
              </div>

              <h3 className="text-lg font-semibold mb-2">
                {addModalTab === "task" ? "무엇을 하고 싶으신가요?" : "어떤 습관을 만들고 싶으신가요?"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {addModalTab === "task" ? "할 일을 적어주세요." : "매일 반복할 습관을 적어주세요."}
              </p>
              
              <Input 
                placeholder={addModalTab === "task" ? "할 일을 입력하세요" : "예: 물 2L 마시기"}
                value={newTodoContent}
                onChange={(e) => setNewTodoContent(e.target.value)}
                className="mb-4" 
              />

              {/* 습관 탭일 때 반복 요일 선택 */}
              {addModalTab === "habit" && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">반복 요일</p>
                  <div className="flex gap-2">
                    {dayLabels.map((label, index) => (
                      <button
                        key={index}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                          selectedRepeatDays.includes(index)
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => toggleRepeatDay(index)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      onClick={() => setSelectedRepeatDays([0, 1, 2, 3, 4, 5, 6])}
                    >
                      매일
                    </button>
                    <button
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      onClick={() => setSelectedRepeatDays([1, 2, 3, 4, 5])}
                    >
                      평일
                    </button>
                    <button
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      onClick={() => setSelectedRepeatDays([0, 6])}
                    >
                      주말
                    </button>
                  </div>
                </div>
              )}

              {/* 할 일 탭일 때 기존 옵션 버튼 */}
              {addModalTab === "task" && (
                <div className="flex gap-4 mb-6">
                  <Button variant="ghost" size="icon" className="w-12 h-12">
                    📅
                  </Button>
                  <Button variant="ghost" size="icon" className="w-12 h-12">
                    🏷️
                  </Button>
                  <Button variant="ghost" size="icon" className="w-12 h-12">
                    🚩
                  </Button>
                </div>
              )}

              <Button 
                className={`w-full h-14 rounded-full ${
                  addModalTab === "habit" 
                    ? "bg-accent hover:bg-accent/90" 
                    : "bg-primary hover:bg-primary/90"
                }`}
                onClick={handleAddTodo}
                disabled={!newTodoContent.trim()}
              >
                <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center mr-2">
                  ↑
                </div>
                {addModalTab === "habit" ? "습관 추가" : "할 일 추가"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Todo Modal */}
      <AnimatePresence>
        {editingTodo && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingTodo(null)}
          >
            <motion.div
              className="bg-background rounded-t-3xl w-full p-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingTodo.type === "habit" ? "🔄 습관 수정" : "📝 할 일 수정"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDeleteTodo}
                >
                  삭제
                </Button>
              </div>

              <Input 
                placeholder={editingTodo.type === "habit" ? "습관을 입력하세요" : "할 일을 입력하세요"}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="mb-4" 
              />

              {/* 습관일 때 반복 요일 수정 */}
              {editingTodo.type === "habit" && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-3">반복 요일</p>
                  <div className="flex gap-2">
                    {dayLabels.map((label, index) => (
                      <button
                        key={index}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                          editRepeatDays.includes(index)
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                        onClick={() => toggleEditRepeatDay(index)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      onClick={() => setEditRepeatDays([0, 1, 2, 3, 4, 5, 6])}
                    >
                      매일
                    </button>
                    <button
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      onClick={() => setEditRepeatDays([1, 2, 3, 4, 5])}
                    >
                      평일
                    </button>
                    <button
                      className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                      onClick={() => setEditRepeatDays([0, 6])}
                    >
                      주말
                    </button>
                  </div>
                </div>
              )}

              {/* 할 일일 때 완료 상태 표시 */}
              {editingTodo.type === "task" && (
                <div className="flex items-center gap-3 mb-6 p-3 bg-muted/50 rounded-xl">
                  <Checkbox
                    checked={editingTodo.completed}
                    onCheckedChange={() => {
                      setTodos((prev) =>
                        prev.map((todo) =>
                          todo.id === editingTodo.id
                            ? { ...todo, completed: !todo.completed }
                            : todo
                        )
                      );
                      setEditingTodo({ ...editingTodo, completed: !editingTodo.completed });
                    }}
                    className="w-6 h-6"
                  />
                  <span className="text-sm text-muted-foreground">완료됨</span>
                </div>
              )}

              <Button 
                className={`w-full h-14 rounded-full ${
                  editingTodo.type === "habit" 
                    ? "bg-accent hover:bg-accent/90" 
                    : "bg-primary hover:bg-primary/90"
                }`}
                onClick={handleEditTodo}
                disabled={!editContent.trim()}
              >
                저장하기
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodoList;
