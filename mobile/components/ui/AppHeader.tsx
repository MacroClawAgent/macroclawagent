import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { AvatarButton } from "./AvatarButton";

interface AppHeaderProps {
  title?: string;
  wordmark?: boolean;
  showAvatar?: boolean;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onAvatarPress?: () => void;
}

export function AppHeader({
  title,
  wordmark = false,
  showAvatar = false,
  showBack = false,
  rightElement,
  onAvatarPress,
}: AppHeaderProps) {
  const { colors } = useTheme();
  const { userProfile } = useAuth();
  const router = useRouter();

  const handleAvatarPress = onAvatarPress ?? (() => router.push("/profile"));
  const handleBack = () => router.back();

  return (
    <View style={styles.header}>
      {/* Left */}
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.textPrimary }]}>←</Text>
          </TouchableOpacity>
        ) : null}
        {wordmark ? (
          <View style={styles.wordmark}>
            <View style={[styles.wordmarkDot, { backgroundColor: colors.teal }]} />
            <Text style={[styles.wordmarkText, { color: colors.textPrimary }]}>JONNO</Text>
          </View>
        ) : title ? (
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        ) : null}
      </View>

      {/* Right */}
      <View style={styles.right}>
        {rightElement ?? null}
        {showAvatar ? (
          <AvatarButton
            name={userProfile?.full_name ?? ""}
            onPress={handleAvatarPress}
            size={36}
            color={colors.teal}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  wordmark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  wordmarkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  wordmarkText: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2,
  },
  backBtn: {
    marginRight: 4,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: "400",
  },
});
