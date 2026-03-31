import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { TabSwipeWrapper } from "../../hooks/useTabSwipe";

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
}

export function Screen({ children, style, edges = ["top"] }: ScreenProps) {
  const { colors } = useTheme();
  return (
    <TabSwipeWrapper>
      <SafeAreaView
        edges={edges}
        style={[styles.screen, { backgroundColor: colors.bg }, style]}
      >
        {children}
      </SafeAreaView>
    </TabSwipeWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
