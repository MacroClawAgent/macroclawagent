import { useEffect, useRef } from "react";
import { View, Text, Image, Animated, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const { width: W, height: H } = Dimensions.get("window");

export default function SplashGate() {
  const { session, userProfile, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);

  // Animate logo in
  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Navigate once auth is resolved
  useEffect(() => {
    if (loading || hasNavigated.current) return;

    // Wait minimum 1.5s for the splash to feel intentional
    const minDelay = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      // Fade out splash
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        if (!session) {
          router.replace("/(auth)/sign-in");
        } else if (!userProfile?.profile_complete) {
          router.replace("/(onboarding)/step1");
        } else {
          router.replace("/(tabs)/home");
        }
      });
    }, 1500);

    return () => clearTimeout(minDelay);
  }, [loading, session, userProfile]);

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      {/* Background image */}
      <Image
        source={require("@/assets/images/loading.png")}
        style={s.bgImage}
        resizeMode="cover"
      />

      {/* Gradient overlay at top and bottom for text readability */}
      <View style={s.topGradient} />
      <View style={s.bottomGradient} />

      {/* Logo + text */}
      <Animated.View style={[s.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <View style={s.logoDot} />
        <Text style={s.logoText}>Jonno</Text>
      </Animated.View>

      {/* Tagline at bottom */}
      <Animated.View style={[s.bottomContent, { opacity: logoOpacity }]}>
        <Text style={s.tagline}>Your AI Nutrition Coach</Text>
        <View style={s.loadingDots}>
          <View style={[s.dot, s.dot1]} />
          <View style={[s.dot, s.dot2]} />
          <View style={[s.dot, s.dot3]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1612",
  },
  bgImage: {
    position: "absolute",
    width: W,
    height: H,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.25,
    backgroundColor: "rgba(28,22,18,0.7)",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: H * 0.2,
    backgroundColor: "rgba(28,22,18,0.85)",
  },
  logoWrap: {
    position: "absolute",
    top: H * 0.12,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F5C842",
    shadowColor: "#F5C842",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#E8E0D0",
    letterSpacing: 1,
  },
  bottomContent: {
    position: "absolute",
    bottom: H * 0.08,
    alignSelf: "center",
    alignItems: "center",
    gap: 16,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(232,224,208,0.7)",
    letterSpacing: 0.5,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F5C842",
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1.0 },
});
