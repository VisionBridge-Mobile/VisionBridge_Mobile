import { LessonRepository } from "../../data/lessonRepository";
import { AudioTtsEngine } from "../engine/audioTtsEngine";
import { LessonSequencer } from "../engine/lessonSequencer";
import {
  loadLessonCursor,
  saveLessonCursor,
  clearLessonCursor,
} from "../engine/lessonProgressStore";

export class LessonPlayerController {
  private repo = new LessonRepository();
  private tts = new AudioTtsEngine();
  private sequencer: LessonSequencer;

  // we use this to avoid saving before initial load finished (optional)
  private cursorLoaded = false;

  constructor() {
    const segments = this.repo.getSegments();
    this.sequencer = new LessonSequencer(segments);

    // Kick off async restore of last position
    this.restoreCursor();
  }

  private async restoreCursor() {
    const cursor = await loadLessonCursor();
    if (cursor && typeof cursor.segmentIndex === "number") {
      this.sequencer.goTo(cursor.segmentIndex);
    }
    this.cursorLoaded = true;
  }

  private persistCursor() {
    if (!this.cursorLoaded) return; // optional guard
    const idx = this.sequencer.index();
    saveLessonCursor({
      segmentIndex: idx,
      updatedAt: Date.now(),
    }).catch(() => {});
  }

  start() {
    const seg = this.sequencer.current();
    if (!seg) return;
    this.tts.speak(seg.text);
    // We do not change cursor index here, only read it.
  }

  next() {
    const seg = this.sequencer.next();
    if (!seg) return;
    this.tts.speak(seg.text);
    this.persistCursor();
  }

  prev() {
    const seg = this.sequencer.prev();
    if (!seg) return;
    this.tts.speak(seg.text);
    this.persistCursor();
  }

  repeat() {
    const seg = this.sequencer.current();
    if (!seg) return;
    this.tts.speak(seg.text);
  }

  stop() {
    this.tts.stop();
  }

  /**
   * Optional: restart lesson from the very beginning
   * and clear saved cursor.
   */
  async reset() {
    this.sequencer.goTo(0);
    this.persistCursor();
    await clearLessonCursor();
  }

  getIndex() {
    return this.sequencer.index();
  }
}
