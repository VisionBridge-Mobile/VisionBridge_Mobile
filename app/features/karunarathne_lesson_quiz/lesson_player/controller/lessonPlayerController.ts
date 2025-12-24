import { LessonRepository } from "../../data/lessonRepository";
import { AudioTtsEngine } from "../engine/audioTtsEngine";
import { LessonSequencer } from "../engine/lessonSequencer";

export class LessonPlayerController {
  private repo = new LessonRepository();
  private tts = new AudioTtsEngine();
  private sequencer: LessonSequencer;

  constructor() {
    const segments = this.repo.getSegments();
    this.sequencer = new LessonSequencer(segments);
  }

  start() {
    const seg = this.sequencer.current();
    if (!seg) return;
    this.tts.speak(seg.text);
  }

  next() {
    const seg = this.sequencer.next();
    if (!seg) return;
    this.tts.speak(seg.text);
  }

  prev() {
    const seg = this.sequencer.prev();
    if (!seg) return;
    this.tts.speak(seg.text);
  }

  repeat() {
    const seg = this.sequencer.current();
    if (!seg) return;
    this.tts.speak(seg.text);
  }

  stop() {
    this.tts.stop();
  }

  getIndex() {
    return this.sequencer.index();
  }
}
