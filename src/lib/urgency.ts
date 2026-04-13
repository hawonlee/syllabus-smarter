import { differenceInDays } from "date-fns";
import type { UrgencyLevel } from "./types";

export function getUrgency(dueDate: string): UrgencyLevel {
  const days = differenceInDays(new Date(dueDate), new Date());
  if (days < 0) return "critical";
  if (days <= 3) return "critical";
  if (days <= 7) return "high";
  if (days <= 14) return "medium";
  return "low";
}

export function getUrgencyLabel(level: UrgencyLevel): string {
  switch (level) {
    case "critical": return "Due soon";
    case "high": return "This week";
    case "medium": return "Next 2 weeks";
    case "low": return "Later";
  }
}
