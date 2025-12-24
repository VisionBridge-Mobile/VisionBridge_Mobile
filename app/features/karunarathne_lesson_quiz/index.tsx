import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { LessonPlayerController } from "./lesson_player/controller/lessonPlayerController";
import { QuizController } from "./quiz_engine/controller/quizController";

export default function KarunarathneLessonQuizScreen() {
  const lesson = useMemo(() => new LessonPlayerController(), []);
  const quiz = useMemo(() => new QuizController(), []);

  const btn = (label: string, onPress: () => void) => (
    <Pressable onPress={onPress} style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}>
      <Text>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Lesson Player & Quiz Demo</Text>

      <Text style={{ fontWeight: "600" }}>Lesson</Text>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {btn("Start", () => lesson.start())}
        {btn("Prev", () => lesson.prev())}
        {btn("Next", () => lesson.next())}
        {btn("Repeat", () => lesson.repeat())}
        {btn("Stop", () => lesson.stop())}
      </View>

      <Text style={{ fontWeight: "600", marginTop: 16 }}>Quiz Sessions</Text>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {btn("Practice (10) G10", () => quiz.startSession({ type: "practice", grade: 10, limit: 10 }))}
        {btn("Topic Drill: Health/Security (10)", () =>
          quiz.startSession({ type: "topic_drill", grade: 11, category: "Health/Security", limit: 10 })
        )}
        {btn("Quick Revision (5)", () => quiz.startSession({ type: "quick_revision", limit: 5 }))}
        {btn("Mock Exam (40)", () => quiz.startSession({ type: "mock_exam", grade: 11, limit: 40 }))}
        {btn("Weak Area (10)", () => quiz.startSession({ type: "weak_area", limit: 10 }))}
        {btn("Repeat Question", () => quiz.repeatQuestion())}
        {btn("Hint", () => quiz.speakHint())}
      </View>

      <Text style={{ fontWeight: "600", marginTop: 16 }}>Answer</Text>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {btn("A", () => quiz.answer(0))}
        {btn("B", () => quiz.answer(1))}
        {btn("C", () => quiz.answer(2))}
        {btn("D", () => quiz.answer(3))}
        {btn("Stop Audio", () => quiz.stop())}
      </View>
    </ScrollView>
  );
}
