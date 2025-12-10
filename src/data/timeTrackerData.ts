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
  { id: "commute", name: "이동", icon: "🚌", color: "bg-category-commute" },
  { id: "social", name: "사회활동", icon: "👥", color: "bg-category-social" },
  { id: "routine", name: "정리", icon: "✓", color: "bg-category-routine" },
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
  commute: "hsl(var(--category-commute))",
  social: "hsl(var(--category-social))",
  routine: "hsl(var(--category-routine))",
};

// 평일 일과 (대학생 기준)
const weekdaySchedule: Array<{ categoryId: string; startHour: number; duration: number }> = [
  { categoryId: "sleep", startHour: 0, duration: 7 },      // 00:00 ~ 07:00 잠
  { categoryId: "meal", startHour: 7, duration: 1 },       // 07:00 ~ 08:00 아침 식사
  { categoryId: "commute", startHour: 8, duration: 1 },    // 08:00 ~ 09:00 이동
  { categoryId: "study", startHour: 9, duration: 3 },      // 09:00 ~ 12:00 공부/수업
  { categoryId: "meal", startHour: 12, duration: 1 },      // 12:00 ~ 13:00 점심 식사
  { categoryId: "study", startHour: 13, duration: 2 },     // 13:00 ~ 15:00 공부/수업
  { categoryId: "rest", startHour: 15, duration: 0.5 },    // 15:00 ~ 15:30 휴식
  { categoryId: "reading", startHour: 15.5, duration: 1.5 }, // 15:30 ~ 17:00 독서
  { categoryId: "exercise", startHour: 17, duration: 1 },  // 17:00 ~ 18:00 운동
  { categoryId: "meal", startHour: 18, duration: 1 },      // 18:00 ~ 19:00 저녁 식사
  { categoryId: "work", startHour: 19, duration: 2 },      // 19:00 ~ 21:00 알바
  { categoryId: "commute", startHour: 21, duration: 1 },   // 21:00 ~ 22:00 이동/귀가
  { categoryId: "waste", startHour: 22, duration: 1 },     // 22:00 ~ 23:00 시간 낭비
  { categoryId: "routine", startHour: 23, duration: 1 },   // 23:00 ~ 24:00 정리/취침 준비
];

// 주말 일과
const weekendSchedule: Array<{ categoryId: string; startHour: number; duration: number }> = [
  { categoryId: "sleep", startHour: 1, duration: 8 },      // 01:00 ~ 09:00 잠
  { categoryId: "meal", startHour: 9, duration: 1 },       // 09:00 ~ 10:00 아침 식사
  { categoryId: "rest", startHour: 10, duration: 2 },      // 10:00 ~ 12:00 힐링/휴식
  { categoryId: "meal", startHour: 12, duration: 1 },      // 12:00 ~ 13:00 점심 식사
  { categoryId: "social", startHour: 13, duration: 2 },    // 13:00 ~ 15:00 사회 활동
  { categoryId: "reading", startHour: 15, duration: 2 },   // 15:00 ~ 17:00 독서/자기계발
  { categoryId: "exercise", startHour: 17, duration: 1 },  // 17:00 ~ 18:00 운동
  { categoryId: "meal", startHour: 18, duration: 1 },      // 18:00 ~ 19:00 저녁 식사
  { categoryId: "waste", startHour: 19, duration: 3 },     // 19:00 ~ 22:00 시간 낭비
  { categoryId: "housework", startHour: 22, duration: 2 }, // 22:00 ~ 24:00 집안일/정리
  { categoryId: "routine", startHour: 0, duration: 1 },    // 24:00 ~ 01:00 취침 준비
];

// 약간의 변형을 위한 헬퍼 함수
const addVariation = (value: number, maxVariation: number = 0.25): number => {
  const variation = (Math.random() - 0.5) * 2 * maxVariation;
  return Math.round((value + variation) * 4) / 4; // 15분 단위로 반올림
};

// Generate realistic dummy data
export const generateDummyData = (): TimeBlock[] => {
  const blocks: TimeBlock[] = [];
  
  // Generate November 24-30
  for (let day = 24; day <= 30; day++) {
    const date = new Date(2025, 10, day); // November is month 10
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const schedule = isWeekend ? weekendSchedule : weekdaySchedule;
    
    schedule.forEach((item, index) => {
      // 약간의 시간 변형 추가 (더 자연스럽게)
      const startVariation = index === 0 ? 0 : addVariation(0, 0.25);
      const durationVariation = addVariation(0, 0.25);
      
      blocks.push({
        id: `nov-${day}-${index}`,
        categoryId: item.categoryId,
        startHour: Math.max(0, Math.min(23.75, item.startHour + startVariation)),
        duration: Math.max(0.25, item.duration + durationVariation),
        date: `2025-11-${day.toString().padStart(2, '0')}`,
      });
    });
  }
  
  // Generate December 1-31
  for (let day = 1; day <= 31; day++) {
    const date = new Date(2025, 11, day); // December is month 11
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const schedule = isWeekend ? weekendSchedule : weekdaySchedule;
    
    schedule.forEach((item, index) => {
      const startVariation = index === 0 ? 0 : addVariation(0, 0.25);
      const durationVariation = addVariation(0, 0.25);
      
      blocks.push({
        id: `dec-${day}-${index}`,
        categoryId: item.categoryId,
        startHour: Math.max(0, Math.min(23.75, item.startHour + startVariation)),
        duration: Math.max(0.25, item.duration + durationVariation),
        date: `2025-12-${day.toString().padStart(2, '0')}`,
      });
    });
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
