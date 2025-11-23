import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Todo {
  id: string;
  content: string;
  time?: string;
  category?: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  section: "today" | "tomorrow";
}

const priorityColors = {
  high: "bg-destructive",
  medium: "bg-accent",
  low: "bg-primary",
};

const categoryIcons: Record<string, string> = {
  study: "📚",
  work: "💼",
  exercise: "🏃",
  reading: "📖",
  housework: "🧹",
};

const TodoList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "1",
      content: "청년프론티어십 3차시 과제",
      time: "오늘 13:00",
      priority: "high",
      completed: false,
      section: "today",
    },
    {
      id: "2",
      content: "도서관에서 책 반납하기",
      time: "오늘 15:30",
      category: "『아비투스』",
      priority: "medium",
      completed: false,
      section: "today",
    },
    {
      id: "3",
      content: "재학증명서 발급받기",
      time: "오늘 16:00",
      priority: "low",
      completed: false,
      section: "today",
    },
    {
      id: "4",
      content: "디지털 창업 공모전 회의",
      time: "내일 11:30",
      priority: "high",
      completed: false,
      section: "tomorrow",
    },
  ]);

  const categoryOptions = [
    { icon: "☕", label: "커피" },
    { icon: "📚", label: "독서" },
    { icon: "🏢", label: "업무" },
    { icon: "👤", label: "인물" },
    { icon: "✏️", label: "공부" },
    { icon: "🛒", label: "쇼핑" },
  ];

  const toggleTodo = (id: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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

        {/* Category Filter */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="rounded-full shrink-0">
              전체
            </Button>
            {categoryOptions.map((cat, i) => (
              <Button key={i} variant="ghost" size="sm" className="rounded-full shrink-0 bg-muted/50">
                {cat.icon}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Todo Sections */}
      <div className="px-4 py-4 space-y-6">
        {/* Today */}
        <section>
          <h2 className="text-lg font-bold mb-3">오늘</h2>
          <div className="space-y-2">
            {todos
              .filter((todo) => todo.section === "today")
              .map((todo) => (
                <motion.div
                  key={todo.id}
                  className="bg-card rounded-xl p-4 flex items-center gap-3 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="w-6 h-6"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                      {todo.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{todo.time}</span>
                      {todo.category && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {todo.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${priorityColors[todo.priority]}`} />
                </motion.div>
              ))}
          </div>
        </section>

        {/* Tomorrow */}
        <section>
          <h2 className="text-lg font-bold mb-3">내일</h2>
          <div className="space-y-2">
            {todos
              .filter((todo) => todo.section === "tomorrow")
              .map((todo) => (
                <motion.div
                  key={todo.id}
                  className="bg-card rounded-xl p-4 flex items-center gap-3 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                    className="w-6 h-6"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                      {todo.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{todo.time}</span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${priorityColors[todo.priority]}`} />
                </motion.div>
              ))}
          </div>
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
