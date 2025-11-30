import { useRef, useEffect } from "react";
import { format, startOfWeek, startOfMonth, addDays, getDaysInMonth } from "date-fns";
import { ko } from "date-fns/locale";
import TimeRuler from "./TimeRuler";
import TimeBlockItem from "./TimeBlockItem";
import { ViewMode, Category, TimeBlock } from "./types";

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
}: TimeBlockAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hours = Array.from({ length: 24 }, (_, i) => i);

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

  const getColumnsForView = () => {
    if (viewMode === "week") return 7;
    if (viewMode === "month") return getDaysInMonth(selectedDate);
    return 1;
  };

  const columnCount = getColumnsForView();

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

  const renderDayView = () => (
    <div className="flex-1 relative">
      {hours.map((hour) => (
        <div
          key={hour}
          className="border-b border-border/50 relative"
          style={{ height: `${hourHeight}px` }}
        >
          {timeBlocks
            .filter(
              (block) =>
                block.startHour === hour &&
                (block.dayOffset === 0 || block.dayOffset === undefined)
            )
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
                  showLabel={true}
                  onSelect={onBlockSelect}
                  onLongPress={onBlockLongPress}
                  onUpdate={onBlockUpdate}
                />
              );
            })}
        </div>
      ))}
    </div>
  );

  const renderMultiColumnView = () => (
    <div className="flex-1 flex">
      {Array.from({ length: columnCount }, (_, colIndex) => (
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
              {timeBlocks
                .filter((block) => block.startHour === hour && block.dayOffset === colIndex)
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
                    />
                  );
                })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

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
