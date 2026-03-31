import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useTabSwipe } from "../../hooks/useTabSwipe";

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
}

export function Screen({ children, style, edges = ["top"] }: ScreenProps) {
  const { colors } = useTheme();
  const swipe = useTabSwipe();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.screen, { backgroundColor: colors.bg }, style]}
      {...swipe}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
