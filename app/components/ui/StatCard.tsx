import { colors } from "@/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";

type Tone = "blue" | "green" | "purple" | "orange";

const toneBg: Record<Tone, string> = {
  blue: "#DBEAFE",
  green: "#DCFCE7",
  purple: "#EDE9FE",
  orange: "#FFEDD5"
};

const toneIcon: Record<Tone, string> = {
  blue: "#2563EB",
  green: "#16A34A",
  purple: "#7C3AED",
  orange: "#F97316"
};

type Props = {
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tone: Tone;
};

export function StatCard({ label, value, delta, icon, tone }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
          <View style={styles.deltaRow}>
            {/* <Ionicons name="arrow-up-outline" size={14} color={colors.success} /> */}
            <Text style={styles.delta}>{delta}</Text>
          </View>
        </View>
        <View style={[styles.iconWrap, { backgroundColor: toneBg[tone] }]}>
          <Ionicons name={icon} size={18} color={toneIcon[tone]} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  textCol: { flex: 1 },
  label: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  value: { marginTop: 6, color: colors.text, fontSize: 28, fontWeight: "900" },
  deltaRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 6 },
  delta: { color: colors.success, fontWeight: "700", fontSize: 12 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" }
});


