import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
}

export function Card({ children, style, padding = 20 }: CardProps) {
  const { isDark } = useTheme();
  return (
    <BlurView
      intensity={isDark ? 52 : 72}
      tint={isDark ? "dark" : "light"}
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight, { padding }, style]}
    >
      {/* Specular top-edge highlight — light refracting off top of glass */}
      <LinearGradient
        colors={isDark
          ? ['rgba(255,220,150,0.22)', 'rgba(255,220,150,0.0)']
          : ['rgba(255,255,255,0.92)', 'rgba(255,255,255,0.0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.specular}
        pointerEvents="none"
      />
      {/* Left-edge shimmer — thickness illusion */}
      <LinearGradient
        colors={isDark
          ? ['rgba(255,220,150,0.10)', 'rgba(255,220,150,0.0)']
          : ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.leftShimmer}
        pointerEvents="none"
      />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderColor: "rgba(255,255,255,0.62)",
    shadowColor: "#7BAAC8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 8,
  },
  cardDark: {
    backgroundColor: "rgba(28,22,18,0.55)",
    borderColor: "rgba(255,220,150,0.14)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  specular: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
  },
  leftShimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 56,
    borderTopLeftRadius: 27,
    borderBottomLeftRadius: 27,
  },
});
