import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { LessonPlayerController } from "./lesson_player/controller/lessonPlayerController";
import { QuizController } from "./quiz_engine/controller/quizController";

type Mode = "lesson" | "quiz";

export default function KarunarathneLessonQuizScreen() {
  const lesson = useMemo(() => new LessonPlayerController(), []);
  const quiz = useMemo(() => new QuizController(), []);

  const [mode, setMode] = useState<Mode>("lesson");
  const [currentSessionLabel, setCurrentSessionLabel] =
    useState<string | null>(null);

  // These all use your existing QuizController API: startSession(...)
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

          {currentSessionLabel ? (
            <View style={styles.sessionBanner}>
              <Text style={styles.sessionBannerLabel}>Active Session</Text>
              <Text style={styles.sessionBannerText}>{currentSessionLabel}</Text>
            </View>
          ) : (
            <Text style={styles.sessionHint}>
              Choose a lesson or quiz session to begin. All content is spoken
              aloud and designed for gesture-friendly use.
            </Text>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Lesson Player Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lesson Player</Text>
            <Text style={styles.cardSubtitle}>
              Structured ICT concepts, read aloud in short, focused segments.
            </Text>

            <View style={styles.buttonRow}>
              <PrimaryButton
                label="Start Lesson"
                description="Play from the beginning"
                onPress={() => {
                  setMode("lesson");
                  setCurrentSessionLabel(
                    "Lesson playback – core ICT O/L concepts"
                  );
                  lesson.start();
                }}
              />
            </View>

            <View style={styles.buttonRow}>
              <SecondaryButton
                label="Previous"
                onPress={() => lesson.prev()}
              />
              <SecondaryButton
                label="Repeat"
                onPress={() => lesson.repeat()}
              />
              <SecondaryButton label="Next" onPress={() => lesson.next()} />
            </View>

            <View style={styles.buttonRow}>
              <DangerButton label="Stop" onPress={() => lesson.stop()} />
            </View>
          </View>

          {/* Quiz Sessions Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quiz Sessions</Text>
            <Text style={styles.cardSubtitle}>
              Audio-only questions with adaptive sessions for practice, revision
              and mock exams.
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

          {/* Answer Controls Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Answer Controls</Text>
            <Text style={styles.cardSubtitle}>
              Use these while a question is being read. Each option can also be
              mapped to gestures.
            </Text>

            <View style={styles.answerGrid}>
              <AnswerButton label="A" onPress={() => quiz.answer(0)} />
              <AnswerButton label="B" onPress={() => quiz.answer(1)} />
              <AnswerButton label="C" onPress={() => quiz.answer(2)} />
              <AnswerButton label="D" onPress={() => quiz.answer(3)} />
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

function SessionCard({ label, badge, description, onPress }: SessionCardProps) {
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
};

function AnswerButton({ label, onPress }: AnswerButtonProps) {
  return (
    <Pressable style={styles.answerBtn} onPress={onPress}>
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
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
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
  },
});
