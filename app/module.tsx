// app/module.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, findNodeHandle } from "react-native";
import { router, Stack, Href } from "expo-router";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";

type Mod = { id: string; title: string; subtitle?: string };

const MODULES: Mod[] = [
  { id: "m1", title: "Orientation", subtitle: "Starts here" },
  { id: "m3", title: "Lessons", subtitle: "Structured learning" },
  { id: "m4", title: "Quizzes", subtitle: "Check your progress" },
  { id: "m5", title: "Help & Tips", subtitle: "Shortcuts and gestures" },
];

/**
 * Route mapping:
 * - Quizzes -> your Lesson Player & Audio Quiz Engine
 * - (Optional) Lessons can also map to same route if desired
 */
const MODULE_ROUTES: Record<string, Href> = {
  m4: "/karunarathne_lesson_quiz",
  // m3: "/karunarathne_lesson_quiz", // uncomment if Lessons should open it too
};

export default function ModulesScreen() {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const speakingRef = useRef(false);

  // Layout tracking
  const containerRef = useRef<View | null>(null);
  const containerAbsRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const itemLayoutsRef = useRef<Record<number, { x: number; y: number; width: number; height: number }>>({});

  // Prevent repeated announcements
  const lastAnnouncedRef = useRef<number>(-1);
  const lastAnnouncedTimeRef = useRef<number>(0);
  const ANNOUNCE_MIN_MS = 6000;

  /* -------------------- Speech helper -------------------- */
  const safeSpeak = useCallback(async (text: string) => {
    if (!text) return;
    try {
      if (speakingRef.current) Speech.stop();
      speakingRef.current = true;
      try {
        await Haptics.selectionAsync();
      } catch {
        // ignore haptics errors
      }
      Speech.speak(text, {
        language: "en-US",
        pitch: 1.0,
        rate: 1.0,
        onDone: () => {
          speakingRef.current = false;
          return;
        },
        onStopped: () => {
          speakingRef.current = false;
          return;
        },
        onError: () => {
          speakingRef.current = false;
          return;
        },
      });
    } catch {
      speakingRef.current = false;
    }
  }, []);

  /* -------------------- Focus + announce -------------------- */
  const focusAndAnnounce = useCallback(
    (index: number) => {
      if (index < 0 || index >= MODULES.length) return;
      setFocusedIndex(index);
      safeSpeak(MODULES[index].title);
    },
    [safeSpeak]
  );

  /* -------------------- Navigate to module -------------------- */
  const goToModule = useCallback(
    (idx: number) => {
      const mod = MODULES[idx];
      const route = MODULE_ROUTES[mod.id];
      if (!route) return;

      try {
        Speech.stop();
      } catch {
        // ignore
      }
      Haptics.selectionAsync().catch(() => {});
      safeSpeak(`Opening ${mod.title}.`);

      setTimeout(() => {
        router.push(route);
      }, 500);
    },
    [safeSpeak]
  );

  /* -------------------- Home navigation -------------------- */
  const goHome = useCallback(() => {
    try {
      Speech.stop();
    } catch {
      // ignore
    }
    Haptics.selectionAsync().catch(() => {});
    router.push("/");
  }, []);

  /* -------------------- Layout measurement -------------------- */
  const measureContainer = () => {
    const node = containerRef.current ? findNodeHandle(containerRef.current) : null;
    if (!node) return;

    (containerRef.current as any).measure?.(
      (_fx: number, _fy: number, width: number, height: number, px: number, py: number) => {
        containerAbsRef.current = { x: px, y: py, width, height };
      }
    );
  };

  const onItemLayout = (idx: number, e: any) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    itemLayoutsRef.current[idx] = { x, y, width, height };
    measureContainer();
  };

  /* -------------------- Announce index under finger -------------------- */
  const announceIndex = useCallback(
    (idx: number) => {
      const now = Date.now();
      if (idx === lastAnnouncedRef.current && now - lastAnnouncedTimeRef.current < ANNOUNCE_MIN_MS) {
        return;
      }

      lastAnnouncedRef.current = idx;
      lastAnnouncedTimeRef.current = now;
      Haptics.selectionAsync().catch(() => {});
      safeSpeak(MODULES[idx].title);
      setFocusedIndex(idx);
    },
    [safeSpeak]
  );

  /* -------------------- Pointer move & end handlers -------------------- */
  const handleMove = useCallback(
    (pageX?: number, pageY?: number) => {
      if (pageX == null || pageY == null) return;
      const cont = containerAbsRef.current;
      if (!cont) return;

      for (let i = 0; i < MODULES.length; i++) {
        const child = itemLayoutsRef.current[i];
        if (!child) continue;

        const left = cont.x + child.x;
        const top = cont.y + child.y;
        const right = left + child.width;
        const bottom = top + child.height;

        if (pageX >= left && pageX <= right && pageY >= top && pageY <= bottom) {
          runOnJS(announceIndex)(i);
          return;
        }
      }

      // finger is not over any item
      lastAnnouncedRef.current = -1;
    },
    [announceIndex]
  );

  const handleEnd = useCallback(() => {
    lastAnnouncedRef.current = -1;
  }, []);

  /* -------------------- Gestures -------------------- */
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minPointers(1)
        .onUpdate((e: any) => {
          const px = e.absoluteX ?? e.pageX;
          const py = e.absoluteY ?? e.pageY;
          runOnJS(handleMove)(px, py);
        })
        .onEnd(() => runOnJS(handleEnd)())
        .onFinalize(() => runOnJS(handleEnd)()),
    [handleMove, handleEnd]
  );

  const back = useMemo(
    () =>
      Gesture.Fling()
        .direction(Directions.LEFT)
        .onEnd(() => runOnJS(goHome)()),
    [goHome]
  );

  const gestures = Gesture.Simultaneous(pan, back);

  useEffect(() => {
    const t = setTimeout(() => measureContainer(), 200);
    return () => clearTimeout(t);
  }, []);

  /* -------------------- UI -------------------- */
  return (
    <>
      <Stack.Screen options={{ title: "Modules" }} />
      <GestureDetector gesture={gestures}>
        <View
          ref={containerRef}
          style={styles.container}
          onLayout={() => measureContainer()}
        >
          <View style={styles.list}>
            {MODULES.map((m, idx) => {
              const focused = idx === focusedIndex;
              return (
                <Pressable
                  key={m.id}
                  onLayout={(e) => onItemLayout(idx, e)}
                  onPress={() => focusAndAnnounce(idx)}          // tap = announce
                  onLongPress={() => goToModule(idx)}            // long press = open
                  delayLongPress={400}
                  style={[styles.row, focused && styles.rowFocused]}
                  accessibilityRole="button"
                  accessibilityLabel={m.title}
                  accessibilityState={{ selected: focused }}
                >
                  <Text style={styles.title}>{m.title}</Text>
                  {m.subtitle ? <Text style={styles.subtitle}>{m.subtitle}</Text> : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.hint}>
            Tip: Drag your finger across the screen to explore. Tap to hear a module.
            Long-press to open it. Swipe left anywhere to go back.
          </Text>
        </View>
      </GestureDetector>
    </>
  );
}

/* -------------------- Styles -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", padding: 16, paddingStart: 20 },
  list: { gap: 50, marginTop: 6 },
  row: {
    borderRadius: 14,
    paddingVertical: 30,
    paddingHorizontal: 16,
    backgroundColor: "#1c1c1e",
    borderWidth: 2,
    borderColor: "transparent",
  },
  rowFocused: { borderColor: "#5ac8fa", backgroundColor: "#000000" },
  title: { color: "white", fontSize: 18, fontWeight: "600" },
  subtitle: { color: "#ccc", fontSize: 14, marginTop: 2 },
  hint: { color: "#9a9a9a", fontSize: 12, textAlign: "center", marginTop: 16 },
});
