import { LessonSegment } from "../../data/datasetLoader";

export class LessonSequencer {
  private segments: LessonSegment[];
  private idx = 0;

  constructor(segments: LessonSegment[]) {
    this.segments = segments;
  }

  current(): LessonSegment | null {
    return this.segments[this.idx] ?? null;
  }

  next(): LessonSegment | null {
    if (this.idx < this.segments.length - 1) this.idx += 1;
    return this.current();
  }

  prev(): LessonSegment | null {
    if (this.idx > 0) this.idx -= 1;
    return this.current();
  }

  index() {
    return this.idx;
  }
}
