import { QuizQuestion } from "../../data/datasetLoader";
import { QuestionStats } from "./progressStore";
import { sample } from "./randomUtils";
import { SessionConfig } from "../models/sessionTypes";
import { DifficultyState } from "./engagementEngine";

type StatsMap = Record<string, QuestionStats>;

function getAccuracy(s?: QuestionStats): number | null {
  if (!s) return null;
  const att = s.correctCount + s.wrongCount;
  if (att === 0) return null;
  return s.correctCount / att;
}

export function selectSessionQuestions(params: {
  all: QuizQuestion[];
  config: SessionConfig;
  statsMap: StatsMap;
  difficulty: DifficultyState;
  weakCategories: string[];
}): QuizQuestion[] {
  const { all, config, statsMap, difficulty, weakCategories } = params;

  // Base filter: grade + category
  let pool = all;
  if (config.grade) pool = pool.filter(q => q.grade === config.grade);
  if (config.type === "topic_drill") {
    if (!config.category) return [];
    pool = pool.filter(q => q.category === config.category);
  } else if (config.category) {
    // optional category bias if provided
    pool = pool.filter(q => q.category === config.category);
  }

  // Session-specific selection
  if (config.type === "weak_area") {
    const wrongBefore = pool.filter(q => {
      const s = statsMap[q.id];
      return s ? s.wrongCount > 0 && s.wrongCount >= s.correctCount : false;
    });

    // If empty, fall back to weak categories bias
    const fallback = weakCategories.length
      ? pool.filter(q => weakCategories.includes(q.category))
      : pool;

    return sample(wrongBefore.length ? wrongBefore : fallback, config.limit);
  }

  if (config.type === "quick_revision") {
    const easy = pool
      .map(q => ({ q, acc: getAccuracy(statsMap[q.id]) }))
      .filter(x => x.acc !== null && (x.acc as number) >= 0.7)
      .map(x => x.q);

    // If user has no history, just sample normally
    return sample(easy.length ? easy : pool, config.limit);
  }

  if (config.type === "mock_exam") {
    // Practical v1: mixed random across pool. (Later you can balance by category.)
    return sample(pool, config.limit);
  }

  // practice/topic_drill: apply difficulty bias (simple, explainable)
  if (difficulty === "HARD") {
    const harder = pool.filter(q => {
      const acc = getAccuracy(statsMap[q.id]);
      // unknown accuracy treated as medium; include them too
      return acc === null ? true : acc < 0.6;
    });
    return sample(harder.length ? harder : pool, config.limit);
  }

  if (difficulty === "EASY") {
    const easier = pool.filter(q => {
      const acc = getAccuracy(statsMap[q.id]);
      return acc === null ? true : acc >= 0.6;
    });
    return sample(easier.length ? easier : pool, config.limit);
  }

  return sample(pool, config.limit);
}
