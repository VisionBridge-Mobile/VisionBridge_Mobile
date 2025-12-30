// app/index.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, Href } from "expo-router";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SpeakableProvider, SpeakableText, useReadScreen } from "./components/SpeakableProvider";
import { Video, ResizeMode } from "expo-av";

function HomeContent({ go }: { go: (path: Href) => void }) {
  const { readScreen, stop } = useReadScreen();

  const feedback = useCallback(() => {
    Haptics.selectionAsync().catch(() => { });
  }, []);

  // Triple-tap: read the whole screen
  const tap = Gesture.Tap()
    .numberOfTaps(3)
    .onEnd(() => {
      runOnJS(feedback)();
      runOnJS(readScreen)({ haptic: true });

    });

  const swipeUp = Gesture.Fling()
    .direction(Directions.UP)
    .onEnd(() => {
      runOnJS(stop)();
      runOnJS(feedback)();
      runOnJS(go)("/module");

    });

  const swipeDown = Gesture.Fling()
    .direction(Directions.DOWN)
    .onEnd(() => {
      runOnJS(stop)();
      runOnJS(feedback)();
      runOnJS(go)("/profile");

    });

  const gestures = Gesture.Simultaneous(tap, swipeUp, swipeDown);

  return (
    <GestureDetector gesture={gestures}>
      <View style={styles.container}>

        <SpeakableText accessibilityRole="header" style={styles.title} order={0}>
          Hi, Welcome to Vision Bridge
        </SpeakableText>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "black" }}>
          <Text style={styles.text1}>Modules</Text>
          <Video
            source={require("../assets/images/up.mp4")}
            style={{ width: 150, height: 150 }}
            isLooping
            shouldPlay
            isMuted
            resizeMode={ResizeMode.CONTAIN}
          />

        </View>

        <SpeakableText style={styles.text} order={1}>

          Swipe up → Modules
        </SpeakableText>

        <SpeakableText style={styles.text} order={2}>
          Swipe down → Help
        </SpeakableText>


      </View>
    </GestureDetector>
  );
}

export default function Index() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const navLockRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const go = (path: Href) => {
    if (!mounted || navLockRef.current) return;
    navLockRef.current = true;
    try {
      router.push(path);
    } finally {
      setTimeout(() => (navLockRef.current = false), 500);
    }
  };

  return (
    <SpeakableProvider >
      <HomeContent go={go} />
    </SpeakableProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    gap: 8,

  },
  title: {
    color: "yellow",
    fontSize: 25,
    textAlign: "center",
    marginBottom: 5,
    fontWeight: "bold",
    backgroundColor: "#251bb1ff",
    padding: 30,
    borderRadius: 20,

  },
  text: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    display: "none"
  },
  text1: {
    color: "white",
    fontWeight: "bold",
    fontSize:30,
    textAlign: "center",
    backgroundColor: "#8d071cff",
    padding: 30,
    borderRadius: 20,
    marginBottom:10,
    shadowColor:"#ffffff",
    paddingHorizontal:100


  }
});
