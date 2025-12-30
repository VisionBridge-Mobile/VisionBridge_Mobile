import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { Text, TextProps } from "react-native";
import { TTS } from "../hooks/tts";

type Item = { id: string; text: string; order: number };

type Ctx = {
  register: (id: string, text: string, order?: number) => () => void;
  readScreen: (opts?: { haptic?: boolean; separator?: string }) => Promise<void>;
  stop: () => void;
};

const SpeakCtx = createContext<Ctx | null>(null);

export function SpeakableProvider({ children }: { children: React.ReactNode }) {
  // stable ref object that never changes
  const registryRef = useRef<Map<string, Item>>(new Map());

  const register = useCallback(
    (id: string, text: string, order = 0) => {
      const registry = registryRef.current;
      registry.set(id, { id, text, order });

      // cleanup function to unregister
      return () => {
        registry.delete(id);
      };
    },
    [] // only uses registryRef, which is stable
  );

  const readScreen = useCallback<Ctx["readScreen"]>(
    async ({ haptic = true, separator = ". " } = {}) => {
      const registry = registryRef.current;
      const items = [...registry.values()].sort((a, b) => a.order - b.order);
      const text = items.map(i => i.text).join(separator);
      await TTS.speak(text, { haptic });
    },
    [] // only uses registryRef and TTS import
  );

  const value = useMemo<Ctx>(
    () => ({
      register,
      readScreen,
      stop: TTS.stop,
    }),
    [register, readScreen]
  );

  return <SpeakCtx.Provider value={value}>{children}</SpeakCtx.Provider>;
}

export function useReadScreen() {
  const ctx = useContext(SpeakCtx);
  if (!ctx) throw new Error("useReadScreen must be used inside <SpeakableProvider>");
  return ctx;
}

// Text that auto-registers its content
export function SpeakableText({
  children,
  order = 0,
  ...rest
}: TextProps & { children: string; order?: number }) {
  const id = React.useId();
  const ctx = useContext(SpeakCtx);

  useEffect(() => {
    if (!ctx) return;
    return ctx.register(id, String(children), order);
  }, [ctx, id, children, order]);

  return <Text {...rest}>{children}</Text>;
}
