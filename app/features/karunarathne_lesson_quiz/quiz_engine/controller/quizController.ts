import { QuizRepository } from "../../data/quizRepository";
import { QuizQuestion } from "../../data/datasetLoader";
import { AudioTtsEngine } from "../../lesson_player/engine/audioTtsEngine";
import { evaluateAnswer } from "../engine/answerEvaluator";
import { SessionConfig } from "../models/sessionTypes";
import { getStatsMap, upsertAttempt } from "../engine/progressStore";
import { computeEngagement, EngagementResult } from "../engine/engagementEngine";
import { selectSessionQuestions } from "../engine/sessionSelector";
import { callGemini } from "../../services/geminiClient";

export type AnswerStatus = "idle" | "correct" | "wrong";

export type ActiveQuestionView = {
  question: QuizQuestion | null;
  index: number; // 0-based
  total: number;
  startedAt: number | null;
  lastHint?: string | null;
  selectedIndex?: number | null;
  answerStatus?: AnswerStatus;
  // summary info when session is done
  done?: boolean;
  correctCount?: number;
  totalCount?: number;
};

type ActiveQuestionListener = (view: ActiveQuestionView | null) => void;

export class QuizController {
  private repo = new QuizRepository();
  private tts = new AudioTtsEngine();

  private sessionQuestions: QuizQuestion[] = [];
  private idx = 0;

  private activeQuestionStartedAt = 0;
  private hintUsedThisQuestion = 0;
  private repeatUsedThisQuestion = 0;

  private lastEngagement: EngagementResult | null = null;

  // simple per-session score
  private sessionCorrect = 0;
  private sessionAnswered = 0;

  private onActiveChange: ActiveQuestionListener;

  constructor(onActiveChange?: ActiveQuestionListener) {
    this.onActiveChange = onActiveChange ?? (() => {});
  }

  /* ------------ helpers to notify UI ------------ */

  private buildActive(extra?: Partial<ActiveQuestionView>): ActiveQuestionView {
    const q = this.sessionQuestions[this.idx] ?? null;
    return {
      question: q,
      index: this.idx,
      total: this.sessionQuestions.length,
      startedAt: this.activeQuestionStartedAt || null,
      ...extra,
    };
  }

  private notifyActive(extra?: Partial<ActiveQuestionView>) {
    // when session finished we may pass { done: true, ... } with question null
    if (extra?.done) {
      const view: ActiveQuestionView = {
        question: null,
        index: this.sessionQuestions.length,
        total: this.sessionQuestions.length,
        startedAt: null,
        ...extra,
      };
      this.onActiveChange(view);
      return;
    }

    const view = this.buildActive(extra);
    this.onActiveChange(view);
  }

  /* ------------ session start ------------ */

  async startSession(config: SessionConfig) {
    const all = this.repo.getAllQuestions();
    const statsMap = await getStatsMap();
    const statsList = Object.values(statsMap);

    const engagement = computeEngagement(statsList);
    this.lastEngagement = engagement;

    // Adapt session length based on engagement level (practical)
    const limit =
      engagement.level === "LOW"
        ? Math.min(5, config.limit)
        : engagement.level === "HIGH"
        ? Math.min(config.limit + 5, 40)
        : config.limit;

    const effectiveConfig: SessionConfig = { ...config, limit };

    this.sessionQuestions = selectSessionQuestions({
      all,
      config: effectiveConfig,
      statsMap,
      difficulty: engagement.difficulty,
      weakCategories: engagement.weakCategories,
    });

    this.idx = 0;
    this.sessionAnswered = 0;
    this.sessionCorrect = 0;

    if (this.sessionQuestions.length === 0) {
      this.tts.speak("No questions available for this session.");
      this.onActiveChange(null);
      return;
    }

    const intro = this.sessionIntroText(effectiveConfig, engagement);
    this.tts.speak(intro);

    // initialise first active question (timer starts when we read it)
    this.activeQuestionStartedAt = 0;
    this.hintUsedThisQuestion = 0;
    this.repeatUsedThisQuestion = 0;
    this.notifyActive({
      answerStatus: "idle",
      selectedIndex: null,
      lastHint: null,
    });

    // After intro, speak the first question
    setTimeout(() => this.speakCurrent(), 800);
  }

  private sessionIntroText(
    config: SessionConfig,
    engagement: EngagementResult
  ) {
    const base =
      config.type === "practice"
        ? "Starting practice session."
        : config.type === "topic_drill"
        ? `Starting topic drill on ${config.category ?? "selected topic"}.`
        : config.type === "quick_revision"
        ? "Starting quick revision."
        : config.type === "mock_exam"
        ? "Starting mock exam."
        : "Starting weak area practice.";

    const adapt =
      engagement.level === "LOW"
        ? "I will keep it short and provide extra hints."
        : engagement.level === "HIGH"
        ? "You are doing well. I will include more challenging questions."
        : "Let’s begin.";

    return `${base} This session has ${config.limit} questions. ${adapt}`;
  }

  /* ------------ question speech ------------ */

  private speakCurrent() {
    const q = this.sessionQuestions[this.idx];
    if (!q) {
      this.finishSession();
      return;
    }

    this.activeQuestionStartedAt = Date.now();
    this.hintUsedThisQuestion = 0;
    this.repeatUsedThisQuestion = 0;

    const optionsSpoken = q.options
      .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
      .join(". ");

    this.tts.speak(
      `Question ${this.idx + 1}. ${q.question}. Options. ${optionsSpoken}.`
    );

    this.notifyActive({
      startedAt: this.activeQuestionStartedAt,
      answerStatus: "idle",
      selectedIndex: null,
      lastHint: null,
    });
  }

  repeatQuestion() {
    const q = this.sessionQuestions[this.idx];
    if (!q) return;
    this.repeatUsedThisQuestion += 1;
    this.speakCurrent();
  }

  /* ------------ hints (AI + fallback, max 2) ------------ */

  async speakHint() {
    const q = this.sessionQuestions[this.idx];
    if (!q) return;

    if (this.hintUsedThisQuestion >= 2) {
      const msg =
        "You already used the maximum number of hints for this question. Try to answer using what you know.";
      this.tts.speak(msg);
      this.notifyActive({
        lastHint: "Maximum hints reached for this question.",
      });
      return;
    }

    this.hintUsedThisQuestion += 1;

    let hintText: string;

    // 1. Try AI powered hint
    try {
      const ai = await callGemini(
        `
You are helping a visually impaired Grade ${q.grade} ICT student.
Give a short, step-by-step hint for this question WITHOUT saying the answer.

Question: ${q.question}

Options:
${q.options.join("\n")}
`.trim()
      );

      hintText = ai;
    } catch {
      // 2. Fallback to offline hint
      hintText =
        q.hint_topic ??
        "Think about the core concept in the question and eliminate clearly wrong options.";
    }

    this.tts.speak("Hint. " + hintText);
    this.notifyActive({ lastHint: hintText });
  }

  /* ------------ answer handling ------------ */

  async answer(optionIndex: number) {
    const q = this.sessionQuestions[this.idx];
    if (!q) return;

    const selected = q.options[optionIndex];
    if (!selected) {
      this.tts.speak("Invalid selection.");
      return;
    }

    const timeTakenMs = Math.max(
      0,
      Date.now() - this.activeQuestionStartedAt
    );
    const ok = evaluateAnswer(q, selected);

    this.sessionAnswered += 1;
    if (ok) this.sessionCorrect += 1;

    await upsertAttempt({
      id: q.id,
      category: q.category,
      grade: q.grade,
      isCorrect: ok,
      timeTakenMs,
      hintUsed: this.hintUsedThisQuestion,
      repeatUsed: this.repeatUsedThisQuestion,
    });

    if (ok) {
      // Correct → lock button green + move to next after 5 seconds
      this.tts.speak("Correct. Moving to the next question.");
      this.notifyActive({
        selectedIndex: optionIndex,
        answerStatus: "correct",
      });

      setTimeout(() => {
        this.idx += 1;
        this.speakCurrent();
      }, 5000);
      return;
    }

    // Wrong → tell user and encourage using hints
    const reinforcement =
      this.lastEngagement?.level === "LOW"
        ? "That answer is incorrect. You can listen to the hint to get more guidance, then try again."
        : "That answer is wrong. Think again or use the hint if you need help.";

    this.tts.speak(reinforcement);

    this.notifyActive({
      selectedIndex: optionIndex,
      answerStatus: "wrong",
    });

    // Stay on same question (user can request hints, then answer again)
  }

  /* ------------ session completion ------------ */

  private finishSession() {
    const total = this.sessionQuestions.length;
    const correct = this.sessionCorrect;
    const msg = `Session completed. You answered ${correct} out of ${total} questions correctly.`;

    this.tts.speak(msg);

    this.notifyActive({
      done: true,
      correctCount: correct,
      totalCount: total,
      lastHint: null,
      selectedIndex: null,
      answerStatus: "idle",
    });
  }

  stop() {
    this.tts.stop();
    // keep last active view so user can still see result / last question
  }
}
