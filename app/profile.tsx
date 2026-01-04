import { Button, StyleSheet, Text, View } from 'react-native';
//import { useAnnounceOnFocus } from "./hooks/tts";
import { router, Stack } from "expo-router";



export default function ProfileScreen() {
  const TITLE = "Profile";
  // useAnnounceOnFocus(TITLE);

  return (
    <>
      {/* Sets the header title for consistency */}
      <Stack.Screen options={{ title: TITLE }} />
      <View style={styles.container}>
        {/* Mark as header so SRs read it naturally too */}
        <Text accessibilityRole="header" style={styles.title}>
          {TITLE}
        </Text>
        <Text  style={styles.text}>…your profile content…</Text>
        <Button
          title="Teacher Dashboard"
          onPress={() => router.push("/(drawer)")}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", padding: 20 },
  title: { color: "white", fontSize: 28, marginBottom: 8 },
  text: { color: "white", fontSize: 16 },
});
