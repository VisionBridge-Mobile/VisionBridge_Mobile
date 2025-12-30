import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "vb_quiz_stats_v1";

export interface QuestionStat {
  id: string;
  category: string;
  grade: number;
  totalAttempts: number;
  correctAttempts: number;
  totalTimeMs: number;
  totalHints: number;
  totalRepeats: number;
  lastAnsweredAt: number;
}

export type StatsMap = Record<string, QuestionStat>;

interface UpsertAttemptInput {
  id: string;
  category: string;
  grade: number;
  isCorrect: boolean;
  timeTakenMs: number;
  hintUsed: number;
  repeatUsed: number;
}

async function loadStats(): Promise<StatsMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as StatsMap;
  } catch {
    return {};
  }
}

async function saveStats(map: StatsMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Non-fatal: if save fails, we just don't persist this attempt.
  }
}

/**
 * Returns the full stats map (id -> QuestionStat).
 * Used by QuizController before starting a session.
 */
export async function getStatsMap(): Promise<StatsMap> {
  return await loadStats();
}

/**
 * Upserts a single attempt into the stats map.
 * Called from QuizController.answer().
 */
export async function upsertAttempt(input: UpsertAttemptInput): Promise<void> {
  const stats = await loadStats();
  const existing = stats[input.id];

  const now = Date.now();

  const updated: QuestionStat = existing
    ? {
        ...existing,
        totalAttempts: existing.totalAttempts + 1,
        correctAttempts: existing.correctAttempts + (input.isCorrect ? 1 : 0),
        totalTimeMs: existing.totalTimeMs + input.timeTakenMs,
        totalHints: existing.totalHints + input.hintUsed,
        totalRepeats: existing.totalRepeats + input.repeatUsed,
        lastAnsweredAt: now,
      }
    : {
        id: input.id,
        category: input.category,
        grade: input.grade,
        totalAttempts: 1,
        correctAttempts: input.isCorrect ? 1 : 0,
        totalTimeMs: input.timeTakenMs,
        totalHints: input.hintUsed,
        totalRepeats: input.repeatUsed,
        lastAnsweredAt: now,
      };

  stats[input.id] = updated;
  await saveStats(stats);
}
