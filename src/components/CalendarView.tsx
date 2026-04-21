import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay } from "date-fns";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { ExtractedItem } from "@/lib/types";
import { parseDateOnly } from "@/lib/date";
import { Checkbox } from "@/components/ui/checkbox";

interface CalendarViewProps {
  items: ExtractedItem[];
  completedTaskIds: Set<string>;
  classColorByName?: Record<string, string>;
  onToggleTaskCompletion: (itemId: string, checked: boolean) => void;
}

export function CalendarView({
  items,
  completedTaskIds,
  classColorByName,
  onToggleTaskCompletion,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekCount = Math.ceil(days.length / 7);

  const prev = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1));
  const next = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1));

  const getItemsForDay = (day: Date) =>
    items.filter((item) => {
      const dueDate = parseDateOnly(item.dueDate);
      return dueDate ? isSameDay(dueDate, day) : false;
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-full w-full min-h-0 flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="flex gap-1">
          <button onClick={prev} className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={next} className="p-1.5 rounded-md hover:bg-accent transition-colors">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div
        className="grid flex-1 min-h-0 grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border"
        style={{ gridTemplateRows: `repeat(${weekCount}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const dayItems = getItemsForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-0 p-1.5 bg-card transition-colors
                ${!inMonth ? "opacity-70" : ""}
                ${today ? "bg-white/50" : ""}
              `}
            >
              <span className={`
                text-[11px] font-medium
                ${today ? "bg-red-600 text-background rounded-full w-6 h-6 flex items-center justify-center" : "text-muted-foreground"}
              `}>
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayItems.slice(0, 2).map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-1 group min-w-0"
                    title={`${item.name} (${item.type})`}
                  >
                    {(() => {
                      const classColor = classColorByName?.[item.className] ?? "#6B7280";
                      return (
                        <div className="flex items-center gap-2 min-w-0 w-full">
                          <span
                            className="inline-flex w-full items-center rounded-md px-2 py-1 gap-1 text-xs text-white"
                            style={{
                              backgroundColor: `${classColor}20`,
                            }}
                          >
                            <Checkbox
                              checked={completedTaskIds.has(item.id)}
                              onCheckedChange={(checked) => onToggleTaskCompletion(item.id, checked === true)}
                              aria-label={`Mark ${item.name} complete`}
                              className="h-3 w-3"
                              style={{ borderColor: classColor, color: classColor }}
                            />
                            <span
                              className={`truncate ${completedTaskIds.has(item.id) ? "line-through" : ""}`}
                              style={{ color: classColor }}
                            >
                              {item.name}
                            </span>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                ))}
                {dayItems.length > 2 && (
                  <span className="text-[9px] text-muted-foreground">+{dayItems.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
