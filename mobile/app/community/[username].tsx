import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppHeader } from "@/components/ui/AppHeader";
import { apiPost, apiDelete } from "@/lib/api";

const BG = "#F4F5F7"; const WHITE = "#FFFFFF"; const BORDER = "#E5E7EB";
const TEAL = "#2BB6A6";
const BASE_URL: string = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://jonnoai.com");

const GOAL_LABEL: Record<string, string> = {
  lose_weight: "Lose Weight 🔥", build_muscle: "Build Muscle 💪",
  performance: "Performance ⚡", maintain: "Stay Healthy 🌿",
};

interface UserProfile {
  id: string; username: string; full_name: string;
  bio?: string; fitness_goal?: string; is_public?: boolean;
  follower_count?: number; following_count?: number;
}

export default function CommunityUserProfile() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`${BASE_URL}/api/users/search?q=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.users ?? []).find((u: UserProfile) => u.username === username);
        if (found) setProfile(found);
        else setError("User not found");
      })
      .catch(() => setError("Could not load profile"))
      .finally(() => setLoading(false));
  }, [username]);

  async function toggleFollow() {
    if (!profile) return;
    setToggling(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await apiDelete(`/api/follows?following_id=${profile.id}`);
      } else {
        await apiPost("/api/follows", { following_id: profile.id });
      }
    } catch {
      setFollowing(wasFollowing); // revert
    } finally {
      setToggling(false);
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : (profile?.username?.[0] ?? "?").toUpperCase();

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title={username ? `@${username}` : "Profile"} showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={TEAL} size="large" style={{ marginTop: 60 }} />
        ) : error || !profile ? (
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>😕</Text>
            <Text style={s.emptyTitle}>{error ?? "User not found"}</Text>
          </View>
        ) : (
          <>
            {/* Avatar + name */}
            <View style={s.hero}>
              <View style={s.avatarCircle}>
                <Text style={s.avatarInitials}>{initials}</Text>
              </View>
              <Text style={s.name}>{profile.full_name || `@${profile.username}`}</Text>
              <Text style={s.handle}>@{profile.username}</Text>
              {profile.fitness_goal && (
                <View style={s.goalPill}>
                  <Text style={s.goalText}>{GOAL_LABEL[profile.fitness_goal] ?? profile.fitness_goal}</Text>
                </View>
              )}
              {profile.bio ? <Text style={s.bio}>{profile.bio}</Text> : null}

              {/* Follow button */}
              <TouchableOpacity
                style={[s.followBtn, following && s.followBtnActive]}
                onPress={toggleFollow}
                disabled={toggling}
                activeOpacity={0.85}
              >
                {toggling
                  ? <ActivityIndicator size="small" color={following ? WHITE : TEAL} />
                  : <Text style={[s.followBtnText, following && s.followBtnTextActive]}>
                      {following ? "Following ✓" : "Follow"}
                    </Text>
                }
              </TouchableOpacity>
            </View>

            {/* Private account notice */}
            {profile.is_public === false && (
              <View style={s.privateCard}>
                <Text style={s.privateEmoji}>🔒</Text>
                <Text style={s.privateText}>This account is private</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 20, paddingBottom: 60 },
  hero: { alignItems: "center", gap: 8, paddingVertical: 24 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "rgba(43,182,166,0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: TEAL,
  },
  avatarInitials: { fontSize: 32, fontWeight: "800", color: TEAL },
  name: { fontSize: 22, fontWeight: "800", color: "#1C1C1E", marginTop: 4 },
  handle: { fontSize: 15, fontWeight: "500", color: "#9CA3AF" },
  goalPill: {
    backgroundColor: "rgba(43,182,166,0.12)", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginTop: 4,
  },
  goalText: { fontSize: 13, fontWeight: "700", color: TEAL },
  bio: { fontSize: 14, color: "#6B7280", textAlign: "center", paddingHorizontal: 24, lineHeight: 20 },
  followBtn: {
    marginTop: 8, paddingHorizontal: 32, paddingVertical: 12,
    borderRadius: 24, borderWidth: 2, borderColor: TEAL, minWidth: 120, alignItems: "center",
  },
  followBtnActive: { backgroundColor: TEAL },
  followBtnText: { fontSize: 15, fontWeight: "700", color: TEAL },
  followBtnTextActive: { color: WHITE },
  privateCard: {
    backgroundColor: WHITE, borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    padding: 24, alignItems: "center", gap: 8, marginTop: 8,
  },
  privateEmoji: { fontSize: 32 },
  privateText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  emptyState: { alignItems: "center", paddingVertical: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
});
