export interface ExtractedItem {
  id: string;
  type: "assignment" | "exam" | "quiz" | "project" | "other";
  name: string;
  dueDate: string; // ISO date string
  weight?: number; // percentage
  description?: string;
  className: string;
}

export interface ClassInfo {
  name: string;
  instructor?: string;
  instructorEmail?: string;
  ta?: string;
  taEmail?: string;
  officeHours?: string;
}

export interface SyllabusData {
  classInfo: ClassInfo;
  items: ExtractedItem[];
}

export type ViewMode = "calendar" | "cards" | "list";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";
