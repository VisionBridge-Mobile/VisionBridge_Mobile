import {
  loadLessonBank,
  LessonBank,
  LessonContentSegment
} from "./datasetLoader";

export class LessonRepository {
  private bank: LessonBank;

  constructor() {
    this.bank = loadLessonBank();
  }

  /**
   * Returns basic course metadata.
   */
  getLessonMeta() {
    return {
      courseId: this.bank.course_id,
      title: this.bank.title
    };
  }

  /**
   * Returns ALL lesson segments in correct order.
   * Used by current Lesson Player to read sequentially.
   */
  getSegments(): LessonContentSegment[] {
    return [...this.bank.lessons]
      .sort((a, b) => a.order - b.order)
      .flatMap((lesson) => lesson.segments);
  }

  /**
   * Filter by category and/or grade.
   *
   * Example:
   *  getSegmentsFor("Networking", 11)
   */
  getSegmentsFor(category?: string, grade?: number): LessonContentSegment[] {
    let lessons = this.bank.lessons;

    if (category) {
      lessons = lessons.filter((l) => l.category === category);
    }

    if (typeof grade === "number") {
      lessons = lessons.filter((l) => l.grade === grade);
    }

    return [...lessons]
      .sort((a, b) => a.order - b.order)
      .flatMap((lesson) => lesson.segments);
  }
}
