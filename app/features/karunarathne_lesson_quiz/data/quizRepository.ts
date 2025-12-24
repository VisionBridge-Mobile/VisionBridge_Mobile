import { loadLessonDataset, LessonDataset, QuizQuestion } from "./datasetLoader";

export type QuizQuery = {
  grade?: 10 | 11;
  category?: string;
  limit?: number;
};

export class QuizRepository {
  private dataset: LessonDataset;

  constructor() {
    this.dataset = loadLessonDataset();
  }

  getAllQuestions(): QuizQuestion[] {
    return this.dataset.quiz ?? [];
  }

  getQuestions(query: QuizQuery = {}): QuizQuestion[] {
    const { grade, category, limit = 10 } = query;

    let questions = this.dataset.quiz ?? [];

    if (grade) questions = questions.filter(q => q.grade === grade);
    if (category) questions = questions.filter(q => q.category === category);

    return questions.slice(0, limit);
  }
}
