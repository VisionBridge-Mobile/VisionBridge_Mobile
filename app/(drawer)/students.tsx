import { colors } from "@/theme/colors";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { PageHeader } from "../components/layout/PageHeader";
import { Screen } from "../components/layout/Screen";
import { Card } from "../components/ui/Card";

type StudentProgress = {
  student_id: string;
  name: string;
  grade: 10 | 11;
  overall_status: "Completed" | "In Progress" | "Needs Help";
  progress_percent: number; // 0-100
  avg_score: number; // 0-100
  completion_rate: number; // 0-1
  risk_score: number; // 0-1
  weak_topics_count: number;
};

const MOCK: StudentProgress[] = [
  {
    student_id: "S00176",
    name: "Ravindu Thinusha",
    grade: 10,
    overall_status: "Needs Help",
    progress_percent: 48,
    avg_score: 52,
    completion_rate: 0.55,
    risk_score: 0.84,
    weak_topics_count: 2,
  },
  {
    student_id: "S00211",
    name: "Thinuka Tharun",
    grade: 11,
    overall_status: "In Progress",
    progress_percent: 71,
    avg_score: 69,
    completion_rate: 0.73,
    risk_score: 0.42,
    weak_topics_count: 1,
  },
  {
    student_id: "S00044",
    name: "Sanduni Sathsara",
    grade: 10,
    overall_status: "Completed",
    progress_percent: 92,
    avg_score: 90,
    completion_rate: 0.94,
    risk_score: 0.10,
    weak_topics_count: 0,
  },
];

function StatusBadge({ status }: { status: StudentProgress["overall_status"] }) {
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

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%` }]} />
    </View>
  );
}

export default function StudentsScreen() {
  const [q, setQ] = useState("");

  // Replace MOCK with data from Firebase predictions collection
  const data = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MOCK;
    return MOCK.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.student_id.toLowerCase().includes(query) ||
        String(s.grade).includes(query)
    );
  }, [q]);

  return (
    <Screen>
      <PageHeader title="Students" subtitle="Manage and monitor student performance" />

      <View style={styles.container}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search by Name / ID"
          placeholderTextColor={colors.muted}
          style={styles.search}
        />

        <FlatList
          data={data}
          keyExtractor={(item) => item.student_id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/students/${item.student_id}`)}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.meta}>
                      {item.student_id} • Grade {item.grade}
                    </Text>
                  </View>
                  <StatusBadge status={item.overall_status} />
                </View>

                <View style={{ marginTop: 12 }}>
                  <View style={styles.row}>
                    <Text style={styles.smallLabel}>Progress</Text>
                    <Text style={styles.smallValue}>{Math.round(item.progress_percent)}%</Text>
                  </View>
                  <ProgressBar value={item.progress_percent} />
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.smallLabel}>Avg score</Text>
                    <Text style={styles.statValue}>{Math.round(item.avg_score)}%</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.smallLabel}>Completion</Text>
                    <Text style={styles.statValue}>{Math.round(item.completion_rate * 100)}%</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.smallLabel}>Weak topics</Text>
                    <Text style={styles.statValue}>{item.weak_topics_count}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.smallLabel}>Risk</Text>
                    <Text style={styles.statValue}>{Math.round(item.risk_score * 100)}%</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  search: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  card: { marginBottom: 12, padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontSize: 16, fontWeight: "800", color: colors.text },
  meta: { marginTop: 2, color: colors.muted, fontWeight: "600" },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontWeight: "800", fontSize: 12 },

  progressTrack: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 6,
  },
  progressFill: {
    height: 10,
    backgroundColor: "#3B82F6",
    borderRadius: 999,
  },

  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 },
  stat: { flexGrow: 1, minWidth: 120 },
  smallLabel: { color: colors.muted, fontWeight: "700" },
  smallValue: { color: colors.text, fontWeight: "800" },
  statValue: { marginTop: 2, color: colors.text, fontWeight: "900", fontSize: 14 },
});
