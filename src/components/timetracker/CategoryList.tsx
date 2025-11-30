import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, ChevronRight, ChevronDown } from "lucide-react";
import { Category, ActiveRecording } from "./types";

interface CategoryListProps {
  categories: Category[];
  activeRecording: ActiveRecording | null;
  onStartRecording: (categoryId: string) => void;
  onStopRecording: () => void;
}

// Map category id to CSS variable color class
const getCategoryButtonStyle = (categoryId: string): string => {
  const colorMap: Record<string, string> = {
    sleep: "bg-category-sleep",
    meal: "bg-category-meal",
    exercise: "bg-category-exercise",
    work: "bg-category-work",
    reading: "bg-category-reading",
    study: "bg-category-study",
    housework: "bg-category-housework",
    rest: "bg-category-rest",
    waste: "bg-category-waste",
  };
  return colorMap[categoryId] || "bg-primary/10";
};

const CategoryList = ({
  categories,
  activeRecording,
  onStartRecording,
  onStopRecording,
}: CategoryListProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePlayClick = (categoryId: string) => {
    if (activeRecording?.categoryId === categoryId) {
      onStopRecording();
    } else {
      onStartRecording(categoryId);
    }
  };

  const renderCategory = (category: Category, isSubCategory = false) => {
    const isRecording = activeRecording?.categoryId === category.id;
    const isExpanded = expandedCategories.includes(category.id);
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    const buttonColorClass = getCategoryButtonStyle(category.id);

    return (
      <div key={category.id}>
        <motion.div
          className={`w-full flex items-center gap-2 p-2 rounded-lg bg-card hover:bg-muted transition-colors ${
            isSubCategory ? "ml-4 w-[calc(100%-1rem)]" : ""
          }`}
          whileTap={{ scale: 0.98 }}
        >
          {/* Play/Pause Button */}
          <button
            onClick={() => handlePlayClick(category.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isRecording
                ? "bg-destructive"
                : buttonColorClass
            }`}
          >
            {isRecording ? (
              <Pause className="w-3 h-3 text-foreground fill-current" />
            ) : (
              <Play className="w-3 h-3 text-foreground fill-foreground" />
            )}
          </button>

          {/* Category Info */}
          <div className="flex-1 text-left">
            <div className="text-lg">{category.icon}</div>
            <div className="text-xs">{category.name}</div>
          </div>

          {/* Expand/Collapse Button */}
          {hasSubCategories ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </motion.div>

        {/* Sub-categories */}
        <AnimatePresence>
          {hasSubCategories && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {category.subCategories!.map((sub) => renderCategory(sub, true))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto space-y-1 pr-1">
      {categories.map((category) => renderCategory(category))}
    </div>
  );
};

export default CategoryList;
