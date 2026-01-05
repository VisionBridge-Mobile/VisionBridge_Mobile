import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/layout/Screen";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { colors } from "@/theme/colors";

export default function AudioLessonScreen() {
  return (
    <Screen>
      <PageHeader 
        title="Audio Lesson" 
        subtitle="Manage and generate audio lessons" 
        searchPlaceholder="Search audio lessons..." 
      />
      <View style={styles.body}>
        <Card>
          <Text style={styles.h}>Audio Lesson</Text>
          <Text style={styles.p}>This page will include audio lesson generation and management features.</Text>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16 },
  h: { fontSize: 16, fontWeight: "800", color: colors.text },
  p: { marginTop: 6, color: colors.muted, fontWeight: "600" }
});

