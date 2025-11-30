export type ViewMode = "day" | "week" | "month";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  subCategories?: Category[];
}

export interface TimeBlock {
  id: string;
  categoryId: string;
  startHour: number;
  duration: number;
  dayOffset?: number;
  memo?: string;
  date?: string; // YYYY-MM-DD format
}

export interface ActiveRecording {
  categoryId: string;
  startTime: Date;
}
