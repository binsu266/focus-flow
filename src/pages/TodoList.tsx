import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Todo {
  id: string;
  content: string;
  time?: string;
  categoryTags: string[]; // Changed from category to categoryTags array
  priority: "high" | "medium" | "low";
  completed: boolean;
  section: "today" | "tomorrow";
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

const LONG_PRESS_DURATION = 300; // 300ms for long press

const TodoList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [draggingTodoId, setDraggingTodoId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const categoryRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "1",
      content: "청년프론티어십 3차시 과제",
      time: "오늘 13:00",
      categoryTags: ["study"],
      priority: "high",
      completed: false,
      section: "today",
    },
    {
      id: "2",
      content: "도서관에서 책 반납하기",
      time: "오늘 15:30",
      categoryTags: ["reading"],
      priority: "medium",
      completed: false,
      section: "today",
    },
    {
      id: "3",
      content: "재학증명서 발급받기",
      time: "오늘 16:00",
      categoryTags: [],
      priority: "low",
      completed: false,
      section: "today",
    },
    {
      id: "4",
      content: "디지털 창업 공모전 회의",
      time: "내일 11:30",
      categoryTags: ["work"],
      priority: "high",
      completed: false,
      section: "tomorrow",
    },
  ]);

  const toggleTodo = (id: string) => {
    if (isDragging) return;
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
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

  // Long press handlers
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent, todoId: string) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    
    dragStartPosRef.current = { x: clientX, y: clientY };
    
    longPressTimerRef.current = setTimeout(() => {
      setDraggingTodoId(todoId);
      setIsDragging(true);
      setDragPosition({ x: clientX, y: clientY });
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, LONG_PRESS_DURATION);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) {
      // Cancel long press if moved too much before activation
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

    // Check if over any category button
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
      // Add category tag to the todo
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

      // Haptic feedback for success
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

  const renderTodoItem = (todo: Todo) => {
    const isBeingDragged = draggingTodoId === todo.id && isDragging;

    return (
      <div key={todo.id} className="relative">
        {/* Placeholder when dragging */}
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
            opacity: isBeingDragged ? 0.9 : 1,
            y: 0,
            scale: isBeingDragged ? 1.05 : 1,
            boxShadow: isBeingDragged
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          whileTap={!isDragging ? { scale: 0.98 } : undefined}
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
                {/* Category tags inline */}
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
                {/* Category tag chips */}
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

  const todayTodos = filteredTodos.filter((t) => t.section === "today");
  const tomorrowTodos = filteredTodos.filter((t) => t.section === "tomorrow");

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
        {/* Today */}
        <section>
          <h2 className="text-lg font-bold mb-3">오늘</h2>
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

        {/* Tomorrow */}
        <section>
          <h2 className="text-lg font-bold mb-3">내일</h2>
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
              <h3 className="text-lg font-semibold mb-2">무엇을 하고 싶으신가요?</h3>
              <p className="text-sm text-muted-foreground mb-4">설명을 적어주세요.</p>
              <Input placeholder="할 일을 입력하세요" className="mb-4" />
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
              <Button className="w-full h-14 bg-primary hover:bg-primary/90 rounded-full">
                <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center mr-2">
                  ↑
                </div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodoList;
