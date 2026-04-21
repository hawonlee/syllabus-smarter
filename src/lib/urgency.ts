import { differenceInDays } from "date-fns";
import type { UrgencyLevel } from "./types";
import { parseDateOnly } from "./date";

export function getUrgency(dueDate: string): UrgencyLevel {
  const parsedDueDate = parseDateOnly(dueDate);
  if (!parsedDueDate) return "low";

  const days = differenceInDays(parsedDueDate, new Date());
  if (days < 0) return "overdue";
  if (days <= 3) return "critical";
  if (days <= 7) return "high";
  if (days <= 14) return "medium";
  return "low";
}

export function getUrgencyLabel(level: UrgencyLevel): string {
  switch (level) {
    case "overdue": return "Overdue";
    case "critical": return "Due soon";
    case "high": return "This week";
    case "medium": return "Next 2 weeks";
    case "low": return "Later";
  }
}
