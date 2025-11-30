import { Category, TimeBlock } from "@/components/timetracker/types";

export const categories: Category[] = [
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

export const categoryColors: Record<string, string> = {
  sleep: "hsl(var(--category-sleep))",
  meal: "hsl(var(--category-meal))",
  exercise: "hsl(var(--category-exercise))",
  work: "hsl(var(--category-work))",
  reading: "hsl(var(--category-reading))",
  study: "hsl(var(--category-study))",
  housework: "hsl(var(--category-housework))",
  rest: "hsl(var(--category-rest))",
  waste: "hsl(var(--category-waste))",
};

// Generate dummy data for November 24 to December 31
export const generateDummyData = (): TimeBlock[] => {
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

// Singleton instance for shared data
let dummyDataInstance: TimeBlock[] | null = null;

export const getDummyData = (): TimeBlock[] => {
  if (!dummyDataInstance) {
    dummyDataInstance = generateDummyData();
  }
  return dummyDataInstance;
};
