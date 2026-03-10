import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { ReactNode } from "react";

interface DashCardProps {
  title?: string;
  rightLabel?: string;
  onRightPress?: () => void;
  children: ReactNode;
  style?: ViewStyle;
}

export function DashCard({ title, rightLabel, onRightPress, children, style }: DashCardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      {(title || rightLabel) && (
        <View style={styles.header}>
          {title && (
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          )}
          {rightLabel && (
            <TouchableOpacity onPress={onRightPress} activeOpacity={0.7}>
              <Text style={[styles.right, { color: colors.primary }]}>{rightLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 18, borderWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title: { fontSize: 15, fontWeight: "700" },
  right: { fontSize: 13, fontWeight: "600" },
});
