import { useRef, useEffect, useMemo, useState, DragEvent } from "react";
import { format, startOfWeek, startOfMonth, addDays, getDaysInMonth } from "date-fns";
import { ko } from "date-fns/locale";
import TimeRuler from "./TimeRuler";
import TimeBlockItem from "./TimeBlockItem";
import { ViewMode, Category, TimeBlock } from "./types";
import { calculateOverlapInfo } from "./overlapUtils";

interface TimeBlockAreaProps {
  viewMode: ViewMode;
  selectedDate: Date;
  timeBlocks: TimeBlock[];
  categories: Category[];
  selectedBlockId: string | null;
  hourHeight: number;
  onBlockSelect: (blockId: string) => void;
  onBlockLongPress: (blockId: string) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<TimeBlock>) => void;
  onBlockCreate?: (categoryId: string, startHour: number, duration: number) => void;
  onBlockDelete?: (blockId: string) => void;
}

const TimeBlockArea = ({
  viewMode,
  selectedDate,
  timeBlocks,
  categories,
  selectedBlockId,
  hourHeight,
  onBlockSelect,
  onBlockLongPress,
  onBlockUpdate,
  onBlockCreate,
  onBlockDelete,
}: TimeBlockAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayViewRef = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Filter blocks by selected date for day view
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const filteredBlocks = useMemo(() => {
    if (viewMode === "day") {
      return timeBlocks.filter(block => block.date === selectedDateStr);
    }
    return timeBlocks;
  }, [timeBlocks, selectedDateStr, viewMode]);

  // Calculate overlap info for filtered blocks
  const overlapInfo = useMemo(() => {
    return calculateOverlapInfo(filteredBlocks);
  }, [filteredBlocks]);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current && viewMode === "day") {
      const currentHour = new Date().getHours();
      const scrollPosition = Math.max(0, (currentHour - 2) * hourHeight);
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, [viewMode, hourHeight]);

  const renderColumnHeaders = () => {
    if (viewMode === "day") return null;

    return (
      <div className="flex border-b border-border sticky top-0 bg-background z-20">
        <div className="w-8 shrink-0" />
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
    );
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const categoryId = e.dataTransfer.getData("categoryId");
    if (!categoryId || !dayViewRef.current || !onBlockCreate) return;

    const rect = dayViewRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top + (scrollRef.current?.scrollTop || 0);
    const startHour = Math.max(0, Math.min(22, Math.floor(y / hourHeight)));
    
    onBlockCreate(categoryId, startHour, 2);
  };

  const renderDayView = () => (
    <div 
      ref={dayViewRef}
      className={`flex-1 relative transition-colors ${isDragOver ? "bg-primary/10" : ""}`}
      style={{ height: `${24 * hourHeight}px` }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hour grid lines */}
      {hours.map((hour) => (
        <div
          key={hour}
          className="absolute left-0 right-0 border-b border-border/50"
          style={{ top: `${hour * hourHeight}px`, height: `${hourHeight}px` }}
        />
      ))}
      
      {/* Time blocks - rendered with absolute positioning */}
      {filteredBlocks.map((block) => {
        const category = categories.find((c) => c.id === block.categoryId);
        const overlap = overlapInfo.get(block.id) || { columnIndex: 0, totalColumns: 1 };
        
        return (
          <div
            key={block.id}
            className="absolute"
            style={{ 
              top: `${block.startHour * hourHeight}px`,
              left: `${(overlap.columnIndex / overlap.totalColumns) * 100}%`,
              width: `${100 / overlap.totalColumns}%`,
            }}
          >
            <TimeBlockItem
              block={block}
              category={category}
              categories={categories}
              hourHeight={hourHeight}
              isSelected={selectedBlockId === block.id}
              showLabel={overlap.totalColumns <= 2}
              compact={overlap.totalColumns > 2}
              onSelect={onBlockSelect}
              onLongPress={onBlockLongPress}
              onUpdate={onBlockUpdate}
              onDelete={onBlockDelete}
            />
          </div>
        );
      })}
    </div>
  );

  const renderMultiColumnView = () => {
    const days = viewMode === "week" ? weekDays : monthDays;
    
    return (
      <div className="flex-1 flex">
        {days.map((day, colIndex) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayBlocks = timeBlocks.filter(block => block.date === dayStr);
          
          return (
            <div
              key={colIndex}
              className="flex-1 border-l border-border/30 first:border-l-0 relative"
              style={{ minWidth: 0 }}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-border/50 relative"
                  style={{ height: `${hourHeight}px` }}
                >
                  {dayBlocks
                    .filter((block) => block.startHour === hour)
                    .map((block) => {
                      const category = categories.find((c) => c.id === block.categoryId);
                      return (
                        <TimeBlockItem
                          key={block.id}
                          block={block}
                          category={category}
                          categories={categories}
                          hourHeight={hourHeight}
                          isSelected={selectedBlockId === block.id}
                          showLabel={false}
                          compact={viewMode === "month"}
                          onSelect={onBlockSelect}
                          onLongPress={onBlockLongPress}
                          onUpdate={onBlockUpdate}
                          onDelete={onBlockDelete}
                        />
                      );
                    })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {renderColumnHeaders()}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex">
          <TimeRuler hours={hours} hourHeight={hourHeight} />
          {viewMode === "day" ? renderDayView() : renderMultiColumnView()}
        </div>
      </div>
    </div>
  );
};

export default TimeBlockArea;
