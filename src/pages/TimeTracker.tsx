import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import TimeTrackerHeader from "@/components/timetracker/TimeTrackerHeader";
import OneThingBanner from "@/components/timetracker/OneThingBanner";
import TimeBlockArea from "@/components/timetracker/TimeBlockArea";
import CategoryList from "@/components/timetracker/CategoryList";
import OneThingModal from "@/components/OneThingModal";
import { ViewMode, Category, TimeBlock, ActiveRecording } from "@/components/timetracker/types";

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

// Generate dummy data for November 24 to December 31
const generateDummyData = (): TimeBlock[] => {
  const blocks: TimeBlock[] = [];
  const categoryIds = categories.map(c => c.id);
  
  // Generate November 24-30
  for (let day = 24; day <= 30; day++) {
    const numBlocks = Math.floor(Math.random() * 4) + 2;
    const usedHours = new Set<number>();
    
    for (let i = 0; i < numBlocks; i++) {
      let startHour: number;
      do {
        startHour = Math.floor(Math.random() * 20);
      } while (usedHours.has(startHour) || usedHours.has(startHour + 1));
      
      const duration = Math.floor(Math.random() * 3) + 1;
      usedHours.add(startHour);
      usedHours.add(startHour + duration);
      
      blocks.push({
        id: `nov-${day}-${i}`,
        categoryId: categoryIds[Math.floor(Math.random() * categoryIds.length)],
        startHour,
        duration,
        date: `2025-11-${day.toString().padStart(2, '0')}`,
      });
    }
  }
  
  // Generate December 1-31
  for (let day = 1; day <= 31; day++) {
    const numBlocks = Math.floor(Math.random() * 4) + 2;
    const usedHours = new Set<number>();
    
    for (let i = 0; i < numBlocks; i++) {
      let startHour: number;
      do {
        startHour = Math.floor(Math.random() * 20);
      } while (usedHours.has(startHour) || usedHours.has(startHour + 1));
      
      const duration = Math.floor(Math.random() * 3) + 1;
      usedHours.add(startHour);
      usedHours.add(startHour + duration);
      
      blocks.push({
        id: `dec-${day}-${i}`,
        categoryId: categoryIds[Math.floor(Math.random() * categoryIds.length)],
        startHour,
        duration,
        date: `2025-12-${day.toString().padStart(2, '0')}`,
      });
    }
  }
  
  return blocks;
};

const dummyData = generateDummyData();

const TimeTracker = () => {
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [oneThing, setOneThing] = useState("아바투스 다 읽기");
  const [showOneThingModal, setShowOneThingModal] = useState(false);
  
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(dummyData);
  
  const [activeRecording, setActiveRecording] = useState<ActiveRecording | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [zoomScale] = useState(1);

  const hourHeight = 48 * zoomScale;

  const cycleViewMode = useCallback(() => {
    setViewMode((prev) => {
      if (prev === "day") return "week";
      if (prev === "week") return "month";
      return "day";
    });
  }, []);

  const handleStartRecording = useCallback((categoryId: string) => {
    if (activeRecording) {
      const endTime = new Date();
      const startHour = activeRecording.startTime.getHours();
      const duration = Math.max(1, Math.round((endTime.getTime() - activeRecording.startTime.getTime()) / (1000 * 60 * 60)));
      
      const newBlock: TimeBlock = {
        id: `recording-${Date.now()}`,
        categoryId: activeRecording.categoryId,
        startHour,
        duration,
        dayOffset: 0,
      };
      
      setTimeBlocks((prev) => [...prev, newBlock]);
    }

    const category = categories.find((c) => c.id === categoryId);
    setActiveRecording({
      categoryId,
      startTime: new Date(),
    });
    toast.success(`${category?.icon} ${category?.name} 기록 시작`);
  }, [activeRecording]);

  const handleStopRecording = useCallback(() => {
    if (!activeRecording) return;

    const endTime = new Date();
    const startHour = activeRecording.startTime.getHours();
    const duration = Math.max(1, Math.round((endTime.getTime() - activeRecording.startTime.getTime()) / (1000 * 60 * 60)));
    
    const newBlock: TimeBlock = {
      id: `recording-${Date.now()}`,
      categoryId: activeRecording.categoryId,
      startHour,
      duration,
      dayOffset: 0,
    };
    
    setTimeBlocks((prev) => [...prev, newBlock]);
    
    const category = categories.find((c) => c.id === activeRecording.categoryId);
    toast.success(`${category?.icon} ${category?.name} 기록 완료`);
    setActiveRecording(null);
  }, [activeRecording]);

  const handleBlockSelect = useCallback((blockId: string) => {
    setSelectedBlockId((prev) => (prev === blockId ? null : blockId));
  }, []);

  const handleBlockLongPress = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
    toast.info("블록을 드래그하여 이동하세요");
  }, []);

  const handleCategoryEdit = useCallback(() => {
    navigate("/settings");
    toast.info("카테고리 수정 기능은 설정에서 이용 가능합니다");
  }, [navigate]);

  const handleMorningProgramEdit = useCallback(() => {
    navigate("/settings");
    toast.info("아침 동기부여 프로그램 설정으로 이동합니다");
  }, [navigate]);

  const handleOneThingSave = useCallback((value: string) => {
    setOneThing(value);
    setShowOneThingModal(false);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <TimeTrackerHeader
        viewMode={viewMode}
        selectedDate={selectedDate}
        onViewModeChange={cycleViewMode}
        onDateSelect={setSelectedDate}
        onCategoryEdit={handleCategoryEdit}
        onMorningProgramEdit={handleMorningProgramEdit}
      />

      <OneThingBanner oneThing={oneThing} onClick={() => setShowOneThingModal(true)} />

      <div className="flex flex-1 mt-4 px-2 overflow-hidden min-h-0">
        <div className={`${viewMode === "day" ? "flex-1" : "flex-1"} overflow-hidden`}>
          <TimeBlockArea
            viewMode={viewMode}
            selectedDate={selectedDate}
            timeBlocks={timeBlocks}
            categories={categories}
            selectedBlockId={selectedBlockId}
            hourHeight={hourHeight}
            onBlockSelect={handleBlockSelect}
            onBlockLongPress={handleBlockLongPress}
            onBlockUpdate={(blockId, updates) => {
              setTimeBlocks((prev) =>
                prev.map((block) =>
                  block.id === blockId ? { ...block, ...updates } : block
                )
              );
            }}
          />
        </div>

        <AnimatePresence>
          {viewMode === "day" && (
            <motion.div
              className="flex-1 overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <CategoryList
                categories={categories}
                activeRecording={activeRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <OneThingModal
        isOpen={showOneThingModal}
        onClose={() => setShowOneThingModal(false)}
        onSave={handleOneThingSave}
        initialValue={oneThing}
      />
    </div>
  );
};

export default TimeTracker;
