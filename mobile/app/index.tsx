import { useEffect, useRef } from "react";
import { View, Text, Image, Animated, StyleSheet, Dimensions } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";

const { width: W, height: H } = Dimensions.get("window");
const BAR_WIDTH = W * 0.5;

export default function SplashGate() {
  const { session, userProfile, loading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);

  // Animate logo + progress bar
  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
    ]).start();

    // Progress bar fills over 1.5s
    Animated.timing(barWidth, { toValue: BAR_WIDTH, duration: 1500, useNativeDriver: false }).start();
  }, []);

  // Navigate once auth is resolved
  useEffect(() => {
    if (loading || hasNavigated.current) return;

    const minDelay = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      Animated.timing(fadeAnim, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        if (!session) {
          router.replace("/(auth)/sign-in");
        } else if (!userProfile?.profile_complete) {
          router.replace("/(onboarding)/step1");
        } else {
          router.replace("/(tabs)/home");
        }
      });
    }, 1600);

    return () => clearTimeout(minDelay);
  }, [loading, session, userProfile]);

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      {/* Background image — full bleed */}
      <Image
        source={require("@/assets/images/loading.png")}
        style={s.bgImage}
        resizeMode="cover"
      />

      {/* Logo */}
      <Animated.View style={[s.logoWrap, { opacity: logoOpacity }]}>
        <View style={s.logoDot} />
        <Text style={s.logoText}>Jonno</Text>
      </Animated.View>

      {/* Bottom: tagline + progress bar */}
      <Animated.View style={[s.bottomContent, { opacity: logoOpacity }]}>
        <Text style={s.tagline}>Your AI Nutrition Coach</Text>
        <View style={s.barTrack}>
          <Animated.View style={[s.barFill, { width: barWidth }]} />
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
  logoWrap: {
    position: "absolute",
    top: H * 0.1,
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
    gap: 14,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(232,224,208,0.7)",
    letterSpacing: 0.5,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(232,224,208,0.12)",
    overflow: "hidden",
  },
  barFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "#F5C842",
  },
});
