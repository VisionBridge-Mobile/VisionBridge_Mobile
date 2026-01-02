import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { LessonPlayerController } from "./lesson_player/controller/lessonPlayerController";
import {
  QuizController,
  ActiveQuestionView,
  AnswerStatus,
} from "./quiz_engine/controller/quizController";
import type { LessonSummary } from "./data/lessonRepository";

type Mode = "lesson" | "quiz";

export default function KarunarathneLessonQuizScreen() {
  const lesson = useMemo(() => new LessonPlayerController(), []);

  const [activeQuestion, setActiveQuestion] =
    useState<ActiveQuestionView | null>(null);
  const quiz = useMemo(
    () => new QuizController(setActiveQuestion),
    []
  );

  const [mode, setMode] = useState<Mode>("lesson");
  const [currentSessionLabel, setCurrentSessionLabel] =
    useState<string | null>(null);

  /* ---------------- LESSON MODE STATE ---------------- */

  const [grades, setGrades] = useState<number[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [lessonList, setLessonList] = useState<LessonSummary[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonObjective, setLessonObjective] = useState("");
  const [segmentText, setSegmentText] = useState("");
  const [quizReady, setQuizReady] = useState(false);

  // For timer on the active quiz question
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  /* ------------ initial load of grades + first lesson ------------- */
  useEffect(() => {
    const g = lesson.getAvailableGrades();
    if (!g.length) return;

    setGrades(g);
    const firstGrade = g[0];
    setSelectedGrade(firstGrade);

    const list = lesson.getLessonsForGrade(firstGrade);
    setLessonList(list);

    if (list.length) {
      const first = list[0];
      setSelectedLessonId(first.lessonId);
      setLessonTitle(first.title);
      setLessonObjective(first.objective);
      lesson.selectLesson(first.lessonId);
      setSegmentText(lesson.getCurrentSegmentText());
      setQuizReady(false);
    }
  }, [lesson]);

  // Helper: refresh visible text & whether quiz can start
  const refreshSegmentState = () => {
    const txt = lesson.getCurrentSegmentText();
    setSegmentText(txt);
    const total = lesson.getSegmentCount();
    const idx = lesson.getCurrentSegmentIndex();
    setQuizReady(total > 0 && idx >= total - 1);
  };

  /* ---------------- TIMER FOR ACTIVE QUESTION ---------------- */

  useEffect(() => {
    if (!activeQuestion?.startedAt || activeQuestion.done) {
      setElapsedSeconds(0);
      return;
    }
    const id = setInterval(() => {
      setElapsedSeconds(
        Math.max(
          0,
          Math.floor((Date.now() - (activeQuestion.startedAt || 0)) / 1000)
        )
      );
    }, 1000);
    return () => clearInterval(id);
  }, [activeQuestion?.startedAt, activeQuestion?.done]);

  /* ---------------- LESSON HANDLERS ---------------- */

  const handleSelectGrade = (grade: number) => {
    setSelectedGrade(grade);
    const list = lesson.getLessonsForGrade(grade);
    setLessonList(list);
    const first = list[0];
    if (first) {
      setSelectedLessonId(first.lessonId);
      setLessonTitle(first.title);
      setLessonObjective(first.objective);
      lesson.selectLesson(first.lessonId);
      setSegmentText(lesson.getCurrentSegmentText());
      setQuizReady(false);
    }
  };

  const handleSelectLesson = (id: string) => {
    setSelectedLessonId(id);
    const meta = lessonList.find((l) => l.lessonId === id);
    if (meta) {
      setLessonTitle(meta.title);
      setLessonObjective(meta.objective);
    }
    lesson.selectLesson(id);
    setSegmentText(lesson.getCurrentSegmentText());
    setQuizReady(false);
  };

  const handleLessonStart = () => {
    setMode("lesson");
    setCurrentSessionLabel(null);
    lesson.start();
    refreshSegmentState();
  };

  const handleLessonPrev = () => {
    lesson.prev();
    refreshSegmentState();
  };

  const handleLessonNext = () => {
    lesson.next();
    refreshSegmentState();
  };

  const handleLessonRepeat = () => {
    lesson.repeat();
    refreshSegmentState();
  };

  const handleLessonStop = () => {
    lesson.stop();
  };

  const handleStartLessonQuiz = () => {
    if (!selectedLessonId) return;
    const meta = lesson.getCurrentLessonMeta();
    if (!meta) return;

    setMode("quiz");
    const label = `Quiz for lesson: ${meta.title}`;
    setCurrentSessionLabel(label);
    quiz.startSession({
      type: "topic_drill",
      grade: meta.grade,
      category: meta.category,
      limit: 10,
    });
  };

  /* ---------------- QUIZ SESSION HANDLERS ---------------- */

  const handlePractice = () => {
    setMode("quiz");
    setCurrentSessionLabel("Practice session – 10 questions, Grade 10");
    quiz.startSession({ type: "practice", grade: 10, limit: 10 });
  };

  const handleTopicDrill = () => {
    setMode("quiz");
    setCurrentSessionLabel(
      "Topic drill – Health and Security, 10 questions, Grade 11"
    );
    quiz.startSession({
      type: "topic_drill",
      grade: 11,
      category: "Health/Security",
      limit: 10,
    });
  };

  const handleQuickRevision = () => {
    setMode("quiz");
    setCurrentSessionLabel("Quick revision – 5 easy questions");
    quiz.startSession({ type: "quick_revision", limit: 5 });
  };

  const handleMockExam = () => {
    setMode("quiz");
    setCurrentSessionLabel("Mock exam – 40 mixed questions, Grade 11");
    quiz.startSession({ type: "mock_exam", grade: 11, limit: 40 });
  };

  const handleWeakArea = () => {
    setMode("quiz");
    setCurrentSessionLabel("Weak area practice – focusing on mistakes");
    quiz.startSession({ type: "weak_area", limit: 10 });
  };

  const helperText =
    mode === "lesson"
      ? "Lesson mode: select Grade 10 or 11, pick a lesson, and the segments will be spoken while you can follow the enlarged text."
      : "Quiz mode: run practice, revision or mock exams. You can later map gestures to answers A, B, C, D and hints.";

  const selectedIndex = activeQuestion?.selectedIndex ?? -1;
  const answerStatus: AnswerStatus =
    activeQuestion?.answerStatus ?? "idle";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>VisionBridge Mobile</Text>
          <Text style={styles.appSubtitle}>
            Lesson Player & Audio Quiz Engine
          </Text>

          <View style={styles.modePill}>
            <Pressable
              style={[
                styles.modeChip,
                mode === "lesson" && styles.modeChipActive,
              ]}
              onPress={() => setMode("lesson")}
            >
              <Text
                style={[
                  styles.modeChipText,
                  mode === "lesson" && styles.modeChipTextActive,
                ]}
              >
                Lesson Mode
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.modeChip,
                mode === "quiz" && styles.modeChipActive,
              ]}
              onPress={() => setMode("quiz")}
            >
              <Text
                style={[
                  styles.modeChipText,
                  mode === "quiz" && styles.modeChipTextActive,
                ]}
              >
                Quiz Mode
              </Text>
            </Pressable>
          </View>

          {currentSessionLabel && mode === "quiz" ? (
            <View style={styles.sessionBanner}>
              <Text style={styles.sessionBannerLabel}>Active Session</Text>
              <Text style={styles.sessionBannerText}>
                {currentSessionLabel}
              </Text>
            </View>
          ) : (
            <Text style={styles.sessionHint}>{helperText}</Text>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ------------------- LESSON MODE ------------------- */}
          {mode === "lesson" && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Lesson Player</Text>
              <Text style={styles.cardSubtitle}>
                First choose Grade 10 or Grade 11, then select a lesson. The
                lesson text will be shown in a large font and read aloud.
              </Text>

              {/* Grade selector */}
              <View style={styles.gradeRow}>
                {grades.map((g) => (
                  <Pressable
                    key={g}
                    style={[
                      styles.gradeChip,
                      selectedGrade === g && styles.gradeChipActive,
                    ]}
                    onPress={() => handleSelectGrade(g)}
                  >
                    <Text
                      style={[
                        styles.gradeChipText,
                        selectedGrade === g && styles.gradeChipTextActive,
                      ]}
                    >
                      {g === 10 ? "Grade 10 O/L ICT" : "Grade 11 O/L ICT"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Lesson list */}
              <Text style={styles.sectionLabel}>Lessons</Text>
              <View style={styles.lessonList}>
                {lessonList.map((l) => {
                  const sel = l.lessonId === selectedLessonId;
                  return (
                    <Pressable
                      key={l.lessonId}
                      style={[styles.lessonItem, sel && styles.lessonItemActive]}
                      onPress={() => handleSelectLesson(l.lessonId)}
                    >
                      <Text
                        style={[
                          styles.lessonItemTitle,
                          sel && styles.lessonItemTitleActive,
                        ]}
                      >
                        {l.title}
                      </Text>
                      <Text style={styles.lessonItemMeta}>
                        {l.category} · Grade {l.grade}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Current lesson text */}
              <View style={styles.lessonBody}>
                <Text style={styles.lessonBodyTitle}>{lessonTitle}</Text>
                {lessonObjective ? (
                  <Text style={styles.lessonBodyObjective}>
                    {lessonObjective}
                  </Text>
                ) : null}
                <View style={styles.lessonBodyTextBox}>
                  <Text style={styles.lessonBodyText}>
                    {segmentText ||
                      "Tap “Start Lesson” to begin listening to this lesson."}
                  </Text>
                </View>

                {/* Transport controls */}
                <View style={styles.buttonRow}>
                  <PrimaryButton
                    label="Start Lesson"
                    description="Play from current or resumed position"
                    onPress={handleLessonStart}
                  />
                </View>

                <View style={styles.buttonRow}>
                  <SecondaryButton label="Previous" onPress={handleLessonPrev} />
                  <SecondaryButton label="Repeat" onPress={handleLessonRepeat} />
                  <SecondaryButton label="Next" onPress={handleLessonNext} />
                </View>

                <View style={styles.buttonRow}>
                  <DangerButton label="Stop" onPress={handleLessonStop} />
                </View>

                {/* Quiz entry – only after end of lesson */}
                {quizReady && (
                  <View style={styles.quizEntry}>
                    <Text style={styles.quizEntryLabel}>
                      You have completed this lesson. Start the linked quiz to test your understanding of this topic.
                    </Text>
                    <PrimaryButton
                      label="Start Quiz for this Lesson"
                      description="10 audio questions mapped to this topic"
                      onPress={handleStartLessonQuiz}
                    />
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ------------------- QUIZ MODE ------------------- */}
          {mode === "quiz" && (
            <>
              {/* Quiz Sessions Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Quiz Sessions</Text>
                <Text style={styles.cardSubtitle}>
                  Audio-only questions with adaptive sessions for practice,
                  revision and mock exams.
                </Text>

                <View style={styles.sessionGrid}>
                  <SessionCard
                    label="Practice"
                    badge="10 Qs · G10"
                    description="Mixed difficulty warm-up session."
                    onPress={handlePractice}
                  />
                  <SessionCard
                    label="Topic Drill"
                    badge="Health/Security"
                    description="Focus on one ICT area."
                    onPress={handleTopicDrill}
                  />
                  <SessionCard
                    label="Quick Revision"
                    badge="5 Qs"
                    description="Short revision burst with easier items."
                    onPress={handleQuickRevision}
                  />
                  <SessionCard
                    label="Mock Exam"
                    badge="40 Qs"
                    description="Simulated exam-style session."
                    onPress={handleMockExam}
                  />
                  <SessionCard
                    label="Weak Area"
                    badge="Mistakes"
                    description="Revisit and correct past errors."
                    onPress={handleWeakArea}
                  />
                </View>
              </View>

              {/* Active question / summary card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {activeQuestion?.done ? "Session Summary" : "Active Question"}
                </Text>

                {activeQuestion?.done ? (
                  <>
                    <Text style={styles.cardSubtitle}>
                      You answered {activeQuestion.correctCount} out of{" "}
                      {activeQuestion.totalCount} questions correctly.
                    </Text>
                    {typeof activeQuestion.correctCount === "number" &&
                      typeof activeQuestion.totalCount === "number" &&
                      activeQuestion.totalCount > 0 && (
                        <Text style={styles.questionText}>
                          Score:{" "}
                          {Math.round(
                            (activeQuestion.correctCount /
                              activeQuestion.totalCount) *
                            100
                          )}
                          %
                        </Text>
                      )}
                    <Text style={styles.sessionHint}>
                      You can start another session above or go back to lesson
                      mode.
                    </Text>
                  </>
                ) : activeQuestion?.question ? (
                  <>
                    <View style={styles.questionHeaderRow}>
                      <Text style={styles.questionBadge}>
                        Q {activeQuestion.index + 1} of {activeQuestion.total}
                      </Text>
                      <Text style={styles.questionMeta}>
                        G{activeQuestion.question.grade} ·{" "}
                        {activeQuestion.question.category}
                      </Text>
                    </View>

                    <Text style={styles.questionText}>
                      {activeQuestion.question.question}
                    </Text>

                    <View style={styles.questionOptions}>
                      {activeQuestion.question.options.map((opt, i) => (
                        <Text key={i} style={styles.questionOptionText}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </Text>
                      ))}
                    </View>

                    {activeQuestion.lastHint ? (
                      <Text style={styles.questionHint}>
                        Hint: {activeQuestion.lastHint}
                      </Text>
                    ) : null}

                    {activeQuestion.startedAt && (
                      <Text style={styles.questionTimer}>
                        Time on question: {elapsedSeconds}s
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.sessionHint}>
                    Start a session above to see questions here while they are
                    read aloud.
                  </Text>
                )}
              </View>

              {/* Answer Controls Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Answer Controls</Text>
                <Text style={styles.cardSubtitle}>
                  Use these while a question is being read. Each option can also
                  be mapped to gestures.
                </Text>

                <View style={styles.answerGrid}>
                  <AnswerButton
                    label="A"
                    onPress={() => quiz.answer(0)}
                    isSelected={selectedIndex === 0}
                    status={answerStatus}
                  />
                  <AnswerButton
                    label="B"
                    onPress={() => quiz.answer(1)}
                    isSelected={selectedIndex === 1}
                    status={answerStatus}
                  />
                  <AnswerButton
                    label="C"
                    onPress={() => quiz.answer(2)}
                    isSelected={selectedIndex === 2}
                    status={answerStatus}
                  />
                  <AnswerButton
                    label="D"
                    onPress={() => quiz.answer(3)}
                    isSelected={selectedIndex === 3}
                    status={answerStatus}
                  />
                </View>

                <View style={styles.buttonRow}>
                  <SecondaryButton
                    label="Repeat Question"
                    onPress={() => quiz.repeatQuestion()}
                  />
                  <SecondaryButton
                    label="Hint"
                    onPress={() => quiz.speakHint()}
                  />
                  <DangerButton
                    label="End Session"
                    onPress={() => quiz.stop()}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ---------- Reusable button components ---------- */

type ButtonProps = {
  label: string;
  description?: string;
  onPress: () => void;
};

function PrimaryButton({ label, description, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.primaryBtn} onPress={onPress}>
      <Text style={styles.primaryBtnLabel}>{label}</Text>
      {description ? (
        <Text style={styles.primaryBtnDesc}>{description}</Text>
      ) : null}
    </Pressable>
  );
}

function SecondaryButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.secondaryBtn} onPress={onPress}>
      <Text style={styles.secondaryBtnLabel}>{label}</Text>
    </Pressable>
  );
}

function DangerButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.dangerBtn} onPress={onPress}>
      <Text style={styles.dangerBtnLabel}>{label}</Text>
    </Pressable>
  );
}

type SessionCardProps = {
  label: string;
  badge: string;
  description: string;
  onPress: () => void;
};

function SessionCard({
  label,
  badge,
  description,
  onPress,
}: SessionCardProps) {
  return (
    <Pressable style={styles.sessionCard} onPress={onPress}>
      <View style={styles.sessionHeaderRow}>
        <Text style={styles.sessionLabel}>{label}</Text>
        <Text style={styles.sessionBadge}>{badge}</Text>
      </View>
      <Text style={styles.sessionDescription}>{description}</Text>
    </Pressable>
  );
}

type AnswerButtonProps = {
  label: string;
  onPress: () => void;
  isSelected: boolean;
  status: AnswerStatus;
};

function AnswerButton({
  label,
  onPress,
  isSelected,
  status,
}: AnswerButtonProps) {
  let backgroundColor = "#181b26";
  let borderColor = "#2f3246";

  if (isSelected && status === "correct") {
    backgroundColor = "#1DB954"; // green
    borderColor = "#1DB954";
  } else if (isSelected && status === "wrong") {
    backgroundColor = "#b3213b"; // red
    borderColor = "#b3213b";
  }

  return (
    <Pressable
      style={[styles.answerBtn, { backgroundColor, borderColor }]}
      onPress={onPress}
    >
      <Text style={styles.answerBtnText}>{label}</Text>
    </Pressable>
  );
}

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#020308",
  },
  root: {
    flex: 1,
    backgroundColor: "#020308",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#22252f",
  },
  appTitle: {
    color: "#f5f5f7",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  appSubtitle: {
    color: "#a0a3b1",
    fontSize: 14,
    marginBottom: 10,
  },
  modePill: {
    flexDirection: "row",
    backgroundColor: "#10121a",
    borderRadius: 999,
    padding: 4,
    marginTop: 4,
    marginBottom: 10,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  modeChipActive: {
    backgroundColor: "#375EFF",
  },
  modeChipText: {
    color: "#868899",
    fontSize: 13,
    fontWeight: "500",
  },
  modeChipTextActive: {
    color: "#ffffff",
  },
  sessionBanner: {
    marginTop: 4,
    paddingVertical: 8,
  },
  sessionBannerLabel: {
    color: "#8d93ff",
    fontSize: 12,
    marginBottom: 2,
  },
  sessionBannerText: {
    color: "#f5f5f7",
    fontSize: 14,
  },
  sessionHint: {
    color: "#7b7f8f",
    fontSize: 12,
    marginTop: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 10,
    gap: 14,
  },
  card: {
    backgroundColor: "#10121a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#202335",
  },
  cardTitle: {
    color: "#f5f5f7",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtitle: {
    color: "#a0a3b1",
    fontSize: 13,
    marginBottom: 12,
  },
  // lesson mode
  gradeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  gradeChip: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#181b26",
    borderWidth: 1,
    borderColor: "#2e3244",
    alignItems: "center",
  },
  gradeChipActive: {
    backgroundColor: "#375EFF",
    borderColor: "#375EFF",
  },
  gradeChipText: {
    color: "#b6b8c5",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  gradeChipTextActive: {
    color: "#ffffff",
  },
  sectionLabel: {
    color: "#d6d7e4",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  lessonList: {
    gap: 6,
    marginBottom: 12,
  },
  lessonItem: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#151826",
    borderWidth: 1,
    borderColor: "#25283b",
  },
  lessonItemActive: {
    borderColor: "#5b7cff",
    backgroundColor: "#181c30",
  },
  lessonItemTitle: {
    color: "#f5f5f7",
    fontSize: 14,
    fontWeight: "600",
  },
  lessonItemTitleActive: {
    color: "#ffffff",
  },
  lessonItemMeta: {
    color: "#9ea1b4",
    fontSize: 11,
    marginTop: 2,
  },
  lessonBody: {
    marginTop: 10,
  },
  lessonBodyTitle: {
    color: "#f5f5f7",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  lessonBodyObjective: {
    color: "#a0a3b1",
    fontSize: 13,
    marginBottom: 8,
  },
  lessonBodyTextBox: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#080b14",
    borderWidth: 1,
    borderColor: "#272a3c",
    marginBottom: 10,
  },
  lessonBodyText: {
    color: "#f5f5f7",
    fontSize: 16,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  quizEntry: {
    marginTop: 14,
    gap: 6,
  },
  quizEntryLabel: {
    color: "#c3c6ff",
    fontSize: 13,
  },
  // shared buttons
  primaryBtn: {
    flex: 1,
    minHeight: 60,
    borderRadius: 14,
    backgroundColor: "#375EFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },
  primaryBtnLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryBtnDesc: {
    color: "#d6dbff",
    fontSize: 12,
    marginTop: 2,
  },
  secondaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#2e3244",
    backgroundColor: "#181b26",
    minWidth: 90,
    alignItems: "center",
  },
  secondaryBtnLabel: {
    color: "#f5f5f7",
    fontSize: 14,
    fontWeight: "500",
  },
  dangerBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#b3213b",
    alignItems: "center",
  },
  dangerBtnLabel: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  // quiz mode
  sessionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  sessionCard: {
    flexBasis: "48%",
    backgroundColor: "#151826",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#25283b",
  },
  sessionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sessionLabel: {
    color: "#f5f5f7",
    fontSize: 14,
    fontWeight: "600",
  },
  sessionBadge: {
    color: "#c5c8ff",
    fontSize: 11,
  },
  sessionDescription: {
    color: "#9ea1b4",
    fontSize: 12,
  },
  answerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  answerBtn: {
    flex: 1,
    minWidth: 70,
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: "#181b26",
    borderWidth: 1,
    borderColor: "#2f3246",
    alignItems: "center",
    justifyContent: "center",
  },
  answerBtnText: {
    color: "#f5f5f7",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  questionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  questionBadge: {
    color: "#c5c8ff",
    fontSize: 12,
    fontWeight: "600",
  },
  questionMeta: {
    color: "#8d91aa",
    fontSize: 12,
  },
  questionText: {
    color: "#f5f5f7",
    fontSize: 16,
    marginBottom: 8,
  },
  questionOptions: {
    gap: 4,
    marginBottom: 6,
  },
  questionOptionText: {
    color: "#d2d5e5",
    fontSize: 14,
  },
  questionHint: {
    color: "#ffd666",
    fontSize: 13,
    marginTop: 4,
  },
  questionTimer: {
    color: "#8d93ff",
    fontSize: 12,
    marginTop: 4,
  },
});
