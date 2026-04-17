export interface ExtractedItem {
  id: string;
  type: "assignment" | "exam" | "quiz" | "project" | "other";
  name: string;
  dueDate: string; // ISO date string
  weight?: number; // percentage
  description?: string;
  className: string;
}

/** Teaching assistant, course assistant, UTA, grader, etc. */
export interface CourseAssistant {
  name: string;
  /** e.g. TA, CA, Course Assistant, UTA, GTA */
  role?: string;
  email?: string;
  phone?: string;
  /** Help hours, office hours, or discussion section times for this person */
  officeHours?: string;
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
  /** @deprecated Prefer `assistants`; still populated by some extractions */
  ta?: string;
  /** @deprecated Prefer `assistants`; still populated by some extractions */
  taEmail?: string;
  /** Instructor office hours */
  officeHours?: string;
  /**
   * All teaching assistants, course assistants, UTAs, graders, etc.
   * Include name, contact (email/phone), and hours when the syllabus lists them.
   */
  assistants?: CourseAssistant[];
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

export type UrgencyLevel = "low" | "medium" | "high" | "critical" | "overdue";
