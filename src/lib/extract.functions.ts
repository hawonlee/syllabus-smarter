import { createServerFn } from "@tanstack/react-start";
import type { ClassInfo, CourseAssistant, SyllabusData } from "@/lib/types";

function normalizeClassInfo(classInfo: ClassInfo): ClassInfo {
  const rawList = Array.isArray(classInfo.assistants) ? classInfo.assistants : [];
  const assistants: CourseAssistant[] = rawList
    .filter((a): a is Record<string, unknown> => a != null && typeof a === "object")
    .map((a) => ({
      name: String(a.name ?? "").trim(),
      role: a.role != null && String(a.role).trim() ? String(a.role).trim() : undefined,
      email: a.email != null && String(a.email).trim() ? String(a.email).trim() : undefined,
      phone: a.phone != null && String(a.phone).trim() ? String(a.phone).trim() : undefined,
      officeHours:
        a.officeHours != null && String(a.officeHours).trim()
          ? String(a.officeHours).trim()
          : undefined,
    }))
    .filter((a) => a.name.length > 0);

  if (assistants.length === 0 && classInfo.ta?.trim()) {
    assistants.push({
      name: classInfo.ta.trim(),
      role: "TA",
      email: classInfo.taEmail?.trim() || undefined,
    });
  }

  return {
    ...classInfo,
    assistants: assistants.length > 0 ? assistants : undefined,
  };
}

function summarizeGroqError(status: number, body: string): string {
  const trimmed = body.trim();
  if (!trimmed) {
    return status === 403
      ? "Groq rejected the request (403). Check your API key permissions and that your Groq account can access the selected model."
      : `Groq request failed (${status}).`;
  }

  try {
    const json = JSON.parse(trimmed) as {
      error?: { message?: string } | string;
      message?: string;
    };
    const msg =
      (typeof json?.error === "object" && json.error?.message) ||
      (typeof json?.error === "string" ? json.error : null) ||
      json?.message;
    if (typeof msg === "string" && msg.trim()) {
      return `Groq error (${status}): ${msg.trim()}`;
    }
  } catch {
    // ignore
  }

  const short = trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed;
  return `Groq error (${status}): ${short}`;
}

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

    const now = new Date();
    const currentYear = now.getFullYear();
    const hasExplicitYearInText = /\b(19|20)\d{2}\b/.test(data.text);

    const systemPrompt = `You are a syllabus parser. Extract structured data from college course syllabi.

Return a JSON object with this exact structure:
{
  "classInfo": {
    "name": "Course name and number",
    "instructor": "Professor name or null",
    "instructorEmail": "Email or null",
    "officeHours": "Instructor office hours string or null",
    "ta": "Primary TA name or null (legacy; prefer assistants)",
    "taEmail": "Primary TA email or null (legacy; prefer assistants)",
    "assistants": [
      {
        "name": "Full name",
        "role": "TA | CA | Course Assistant | UTA | GTA | Grader | other short label or null",
        "email": "Email or null",
        "phone": "Phone or null",
        "officeHours": "This person's help/office hours or discussion hours or null"
      }
    ]
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
- Extract ALL teaching assistants (TA), course assistants (CA), UTAs, GTAs, graders, etc. into classInfo.assistants with name, role label, email, phone, and officeHours/help hours when listed. If the syllabus only has one TA, still use a one-element assistants array. Use classInfo.officeHours only for the instructor; each assistant's hours go in assistants[].officeHours.
- Use YYYY-MM-DD format for dates. If only a month/week is given, estimate a reasonable date
- If the year is not specified or is unclear, assume the current year (${currentYear})
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
      if (response.status === 401) {
        throw new Error(
          "Groq authentication failed (401). Your GROQ_API_KEY is missing, revoked, or incorrect."
        );
      }
      throw new Error(summarizeGroqError(response.status, errText));
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

    parsed.classInfo = normalizeClassInfo(parsed.classInfo);

    parsed.items = parsed.items.map((item, i) => ({
      ...item,
      id: item.id || String(i + 1),
      type: item.type || "other",
      className: item.className || parsed.classInfo.name?.split(" - ")?.[0] || "Unknown",
    }));

    // If the syllabus text doesn't contain an explicit year, normalize all dueDate years to the current year.
    // This prevents the model from guessing a prior/academic year when only month/day is present.
    if (!hasExplicitYearInText) {
      parsed.items = parsed.items.map((item) => {
        const m = String(item.dueDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!m) return item;
        const [, , mm, dd] = m;
        return { ...item, dueDate: `${currentYear}-${mm}-${dd}` };
      });
    }

    return parsed;
  });
