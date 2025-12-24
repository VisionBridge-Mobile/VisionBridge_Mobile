// app/features/karunarathne_lesson_quiz/data/datasetLoader.ts

export type LessonSegment = {
  id: string;
  type: string; // e.g., "intro", "lesson", etc.
  text: string;
};

export type QuizQuestion = {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: string;
  hint_topic?: string;
  grade: number; // 10 or 11
};

export type LessonDataset = {
  lesson_id: string;
  title: string;
  segments: LessonSegment[];
  quiz: QuizQuestion[];
};

let cachedDataset: LessonDataset | null = null;

/**
 * Loads the lesson + quiz dataset from local bundled JSON.
 * Uses a simple in-memory cache so the JSON isn't reloaded repeatedly.
 */
export function loadLessonDataset(): LessonDataset {
  if (cachedDataset) return cachedDataset;

  // Your dataset location:
  // VISIONBRIDGE_MOBILE/assets/data/large_lesson.json
  // Current file location:
  // VISIONBRIDGE_MOBILE/app/features/karunarathne_lesson_quiz/data/datasetLoader.ts
  const raw = require("../../../../assets/data/large_lesson.json") as LessonDataset;

  // Basic validation to fail early (helps debugging)
  if (!raw || typeof raw !== "object") {
    throw new Error("Dataset load failed: JSON is empty or not an object.");
  }
  if (!raw.lesson_id || typeof raw.lesson_id !== "string") {
    throw new Error("Dataset invalid: missing lesson_id.");
  }
  if (!raw.title || typeof raw.title !== "string") {
    throw new Error("Dataset invalid: missing title.");
  }
  if (!Array.isArray(raw.segments)) {
    throw new Error("Dataset invalid: segments must be an array.");
  }
  if (!Array.isArray(raw.quiz)) {
    throw new Error("Dataset invalid: quiz must be an array.");
  }

  // Optional deep validation for quiz items (kept light to avoid startup cost)
  for (let i = 0; i < Math.min(raw.quiz.length, 20); i++) {
    const q = raw.quiz[i];
    if (!q?.id || !q.question || !Array.isArray(q.options) || !q.correct_answer) {
      throw new Error(`Dataset invalid: quiz item at index ${i} is missing required fields.`);
    }
  }

  cachedDataset = raw;
  return cachedDataset;
}
