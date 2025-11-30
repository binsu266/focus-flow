interface TimeRulerProps {
  hours: number[];
  hourHeight: number;
}

const TimeRuler = ({ hours, hourHeight }: TimeRulerProps) => {
  return (
    <div className="w-8 shrink-0">
      {hours.map((hour) => (
        <div key={hour} className="flex items-start" style={{ height: `${hourHeight}px` }}>
          <span className="text-xs text-muted-foreground pt-1">
            {hour.toString().padStart(2, "0")}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TimeRuler;
