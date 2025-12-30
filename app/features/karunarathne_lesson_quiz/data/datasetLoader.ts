/**
 * -----------------------------
 * QUESTION BANK  (large_lesson.json)
 * -----------------------------
 */

export type LessonSegment = {
  id: string;
  type: string; // e.g., "intro", "lesson"
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

/**
 * -----------------------------
 * STRUCTURED LESSON BANK (lessons_ict_ol.json)
 * -----------------------------
 */

export type LessonContentSegment = {
  id: string;
  type: string;    // "intro" | "definition" | "example" | "recap" | etc.
  text: string;
};

export type LessonUnit = {
  lesson_id: string;
  category: string;
  grade: number;
  order: number;
  title: string;
  objective: string;
  segments: LessonContentSegment[];
};

export type LessonBank = {
  course_id: string;
  title: string;
  grades: number[];
  lessons: LessonUnit[];
};

/**
 * -----------------------------
 * IN-MEMORY CACHES
 * -----------------------------
 */
let cachedQuizDataset: LessonDataset | null = null;
let cachedLessonBank: LessonBank | null = null;

/**
 * -----------------------------
 * LOAD QUESTION BANK
 * from: assets/data/large_lesson.json
 * -----------------------------
 *
 * Used by:
 *  - QuizRepository
 */
export function loadLessonDataset(): LessonDataset {
  if (cachedQuizDataset) return cachedQuizDataset;

  const raw = require("../../../../assets/data/large_lesson.json") as LessonDataset;

  // -------- Basic validation --------
  if (!raw || typeof raw !== "object") {
    throw new Error("Question dataset load failed: JSON is empty or invalid.");
  }
  if (!raw.lesson_id) throw new Error("Question dataset invalid: missing lesson_id.");
  if (!raw.title) throw new Error("Question dataset invalid: missing title.");
  if (!Array.isArray(raw.segments)) throw new Error("Question dataset invalid: segments must be an array.");
  if (!Array.isArray(raw.quiz)) throw new Error("Question dataset invalid: quiz must be an array.");

  // Light validation (first 20 questions)
  for (let i = 0; i < Math.min(raw.quiz.length, 20); i++) {
    const q = raw.quiz[i];
    if (!q?.id || !q.question || !Array.isArray(q.options) || !q.correct_answer) {
      throw new Error(`Quiz item ${i} missing required fields.`);
    }
  }

  cachedQuizDataset = raw;
  return cachedQuizDataset;
}

/**
 * -----------------------------
 * LOAD STRUCTURED LESSON BANK
 * from: assets/data/lessons_ict_ol.json
 * -----------------------------
 *
 * Used by:
 *  - LessonRepository / LessonPlayer
 */
export function loadLessonBank(): LessonBank {
  if (cachedLessonBank) return cachedLessonBank;

  const raw = require("../../../../assets/data/lessons_ict_ol.json") as LessonBank;

  if (!raw || typeof raw !== "object") {
    throw new Error("Lesson bank load failed: JSON empty or invalid.");
  }
  if (!raw.course_id) throw new Error("Lesson bank invalid: missing course_id.");
  if (!Array.isArray(raw.lessons)) {
    throw new Error("Lesson bank invalid: lessons must be an array.");
  }

  // Validate first few lessons
  for (let i = 0; i < Math.min(raw.lessons.length, 10); i++) {
    const lesson = raw.lessons[i];
    if (!lesson?.lesson_id || !lesson.title || !Array.isArray(lesson.segments)) {
      throw new Error(`Lesson bank invalid: lesson index ${i} missing required fields.`);
    }
  }

  cachedLessonBank = raw;
  return cachedLessonBank;
}
