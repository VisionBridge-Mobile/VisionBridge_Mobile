import { QuestionStats } from "./progressStore";

export type EngagementLevel = "HIGH" | "MEDIUM" | "LOW";
export type DifficultyState = "EASY" | "NORMAL" | "HARD";

export type EngagementResult = {
  score: number; // 0..100
  level: EngagementLevel;
  difficulty: DifficultyState;
  weakCategories: string[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function computeEngagement(statsList: QuestionStats[]): EngagementResult {
  if (statsList.length === 0) {
    return { score: 60, level: "MEDIUM", difficulty: "NORMAL", weakCategories: [] };
  }

  // Rolling window: last 30 attempts (approx) by lastAttemptAt
  const recent = [...statsList]
    .sort((a, b) => b.lastAttemptAt - a.lastAttemptAt)
    .slice(0, 30);

  const totalCorrect = recent.reduce((s, x) => s + x.correctCount, 0);
  const totalWrong = recent.reduce((s, x) => s + x.wrongCount, 0);
  const totalAttempts = totalCorrect + totalWrong;

  const accuracy = totalAttempts === 0 ? 0.6 : totalCorrect / totalAttempts; // 0..1
  const avgTime = Math.round(recent.reduce((s, x) => s + x.avgTimeMs, 0) / recent.length);

  // Normalize response speed: assume 6s fast, 18s slow
  const T = clamp((18000 - avgTime) / (18000 - 6000), 0, 1);

  const totalHints = recent.reduce((s, x) => s + x.hintCount, 0);
  const hintRate = totalAttempts === 0 ? 0 : totalHints / totalAttempts;
  const H = clamp(hintRate, 0, 1);

  // Approx wrong streak: count how many most-recent items have lastAttemptCorrect=false
  let wrongStreak = 0;
  for (const s of recent) {
    if (s.lastAttemptCorrect) break;
    wrongStreak += 1;
    if (wrongStreak >= 5) break;
  }
  const W = clamp(wrongStreak / 5, 0, 1);

  // Engagement score
  let ES = (0.4 * accuracy + 0.3 * T) - (0.2 * H + 0.1 * W);
  ES = clamp(ES, 0, 1);
  const score = Math.round(ES * 100);

  const level: EngagementLevel = score >= 75 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW";

  // Weak categories: compute per-category accuracy approx from stats totals
  const byCat = new Map<string, { c: number; w: number }>();
  for (const s of statsList) {
    const cur = byCat.get(s.category) ?? { c: 0, w: 0 };
    cur.c += s.correctCount;
    cur.w += s.wrongCount;
    byCat.set(s.category, cur);
  }
  const weakCategories = [...byCat.entries()]
    .map(([cat, v]) => {
      const att = v.c + v.w;
      const acc = att === 0 ? 1 : v.c / att;
      return { cat, acc };
    })
    .filter(x => x.acc < 0.5)
    .sort((a, b) => a.acc - b.acc)
    .slice(0, 3)
    .map(x => x.cat);

  // Difficulty state
  const difficulty: DifficultyState =
    level === "HIGH" ? "HARD" : level === "LOW" ? "EASY" : "NORMAL";

  return { score, level, difficulty, weakCategories };
}
