import AsyncStorage from "@react-native-async-storage/async-storage";

export type QuestionStats = {
  id: string;
  category: string;
  grade: number;
  correctCount: number;
  wrongCount: number;
  lastAttemptAt: number; // epoch ms
  lastAttemptCorrect: boolean;
  avgTimeMs: number; // rolling mean
  hintCount: number; // total
  repeatCount: number; // total
};

const KEY = "vb.quiz.questionStats.v1";

type StatsMap = Record<string, QuestionStats>;

async function loadMap(): Promise<StatsMap> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StatsMap;
  } catch {
    return {};
  }
}

async function saveMap(map: StatsMap): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(map));
}

export async function getStatsMap(): Promise<StatsMap> {
  return loadMap();
}

export async function upsertAttempt(params: {
  id: string;
  category: string;
  grade: number;
  isCorrect: boolean;
  timeTakenMs: number;
  hintUsed?: number; // default 0
  repeatUsed?: number; // default 0
}): Promise<void> {
  const map = await loadMap();
  const existing = map[params.id];

  const hintInc = params.hintUsed ?? 0;
  const repeatInc = params.repeatUsed ?? 0;

  if (!existing) {
    map[params.id] = {
      id: params.id,
      category: params.category,
      grade: params.grade,
      correctCount: params.isCorrect ? 1 : 0,
      wrongCount: params.isCorrect ? 0 : 1,
      lastAttemptAt: Date.now(),
      lastAttemptCorrect: params.isCorrect,
      avgTimeMs: params.timeTakenMs,
      hintCount: hintInc,
      repeatCount: repeatInc,
    };
    await saveMap(map);
    return;
  }

  const attempts = existing.correctCount + existing.wrongCount;
  const newAttempts = attempts + 1;
  const newAvg = Math.round((existing.avgTimeMs * attempts + params.timeTakenMs) / newAttempts);

  map[params.id] = {
    ...existing,
    correctCount: existing.correctCount + (params.isCorrect ? 1 : 0),
    wrongCount: existing.wrongCount + (params.isCorrect ? 0 : 1),
    lastAttemptAt: Date.now(),
    lastAttemptCorrect: params.isCorrect,
    avgTimeMs: newAvg,
    hintCount: existing.hintCount + hintInc,
    repeatCount: existing.repeatCount + repeatInc,
  };

  await saveMap(map);
}
