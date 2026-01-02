import { QuizQuestion } from "../../data/datasetLoader";
import { SessionConfig } from "../models/sessionTypes";
import { StatsMap, QuestionStat } from "./progressStore";
import { sample, shuffled } from "./randomUtils";

interface SessionSelectorInput {
  all: QuizQuestion[];
  config: SessionConfig;
  statsMap: StatsMap;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  weakCategories: string[];
}

/**
 * Selects which questions should appear in a session,
 * including weak-area and difficulty adaptation.
 */
export function selectSessionQuestions(input: SessionSelectorInput): QuizQuestion[] {
  const { all, config, statsMap, difficulty, weakCategories } = input;
  const { type, grade, category, limit } = config;

  let pool = [...all];

  // Filter by grade if provided
  if (typeof grade === "number") {
    pool = pool.filter((q) => q.grade === grade);
  }

  const getStat = (q: QuizQuestion): QuestionStat | undefined => statsMap[q.id];

  // Helper: score for "difficulty" based on historical accuracy
  const withScore = pool.map((q) => {
    const s = getStat(q);
    const attempts = s?.totalAttempts ?? 0;
    const accuracy =
      attempts > 0 ? (s!.correctAttempts || 0) / attempts : 0.7; // assume mid if unknown
    return { q, attempts, accuracy };
  });

  const selectByDifficulty = (): QuizQuestion[] => {
    let filtered = withScore;

    if (difficulty === "EASY") {
      filtered = withScore.filter((x) => x.accuracy < 0.7);
    } else if (difficulty === "HARD") {
      filtered = withScore.filter((x) => x.accuracy > 0.7);
    }

    if (!filtered.length) filtered = withScore;

    filtered.sort((a, b) => {
      if (difficulty === "EASY") {
        // easier first -> lower accuracy first
        return a.accuracy - b.accuracy;
      } else if (difficulty === "HARD") {
        return b.accuracy - a.accuracy;
      }
      return 0;
    });

    return sample(
      filtered.map((x) => x.q),
      limit
    );
  };

  switch (type) {
    case "practice": {
      return selectByDifficulty();
    }

    case "topic_drill": {
      const topicPool = pool.filter((q) =>
        category ? q.category === category : true
      );
      return sample(topicPool, limit);
    }

    case "quick_revision": {
      // bias to easier questions (low attempts or lower accuracy)
      const sorted = withScore.sort((a, b) => {
        const aScore = (a.attempts || 0) * a.accuracy;
        const bScore = (b.attempts || 0) * b.accuracy;
        return aScore - bScore;
      });
      return sample(
        sorted.map((x) => x.q),
        limit
      );
    }

    case "mock_exam": {
      // mixed difficulty, random order
      return sample(shuffled(pool), limit);
    }

    case "weak_area": {
      // Prefer categories the learner is weak in
      let weakPool = pool.filter((q) => weakCategories.includes(q.category));

      if (!weakPool.length) {
        // Fallback  pick individually weak questions by accuracy
        const weakQs = withScore
          .filter((x) => x.attempts >= 2 && x.accuracy < 0.6)
          .map((x) => x.q);
        weakPool = weakQs.length ? weakQs : pool;
      }

      return sample(weakPool, limit);
    }

    default:
      return sample(pool, limit);
  }
}
