import { colors } from "@/theme/colors";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PageHeader } from "..//components/layout/PageHeader";
import { Screen } from "..//components/layout/Screen";
import { Card } from "../components/ui/Card";

type WeakSegment = { time_range: string; concept: string };
type StudentDetail = {
  student_id: string;
  name: string;
  grade: 10 | 11;
  overall_status: "Completed" | "In Progress" | "Needs Help";
  progress_percent: number;
  avg_score: number;
  completion_rate: number;
  risk_score: number;
  weak_topics: { topic: string; confidence: number }[];
  weak_segments: WeakSegment[];
  recommended_action: string;
};

// ✅ Replace this with Firebase fetch later
const MOCK_DETAILS: Record<string, StudentDetail> = {
  S00176: {
    student_id: "S00176",
    name: "Kasun Perera",
    grade: 10,
    overall_status: "Needs Help",
    progress_percent: 48,
    avg_score: 52,
    completion_rate: 0.55,
    risk_score: 0.84,
    weak_topics: [
      { topic: "Database Structure (Field, Record, Table)", confidence: 0.81 },
      { topic: "Relational Keys (Primary Key, Foreign Key)", confidence: 0.73 },
    ],
    weak_segments: [{ time_range: "01:00–02:00", concept: "Record definition" }],
    recommended_action: "Replay record explanation + practice quiz",
  },
};

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%` }]} />
    </View>
  );
}

function StatusBadge({ status }: { status: StudentDetail["overall_status"] }) {
  const bg =
    status === "Needs Help" ? "#FEE2E2" : status === "In Progress" ? "#FEF3C7" : "#DCFCE7";
  const fg =
    status === "Needs Help" ? "#991B1B" : status === "In Progress" ? "#92400E" : "#166534";
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{status}</Text>
    </View>
  );
}

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const detail = useMemo(() => {
    if (!id) return null;
    return MOCK_DETAILS[String(id)] ?? null;
  }, [id]);

  return (
    <Screen>
      <PageHeader
        title="Student Progress"
        subtitle={detail ? `${detail.name} • Grade ${detail.grade}` : `Student: ${id}`}
        onBack={() => router.back?.()}
      />

      {!detail ? (
        <View style={{ padding: 16 }}>
          <Card>
            <Text style={styles.h}>No data found</Text>
            <Text style={styles.p}>This student does not have prediction details yet.</Text>
          </Card>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {/* Summary */}
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.h}>{detail.student_id}</Text>
                <Text style={styles.p}>Average score & lesson engagement summary</Text>
              </View>
              <StatusBadge status={detail.overall_status} />
            </View>

            <View style={{ marginTop: 12 }}>
              <View style={styles.row}>
                <Text style={styles.label}>Overall Progress</Text>
                <Text style={styles.value}>{Math.round(detail.progress_percent)}%</Text>
              </View>
              <ProgressBar value={detail.progress_percent} />
            </View>

            <View style={styles.kpiRow}>
              <View style={styles.kpi}>
                <Text style={styles.label}>Avg Score</Text>
                <Text style={styles.kpiValue}>{Math.round(detail.avg_score)}%</Text>
              </View>
              <View style={styles.kpi}>
                <Text style={styles.label}>Completion</Text>
                <Text style={styles.kpiValue}>{Math.round(detail.completion_rate * 100)}%</Text>
              </View>
              <View style={styles.kpi}>
                <Text style={styles.label}>Risk</Text>
                <Text style={styles.kpiValue}>{Math.round(detail.risk_score * 100)}%</Text>
              </View>
            </View>
          </Card>

          {/* Weak topics */}
          <Card style={styles.card}>
            <Text style={styles.h}>Weak Topics</Text>
            <Text style={styles.p}>Topics that need revision (model confidence)</Text>

            <View style={{ marginTop: 10, gap: 10 }}>
              {detail.weak_topics.map((t) => (
                <View key={t.topic} style={styles.itemRow}>
                  <Text style={styles.itemTitle}>{t.topic}</Text>
                  <Text style={styles.itemMeta}>{Math.round(t.confidence * 100)}%</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Weak segments */}
          <Card style={styles.card}>
            <Text style={styles.h}>Weak Lesson Segments (Audio)</Text>
            <Text style={styles.p}>Exact time ranges where the learner struggled</Text>

            <View style={{ marginTop: 10, gap: 10 }}>
              {detail.weak_segments.map((s, idx) => (
                <View key={`${s.time_range}-${idx}`} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{s.time_range}</Text>
                    <Text style={styles.itemSub}>{s.concept}</Text>
                  </View>
                  <TouchableOpacity style={styles.btn}>
                    <Text style={styles.btnText}>Replay</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card>

          {/* Action */}
          <Card style={styles.card}>
            <Text style={styles.h}>Recommended Action</Text>
            <Text style={styles.p}>{detail.recommended_action}</Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]}>
                <Text style={styles.btnText}>Assign Practice Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnOutline, { flex: 1 }]}>
                <Text style={styles.btnOutlineText}>Share Revision Audio</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 30 },
  card: { marginBottom: 12, padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },

  h: { fontSize: 16, fontWeight: "900", color: colors.text },
  p: { marginTop: 4, color: colors.muted, fontWeight: "600" },

  label: { color: colors.muted, fontWeight: "700" },
  value: { color: colors.text, fontWeight: "900" },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: "900", fontSize: 12 },

  progressTrack: { height: 10, backgroundColor: "#E5E7EB", borderRadius: 999, overflow: "hidden", marginTop: 6 },
  progressFill: { height: 10, backgroundColor: "#3B82F6", borderRadius: 999 },

  kpiRow: { flexDirection: "row", gap: 12, marginTop: 12, flexWrap: "wrap" },
  kpi: { minWidth: 110, flexGrow: 1 },
  kpiValue: { marginTop: 2, fontSize: 14, fontWeight: "900", color: colors.text },

  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  itemTitle: { flex: 1, fontWeight: "800", color: colors.text },
  itemSub: { marginTop: 2, color: colors.muted, fontWeight: "600" },
  itemMeta: { fontWeight: "900", color: colors.text },

  btn: { backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "900" },

  btnOutline: { borderWidth: 1, borderColor: "#111827", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  btnOutlineText: { color: "#111827", fontWeight: "900" },
});
