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
  /**
   * Optional short identifier used for matching items (e.g. "CS 301").
   * If omitted, the UI will fall back to deriving it from `name`.
   */
  code?: string;
  /**
   * Optional class color (hex string) used in UI (e.g. calendar dots).
   */
  color?: string;
  instructor?: string;
  instructorEmail?: string;
  ta?: string;
  taEmail?: string;
  officeHours?: string;
}

export interface SyllabusData {
  /**
   * Client-side identifier for CRUD operations.
   */
  id?: string;
  classInfo: ClassInfo;
  items: ExtractedItem[];
}

export type ViewMode = "calendar" | "cards" | "list";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";
