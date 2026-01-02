import { QuizRepository } from "../../data/quizRepository";
import { QuizQuestion } from "../../data/datasetLoader";
import { AudioTtsEngine } from "../../lesson_player/engine/audioTtsEngine";
import { evaluateAnswer } from "../engine/answerEvaluator";
import { SessionConfig } from "../models/sessionTypes";
import { getStatsMap, upsertAttempt } from "../engine/progressStore";
import { computeEngagement, EngagementResult } from "../engine/engagementEngine";
import { selectSessionQuestions } from "../engine/sessionSelector";
import { callGemini } from "../../services/geminiClient";

export class QuizController {
  private repo = new QuizRepository();
  private tts = new AudioTtsEngine();

  private sessionQuestions: QuizQuestion[] = [];
  private idx = 0;

  private activeQuestionStartedAt = 0;
  private hintUsedThisQuestion = 0;
  private repeatUsedThisQuestion = 0;

  private lastEngagement: EngagementResult | null = null;

  async startSession(config: SessionConfig) {
    const all = this.repo.getAllQuestions();
    const statsMap = await getStatsMap();
    const statsList = Object.values(statsMap);

    const engagement = computeEngagement(statsList);
    this.lastEngagement = engagement;

    // Adapt session length based on engagement level (practical)
    const limit =
      engagement.level === "LOW" ? Math.min(5, config.limit) :
        engagement.level === "HIGH" ? Math.min(config.limit + 5, 40) :
          config.limit;

    const effectiveConfig: SessionConfig = { ...config, limit };

    this.sessionQuestions = selectSessionQuestions({
      all,
      config: effectiveConfig,
      statsMap,
      difficulty: engagement.difficulty,
      weakCategories: engagement.weakCategories,
    });

    this.idx = 0;

    if (this.sessionQuestions.length === 0) {
      this.tts.speak("No questions available for this session.");
      return;
    }

    const intro = this.sessionIntroText(effectiveConfig, engagement);
    this.tts.speak(intro);
    // After intro, speak the first question
    setTimeout(() => this.speakCurrent(), 800);
  }

  private sessionIntroText(config: SessionConfig, engagement: EngagementResult) {
    const base =
      config.type === "practice" ? "Starting practice session." :
        config.type === "topic_drill" ? `Starting topic drill on ${config.category ?? "selected topic"}.` :
          config.type === "quick_revision" ? "Starting quick revision." :
            config.type === "mock_exam" ? "Starting mock exam." :
              "Starting weak area practice.";

    const adapt =
      engagement.level === "LOW" ? "I will keep it short and provide extra hints." :
        engagement.level === "HIGH" ? "You are doing well. I will include more challenging questions." :
          "Let's begin.";

    return `${base} This session has ${config.limit} questions. ${adapt}`;
  }

  private speakCurrent() {
    const q = this.sessionQuestions[this.idx];
    if (!q) {
      this.tts.speak("Session completed.");
      return;
    }

    this.activeQuestionStartedAt = Date.now();
    this.hintUsedThisQuestion = 0;
    this.repeatUsedThisQuestion = 0;

    const optionsSpoken = q.options
      .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
      .join(". ");

    this.tts.speak(`Question ${this.idx + 1}. ${q.question}. Options. ${optionsSpoken}.`);
  }

  repeatQuestion() {
    this.repeatUsedThisQuestion += 1;
    this.speakCurrent();
  }

  async speakHint() {
    const q = this.sessionQuestions[this.idx];
    if (!q) return;

    //  track hint usage for analytics / engagement
    this.hintUsedThisQuestion += 1;

    // 1. Try AI powered hint
    try {
      const ai = await callGemini(`
You are helping a visually impaired Grade ${q.grade} ICT student.
Give a short, spoken-style hint for this question WITHOUT saying the answer.

Question: ${q.question}

Options:
${q.options.join("\n")}
`);

      this.tts.speak("Hint. " + ai);
      return;
    } catch {
      // ignore error fall back
    }

    // 2. Fallback to offline hint
    const fallback =
      q.hint_topic ??
      "Think about what the key concept is and eliminate clearly wrong answers.";

    this.tts.speak("Hint. " + fallback);
  }


  async answer(optionIndex: number) {
    const q = this.sessionQuestions[this.idx];
    if (!q) return;

    const selected = q.options[optionIndex];
    if (!selected) {
      this.tts.speak("Invalid selection.");
      return;
    }

    const timeTakenMs = Math.max(0, Date.now() - this.activeQuestionStartedAt);
    const ok = evaluateAnswer(q, selected);

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
      this.tts.speak("Correct.");
      this.idx += 1;
      setTimeout(() => this.speakCurrent(), 600);
      return;
    }

    // Wrong  adaptive hint behavior
    if (this.lastEngagement?.level === "LOW") {
      this.tts.speak(`Wrong. ${q.hint_topic ? "Hint. " + q.hint_topic : ""} Try again.`);
    } else {
      this.tts.speak("Wrong. Try again or ask for a hint.");
    }

    // Stay on same question (reinforcement-inspired repetition)
    setTimeout(() => this.speakCurrent(), 700);
  }

  stop() {
    this.tts.stop();
  }
}
