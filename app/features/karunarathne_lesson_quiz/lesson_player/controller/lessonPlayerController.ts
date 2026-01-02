import { LessonRepository, LessonSummary } from "../../data/lessonRepository";
import { AudioTtsEngine } from "../engine/audioTtsEngine";
import { LessonSequencer } from "../engine/lessonSequencer";
import { LessonContentSegment } from "../../data/datasetLoader";

export class LessonPlayerController {
  private repo = new LessonRepository();
  private tts = new AudioTtsEngine();
  private sequencer: LessonSequencer | null = null;
  private currentLesson: LessonSummary | null = null;

  constructor() {
    // Load a default lesson so the UI has something ready on first open
    const def = this.repo.getDefaultLesson();
    if (def) {
      this.loadLesson(def.lessonId);
    }
  }

  // --------- metadata for UI ----------

  getAvailableGrades(): number[] {
    return this.repo.getGrades();
  }

  getLessonsForGrade(grade: number): LessonSummary[] {
    return this.repo.getLessonSummariesForGrade(grade);
  }

  getCurrentLessonMeta(): LessonSummary | null {
    return this.currentLesson;
  }

  // --------- lesson selection ----------

  selectLesson(lessonId: string) {
    this.loadLesson(lessonId);
  }

  private loadLesson(lessonId: string) {
    // Find metadata for the selected lesson
    const allForGrade10 = this.repo.getLessonSummariesForGrade(10);
    const allForGrade11 = this.repo.getLessonSummariesForGrade(11);
    const all = [...allForGrade10, ...allForGrade11];

    this.currentLesson = all.find((l) => l.lessonId === lessonId) ?? null;

    // Load segments and reset sequencer
    const segments = this.repo.getSegmentsForLesson(lessonId);
    this.sequencer = new LessonSequencer(segments);
  }

  private getCurrentSegment(): LessonContentSegment | null {
    if (!this.sequencer) return null;
    return this.sequencer.current();
  }

  // --------- playback controls ----------

  start() {
    const seg = this.getCurrentSegment();
    if (!seg) return;
    this.tts.speak(seg.text);
  }

  /**
   * Move to next segment. If there is no next segment, we announce
   * that the lesson has finished and guide the learner to the quiz.
   */
  next() {
    if (!this.sequencer) return;
    const seg = this.sequencer.next();

    if (!seg) {
      this.tts.speak(
        "You have reached the end of this lesson. You can now start the quiz for this topic using the Start Quiz for this lesson button."
      );
      return;
    }

    this.tts.speak(seg.text);
  }

  prev() {
    if (!this.sequencer) return;
    const seg = this.sequencer.prev();
    if (!seg) return;
    this.tts.speak(seg.text);
  }

  repeat() {
    const seg = this.getCurrentSegment();
    if (!seg) return;
    this.tts.speak(seg.text);
  }

  stop() {
    this.tts.stop();
  }

  // --------- helpers for UI ----------

  getCurrentSegmentText(): string {
    const seg = this.getCurrentSegment();
    return seg?.text ?? "";
  }

  getCurrentSegmentIndex(): number {
    if (!this.sequencer) return 0;
    return this.sequencer.index();
  }

  getSegmentCount(): number {
    if (!this.sequencer) return 0;
    return this.sequencer.total();
  }
}
