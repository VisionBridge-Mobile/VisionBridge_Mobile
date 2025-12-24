export type SessionType =
  | "practice"
  | "topic_drill"
  | "quick_revision"
  | "mock_exam"
  | "weak_area";

export type SessionConfig = {
  type: SessionType;
  grade?: 10 | 11;
  category?: string; // required for topic_drill
  limit: number; // 5/10/40 etc.
};

export const DEFAULT_LIMITS: Record<SessionType, number> = {
  practice: 10,
  topic_drill: 10,
  quick_revision: 5,
  mock_exam: 40,
  weak_area: 10,
};
