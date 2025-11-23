import { Calendar as CalendarIcon } from "lucide-react";

const Calendar = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center pb-20">
      <div className="text-center space-y-4 p-8">
        <CalendarIcon className="w-16 h-16 text-primary mx-auto" />
        <h2 className="text-2xl font-bold">캘린더</h2>
        <p className="text-muted-foreground">곧 출시될 기능입니다</p>
      </div>
    </div>
  );
};

export default Calendar;
