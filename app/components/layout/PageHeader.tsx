import { colors } from "@/theme/colors";
import { radius } from "@/theme/spacing";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
};

export function PageHeader({ title, subtitle, searchPlaceholder }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {/* <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput
            placeholder={searchPlaceholder ?? "Search..."}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>
        <View style={styles.actions}>
          <View style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={18} color={colors.text} />
            <View style={styles.dot} />
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>PS</Text>
          </View>
        </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  textCol: { flex: 1, minWidth: 160 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  subtitle: { marginTop: 4, color: colors.muted, fontSize: 13 },
  search: {
    flex: 1,
    maxWidth: 520,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  input: { marginLeft: 8, flex: 1, color: colors.text },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  dot: { position: "absolute", right: 10, top: 10, width: 7, height: 7, borderRadius: 99, backgroundColor: "#EF4444" },
  avatar: { width: 38, height: 38, borderRadius: 999, backgroundColor: "#6366F1", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontWeight: "800" }
});


