import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIPriority = 'low' | 'medium' | 'high';

export interface AIParseResponse {
  tasks: Array<{
    title: string;
    priority?: AIPriority;
    description?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    category?: string;
    confidence?: number;
  }>;
}

export interface ParseOptions {
  nowISO?: string;
  locale?: string;
  timezone?: string;
  model?: string;
  availableCategories?: string[];
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_MODEL = 'gemini-2.0-flash';
const EMBEDDED_GEMINI_API_KEY = 'AIzaSyA_qLY2DDdn3Z0INC73qoRo6TtItnkYCaM';

export const LOW_CONFIDENCE_THRESHOLD = 0.5;

export function getGeminiApiKey(): string | null {
  return EMBEDDED_GEMINI_API_KEY;
}

function buildPrompt(params: {
  text: string;
  history: ChatTurn[];
  nowISO: string;
  locale: string;
  timezone: string;
  availableCategories: string[];
}): string {
  const { text, history, nowISO, locale, timezone, availableCategories } = params;
  const historyText = history
    .map((t) => `${t.role.toUpperCase()}: ${t.content}`)
    .join('\n');

  const categoriesText = availableCategories.length > 0 
    ? `Available categories: ${availableCategories.join(', ')}`
    : 'No categories available';

  return `Task Extraction Assistant (English Only)
You convert natural English into structured tasks JSON. Output JSON only, with no extra text.

Current context:
- nowISO: ${nowISO}
- locale: ${locale}
- timezone: ${timezone}
- ${categoriesText}

Task fields:
- REQUIRED: title
- OPTIONAL: category, priority, description, date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm)

Strict rules:
1) Only output a task when the required field (title) is present or can be confidently inferred.
2) If a message lacks clear task information or you cannot identify what the user wants to create as a task, respond with a friendly and helpful message encouraging them to be more specific about their task. Be conversational and supportive.
3) OPTIONAL fields may be omitted without asking follow-ups. Never fabricate description or dates. If time-of-day exists, include it in description; if a date is relative (today/tomorrow/next Monday), resolve to a concrete date using nowISO/timezone.
4) Priority: map language cues to levels (urgent/important/critical/high -> high; medium/normal -> medium; low/minor -> low). If priority cannot be confidently inferred, leave it empty.
5) Category: try to match to available categories first. If no good match exists, leave it empty.
6) Support multiple tasks per message where applicable.
7) Set confidence between 0 and 1 reflecting certainty about understanding.
8) When you cannot identify a clear task, respond conversationally without using the 'clarifications' field. Instead, provide a friendly response directly.

JSON schema:
{
  "tasks": [
    {
      "title": "string",
      "category": "string (optional)",
      "priority": "low" | "medium" | "high" (optional)",
      "description": "string (optional)",
      "date": "YYYY-MM-DD (optional)",
      "startTime": "HH:mm (optional)",
      "endTime": "HH:mm (optional)",
      "confidence": 0.0-1.0 (optional)
    }
  ]
}

Conversation:
${historyText}

USER: ${text}
ASSISTANT:`;
}

export async function parseNLToTasks(params: {
  text: string;
  history?: ChatTurn[];
  options?: ParseOptions;
}): Promise<AIParseResponse> {
  const { text, history = [], options } = params;
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Missing Gemini API key. Please set it in the AI drawer.');
  }

  const nowISO = options?.nowISO ?? new Date().toISOString();
  const locale = options?.locale ?? 'en-US';
  const timezone = options?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  const modelName = options?.model ?? DEFAULT_MODEL;
  const availableCategories = options?.availableCategories ?? [];

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });

  const prompt = buildPrompt({ text, history, nowISO, locale, timezone, availableCategories });
  const result = await model.generateContent(prompt);
  const textOut = result.response.text();
  let parsed: AIParseResponse;
  try {
    parsed = JSON.parse(textOut);
  } catch (e) {
    return { tasks: [] };
  }

  // Normalize confidences and limit fields
  const tasks = (parsed.tasks ?? []).map((t) => ({
    title: (t.title ?? '').toString().trim(),
    category: t.category ? t.category.toString().trim() : undefined,
    priority: t.priority ? (t.priority as AIPriority) : undefined,
    description: t.description ? t.description.toString() : undefined,
    date: t.date ? t.date.toString() : undefined,
    startTime: t.startTime ? t.startTime.toString() : undefined,
    endTime: t.endTime ? t.endTime.toString() : undefined,
    confidence: typeof t.confidence === 'number' ? Math.max(0, Math.min(1, t.confidence)) : 0.7,
  }));

  return { tasks };
}
