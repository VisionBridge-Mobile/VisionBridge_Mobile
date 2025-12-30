import { LessonSegment } from "../../data/datasetLoader";

export class LessonSequencer {
  private segments: LessonSegment[];
  private idx: number;

  constructor(segments: LessonSegment[], startIndex: number = 0) {
    this.segments = segments;
    this.idx = Math.max(0, Math.min(startIndex, segments.length - 1));
  }

  current(): LessonSegment | null {
    return this.segments[this.idx] ?? null;
  }

  next(): LessonSegment | null {
    if (this.idx < this.segments.length - 1) {
      this.idx += 1;
    }
    return this.current();
  }

  prev(): LessonSegment | null {
    if (this.idx > 0) {
      this.idx -= 1;
    }
    return this.current();
  }

  index(): number {
    return this.idx;
  }

  /**
   * Jump to a specific segment index if valid.
   */
  goTo(index: number): LessonSegment | null {
    if (index < 0 || index >= this.segments.length) {
      return this.current();
    }
    this.idx = index;
    return this.current();
  }
}
