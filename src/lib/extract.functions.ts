import { createServerFn } from "@tanstack/react-start";
import type { SyllabusData } from "@/lib/types";

export const extractSyllabus = createServerFn({ method: "POST" })
  .inputValidator((data: { text: string }) => {
    if (!data.text || data.text.length < 20) {
      throw new Error("Syllabus text is too short");
    }
    return data;
  })
  .handler(async ({ data }): Promise<SyllabusData> => {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      throw new Error("Groq API key is not configured");
    }

    const systemPrompt = `You are a syllabus parser. Extract structured data from college course syllabi.

Return a JSON object with this exact structure:
{
  "classInfo": {
    "name": "Course name and number",
    "instructor": "Professor name or null",
    "instructorEmail": "Email or null",
    "ta": "TA name or null",
    "taEmail": "TA email or null",
    "officeHours": "Office hours string or null"
  },
  "items": [
    {
      "id": "unique string id (1, 2, 3...)",
      "type": "assignment" | "exam" | "quiz" | "project" | "other",
      "name": "Name of the item",
      "dueDate": "YYYY-MM-DD format",
      "weight": number (percentage, e.g. 10 for 10%) or null,
      "className": "Short class identifier like CS 301",
      "description": "Brief description or null"
    }
  ]
}

Rules:
- Extract ALL assignments, exams, quizzes, projects, and deadlines
- Use YYYY-MM-DD format for dates. If only a month/week is given, estimate a reasonable date
- If the year is not specified, assume the current academic year (2025-2026)
- type must be one of: assignment, exam, quiz, project, other
- Keep names concise but descriptive
- Return ONLY valid JSON, no markdown or extra text`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Parse this syllabus:\n\n${data.text.slice(0, 12000)}` },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Groq API error [${response.status}]:`, errText);
      if (response.status === 429) {
        throw new Error("Rate limited — please wait a moment and try again");
      }
      throw new Error(`AI extraction failed (${response.status})`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content) as SyllabusData;

    // Validate and ensure IDs exist
    if (!parsed.classInfo || !Array.isArray(parsed.items)) {
      throw new Error("AI returned invalid structure");
    }

    parsed.items = parsed.items.map((item, i) => ({
      ...item,
      id: item.id || String(i + 1),
      type: item.type || "other",
      className: item.className || parsed.classInfo.name?.split(" - ")?.[0] || "Unknown",
    }));

    return parsed;
  });
