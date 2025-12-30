export type SessionType =
  | "practice"
  | "topic_drill"
  | "quick_revision"
  | "mock_exam"
  | "weak_area";

export interface SessionConfig {
  type: SessionType;
  /** Optional grade filter: 10 or 11. */
  grade?: number;
  /** Optional category filter for topic_drill. */
  category?: string;
  /** Maximum number of questions in the session. */
  limit: number;
}
