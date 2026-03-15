import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface StatusDotProps {
  color: string;
  pulse?: boolean;
  size?: number;
}

export function StatusDot({ color, pulse = true, size = 8 }: StatusDotProps) {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, anim]);

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color, width: size, height: size, borderRadius: size / 2, opacity: anim },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {},
});
