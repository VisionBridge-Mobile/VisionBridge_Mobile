import React from "react";
import { SafeAreaView, StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions } from "react-native";
import { colors } from "@/theme/colors";
import { contentMaxWidth, isLargeScreen } from "@/utils/responsive";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, style }: Props) {
  const { width } = useWindowDimensions();
  const large = isLargeScreen(width);
  const maxWidth = contentMaxWidth(width);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.outer, large && { alignItems: "center" }]}>
        <View style={[styles.inner, large && { width: maxWidth }, style]}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  outer: { flex: 1, backgroundColor: colors.bg },
  inner: { flex: 1 }
});


