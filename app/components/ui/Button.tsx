import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";

type Props = {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  variant?: "outline" | "solid";
  onPress?: () => void;
};

export function Button({ label, icon, variant = "outline", onPress }: Props) {
  const solid = variant === "solid";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        solid ? styles.solid : styles.outline,
        pressed && { opacity: 0.85 }
      ]}
    >
      <View style={styles.row}>
        {!!icon && <Ionicons name={icon} size={16} color={solid ? "#FFFFFF" : colors.primary} />}
        <Text style={[styles.label, solid ? { color: "#FFFFFF" } : { color: colors.text }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: "flex-start"
  },
  outline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border
  },
  solid: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 13, fontWeight: "600" }
});


