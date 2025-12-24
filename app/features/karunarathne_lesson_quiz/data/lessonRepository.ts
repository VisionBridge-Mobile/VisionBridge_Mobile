import { loadLessonDataset, LessonDataset, LessonSegment } from "./datasetLoader";

export class LessonRepository {
  private dataset: LessonDataset;

  constructor() {
    this.dataset = loadLessonDataset();
  }

  getLessonMeta() {
    return { lessonId: this.dataset.lesson_id, title: this.dataset.title };
  }

  getSegments(): LessonSegment[] {
    return this.dataset.segments ?? [];
  }
}
