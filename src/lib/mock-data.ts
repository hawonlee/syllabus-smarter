import type { SyllabusData } from "./types";

export const mockSyllabusData: SyllabusData = {
  classInfo: {
    name: "CS 301 - Data Structures",
    instructor: "Dr. Sarah Chen",
    instructorEmail: "schen@university.edu",
    officeHours: "Mon/Wed 2-4 PM, Room 312",
    assistants: [
      {
        name: "Alex Rivera",
        role: "TA",
        email: "arivera@university.edu",
        officeHours: "Thu 1–3 PM, CS lounge",
      },
      {
        name: "Jordan Kim",
        role: "Course Assistant",
        email: "jkim@university.edu",
        phone: "555-0102",
        officeHours: "Fri 10 AM–12 PM, Zoom",
      },
    ],
  },
  items: [
    {
      id: "1",
      type: "assignment",
      name: "Homework 1: Linked Lists",
      dueDate: "2026-04-15",
      weight: 5,
      className: "CS 301",
      description: "Implement singly and doubly linked lists",
    },
    {
      id: "2",
      type: "exam",
      name: "Midterm Exam",
      dueDate: "2026-04-21",
      weight: 25,
      className: "CS 301",
      description: "Covers chapters 1-6",
    },
    {
      id: "3",
      type: "assignment",
      name: "Homework 2: Binary Trees",
      dueDate: "2026-04-27",
      weight: 5,
      className: "CS 301",
    },
    {
      id: "4",
      type: "quiz",
      name: "Quiz 3: Hash Tables",
      dueDate: "2026-04-18",
      weight: 3,
      className: "CS 301",
    },
    {
      id: "5",
      type: "project",
      name: "Final Project: Graph Algorithms",
      dueDate: "2026-05-13",
      weight: 20,
      className: "CS 301",
      description: "Implement Dijkstra's and BFS/DFS",
    },
    {
      id: "6",
      type: "exam",
      name: "Final Exam",
      dueDate: "2026-05-28",
      weight: 30,
      className: "CS 301",
      description: "Comprehensive final covering all material",
    },
  ],
};
