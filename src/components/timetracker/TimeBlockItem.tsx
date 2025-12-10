import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil, MessageSquare, Clock, Trash2 } from "lucide-react";
import { Category, TimeBlock } from "./types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface TimeBlockItemProps {
  block: TimeBlock;
  category: Category | undefined;
  categories: Category[];
  hourHeight: number;
  isSelected: boolean;
  showLabel: boolean;
  compact?: boolean;
  onSelect: (blockId: string) => void;
  onLongPress: (blockId: string) => void;
  onUpdate?: (blockId: string, updates: Partial<TimeBlock>) => void;
  onDelete?: (blockId: string) => void;
}

const formatTimeValue = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const parseTimeValue = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
};

const TimeBlockItem = ({
  block,
  category,
  categories,
  hourHeight,
  isSelected,
  showLabel,
  compact = false,
  onSelect,
  onLongPress,
  onUpdate,
  onDelete,
}: TimeBlockItemProps) => {
  const { toast } = useToast();
  const [isResizing, setIsResizing] = useState<"top" | "bottom" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showMemoPicker, setShowMemoPicker] = useState(false);
  const [showTimeAdjust, setShowTimeAdjust] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memoValue, setMemoValue] = useState(block.memo || "");
  const [startTime, setStartTime] = useState(formatTimeValue(block.startHour));
  const [endTime, setEndTime] = useState(formatTimeValue(block.startHour + block.duration));
  const [timeError, setTimeError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef({ startHour: block.startHour, duration: block.duration });
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const DRAG_THRESHOLD = 5; // Minimum pixels to move before drag starts

  // Update time values when block changes
  useEffect(() => {
    setStartTime(formatTimeValue(block.startHour));
    setEndTime(formatTimeValue(block.startHour + block.duration));
  }, [block.startHour, block.duration]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // Don't start drag if clicking on resize handles
    if ((e.target as HTMLElement).closest('[data-resize-handle]')) {
      return;
    }
    
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    startValueRef.current = { startHour: block.startHour, duration: block.duration };
    isDraggingRef.current = true;
    hasDraggedRef.current = false;

    // Start listening for drag events immediately
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchmove", handleDragMove, { passive: false });
    document.addEventListener("touchend", handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;
    
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startYRef.current;
    
    // Only start visual drag after threshold is crossed
    if (!hasDraggedRef.current && Math.abs(deltaY) >= DRAG_THRESHOLD) {
      hasDraggedRef.current = true;
      setIsDragging(true);
      onLongPress(block.id);
    }
    
    // Only update position if we've crossed the threshold
    if (hasDraggedRef.current) {
      e.preventDefault();
      const deltaHours = Math.round((deltaY / hourHeight) * 4) / 4; // 15-minute snap
      
      const newStartHour = Math.max(0, Math.min(24 - startValueRef.current.duration, startValueRef.current.startHour + deltaHours));
      if (newStartHour >= 0 && newStartHour + startValueRef.current.duration <= 24) {
        onUpdate?.(block.id, { startHour: newStartHour });
      }
    }
  };

  const handleDragEnd = () => {
    const wasDragging = hasDraggedRef.current;
    isDraggingRef.current = false;
    hasDraggedRef.current = false;
    setIsDragging(false);
    
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
    document.removeEventListener("touchmove", handleDragMove);
    document.removeEventListener("touchend", handleDragEnd);
    
    return wasDragging;
  };

  const handleClick = (e: React.MouseEvent) => {
    // If we were dragging, don't trigger click
    if (hasDraggedRef.current) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    onSelect(block.id);
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, direction: "top" | "bottom") => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(direction);
    
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    startValueRef.current = { startHour: block.startHour, duration: block.duration };

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveY = "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const deltaY = moveY - startYRef.current;
      const deltaHours = Math.round((deltaY / hourHeight) * 4) / 4; // 15-minute snap

      if (direction === "top") {
        const newStartHour = Math.max(0, Math.min(23, startValueRef.current.startHour + deltaHours));
        const newDuration = Math.max(0.25, startValueRef.current.duration - deltaHours);
        if (newStartHour >= 0 && newDuration >= 0.25) {
          onUpdate?.(block.id, { startHour: newStartHour, duration: newDuration });
        }
      } else {
        const newDuration = Math.max(0.25, startValueRef.current.duration + deltaHours);
        if (startValueRef.current.startHour + newDuration <= 24) {
          onUpdate?.(block.id, { duration: newDuration });
        }
      }
    };

    const handleEnd = () => {
      setIsResizing(null);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleEnd);
  };

  const handleCategoryChange = (categoryId: string) => {
    onUpdate?.(block.id, { categoryId });
    setShowCategoryPicker(false);
  };

  const handleMemoSave = () => {
    onUpdate?.(block.id, { memo: memoValue });
    setShowMemoPicker(false);
  };

  const handleTimeAdjustOpen = () => {
    setStartTime(formatTimeValue(block.startHour));
    setEndTime(formatTimeValue(block.startHour + block.duration));
    setTimeError(null);
    setShowTimeAdjust(true);
  };

  const handleTimeAdjustSave = () => {
    const newStartHour = parseTimeValue(startTime);
    const newEndHour = parseTimeValue(endTime);
    
    if (newEndHour <= newStartHour) {
      setTimeError("종료 시간은 시작 시간보다 이후여야 합니다");
      return;
    }
    
    if (newStartHour < 0 || newEndHour > 24) {
      setTimeError("시간은 0:00 ~ 24:00 사이여야 합니다");
      return;
    }

    const newDuration = newEndHour - newStartHour;
    onUpdate?.(block.id, { startHour: newStartHour, duration: newDuration });
    setShowTimeAdjust(false);
    toast({
      title: "시간이 조정되었습니다",
      duration: 2000,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onDelete) {
      onDelete(block.id);
      toast({
        title: "삭제되었습니다",
        duration: 2000,
      });
    }
    setShowDeleteConfirm(false);
  };

  // Reset menu state when popover closes
  const isPopoverOpen = isSelected && !isResizing && !isDragging && !showTimeAdjust && !showDeleteConfirm;
  
  useEffect(() => {
    if (!isPopoverOpen) {
      // Reset to root menu when popover closes
      setShowCategoryPicker(false);
      setShowMemoPicker(false);
      setMemoValue(block.memo || "");
    }
  }, [isPopoverOpen, block.memo]);

  const handleBackdropClick = () => {
    onSelect(block.id); // This will toggle off the selection
  };

  return (
    <>
      {/* Full-screen backdrop overlay */}
      {isPopoverOpen && (
        <motion.div
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
          style={{ backgroundColor: 'transparent' }}
        />
      )}
      
      <Popover open={isPopoverOpen}>
        <PopoverTrigger asChild>
          <motion.div
            ref={containerRef}
            className={`absolute ${compact ? "inset-x-0.5" : "left-1 right-1"} ${category?.color} cursor-pointer ${
              isSelected ? "ring-2 ring-primary ring-offset-1 z-30" : "z-10"
            } ${compact ? "rounded-sm" : "rounded-lg"} ${isDragging ? "z-40 opacity-90" : ""}`}
            style={{
              height: `${block.duration * hourHeight}px`,
              top: 0,
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ 
              scale: isDragging ? 1.03 : 1, 
              opacity: isDragging ? 0.9 : 1,
              boxShadow: isSelected 
                ? "0 8px 16px -4px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)" 
                : isDragging 
                  ? "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
                  : "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            whileHover={{ 
              scale: compact ? 1 : 1.01,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.08)",
            }}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {showLabel ? (
              <div className="p-2 flex items-center gap-1 h-full overflow-hidden">
                <span className="text-lg">{category?.icon}</span>
                <span className="text-sm font-medium truncate">{category?.name}</span>
                {block.memo && <MessageSquare className="w-3 h-3 ml-auto opacity-70" />}
              </div>
            ) : (
            <div className="flex items-center justify-center h-full">
                {!compact && <span className="text-sm">{category?.icon}</span>}
                {compact && <span className="hidden md:inline text-[8px]">{category?.icon}</span>}
              </div>
            )}
            
            {/* Resize handles when selected */}
            {isSelected && !compact && (
              <>
                <div
                  data-resize-handle
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-8 h-3 bg-primary rounded-full cursor-ns-resize flex items-center justify-center hover:bg-primary/80 active:bg-primary/70 z-50"
                  onMouseDown={(e) => handleResizeStart(e, "top")}
                  onTouchStart={(e) => handleResizeStart(e, "top")}
                >
                  <div className="w-4 h-0.5 bg-primary-foreground rounded-full" />
                </div>
                <div
                  data-resize-handle
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-8 h-3 bg-primary rounded-full cursor-ns-resize flex items-center justify-center hover:bg-primary/80 active:bg-primary/70 z-50"
                  onMouseDown={(e) => handleResizeStart(e, "bottom")}
                  onTouchStart={(e) => handleResizeStart(e, "bottom")}
                >
                  <div className="w-4 h-0.5 bg-primary-foreground rounded-full" />
                </div>
              </>
            )}
          </motion.div>
        </PopoverTrigger>
        
        <PopoverContent side="right" align="start" className="w-56 p-2">
          {!showCategoryPicker && !showMemoPicker ? (
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => setShowCategoryPicker(true)}
              >
                <Pencil className="w-4 h-4" />
                카테고리 수정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  setMemoValue(block.memo || "");
                  setShowMemoPicker(true);
                }}
              >
                <MessageSquare className="w-4 h-4" />
                {block.memo ? "메모 수정" : "메모 추가"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={handleTimeAdjustOpen}
              >
                <Clock className="w-4 h-4" />
                시간 조정
              </Button>
              <Separator className="my-1" />
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </Button>
            </div>
          ) : showCategoryPicker ? (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              <div className="text-xs text-muted-foreground mb-1 px-2">카테고리 선택</div>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={cat.id === block.categoryId ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-start gap-2"
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={() => setShowCategoryPicker(false)}
              >
                취소
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-xs text-muted-foreground">메모</div>
              <Input
                value={memoValue}
                onChange={(e) => setMemoValue(e.target.value)}
                placeholder="메모를 입력하세요"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowMemoPicker(false)}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleMemoSave}
                >
                  저장
                </Button>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Time Adjust Sheet */}
      <Sheet open={showTimeAdjust} onOpenChange={setShowTimeAdjust}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>시간 조정</SheetTitle>
          </SheetHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">시작 시간</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setTimeError(null);
                }}
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">종료 시간</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setTimeError(null);
                }}
                className="text-lg"
              />
            </div>
            {timeError && (
              <p className="text-sm text-destructive">{timeError}</p>
            )}
          </div>
          <SheetFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowTimeAdjust(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handleTimeAdjustSave}
            >
              저장
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>시간 기록 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 시간 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              삭제
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TimeBlockItem;
