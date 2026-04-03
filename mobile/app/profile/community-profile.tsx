import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { deletePost, deletePostWithFoodLog } from "@/services/communityService";
import { getFollowing, getFollowers, unfollowUser, blockUser } from "@/services/profileService";
import { apiPost } from "@/lib/api";
import type { CommunityPost } from "@/types/community";

const BG = "#1C1612"; const CARD = "#252018"; const BORDER = "rgba(255,220,150,0.12)";
const GOLD = "#F5C842"; const CORAL = "#E07B54"; const SAGE = "#8B9E6E";
const TEXT_C = "#E8E0D0"; const MUTED = "rgba(232,224,208,0.5)"; const DIM = "rgba(232,224,208,0.25)";

interface UserRow { id: string; full_name: string; username?: string; avatar_url?: string; }

export default function CommunityProfileScreen() {
  const { userProfile, refreshProfile } = useAuth();
  const { posts, currentUserId, loadPosts, removePost } = useCommunity();

  const [bio, setBio] = useState(userProfile?.bio ?? "");
  const [isPublic, setIsPublic] = useState(userProfile?.is_public ?? true);
  const [saving, setSaving] = useState(false);

  // Following / Followers
  const [following, setFollowing] = useState<UserRow[]>([]);
  const [followers, setFollowers] = useState<UserRow[]>([]);
  const [activeList, setActiveList] = useState<"following" | "followers" | null>(null);

  useEffect(() => { loadPosts(); loadSocial(); }, []);

  async function loadSocial() {
    try {
      const [f1, f2] = await Promise.all([getFollowing(), getFollowers()]);
      setFollowing(f1); setFollowers(f2);
    } catch {}
  }

  const myPosts = posts.filter(p => p.userId === currentUserId);
  const totalLikes = myPosts.reduce((sum, p) => sum + p.likes, 0);

  function handleDeletePost(post: CommunityPost) {
    const logDate = post.createdAt.split("T")[0];
    Alert.alert("Delete post", "Also delete from food log?", [
      { text: "Cancel", style: "cancel" },
      { text: "Post only", onPress: async () => { await deletePost(post.id); removePost(post.id); } },
      { text: "Post + log", style: "destructive", onPress: async () => { await deletePostWithFoodLog(post.id, post.mealName, logDate); removePost(post.id); } },
    ]);
  }

  async function handleUnfollow(userId: string) {
    Alert.alert("Unfollow", "Stop following this user?", [
      { text: "Cancel", style: "cancel" },
      { text: "Unfollow", style: "destructive", onPress: async () => {
        await unfollowUser(userId);
        setFollowing(prev => prev.filter(u => u.id !== userId));
      }},
    ]);
  }

  async function handleBlock(userId: string, name: string) {
    Alert.alert("Block", `Block ${name}? They won't be able to see your posts.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Block", style: "destructive", onPress: async () => {
        await blockUser(userId);
        setFollowers(prev => prev.filter(u => u.id !== userId));
        setFollowing(prev => prev.filter(u => u.id !== userId));
      }},
    ]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await apiPost("/api/profile/update", { bio: bio.trim() || undefined, is_public: isPublic });
      await refreshProfile();
      Alert.alert("Saved", "Profile updated.");
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Something went wrong.");
    } finally { setSaving(false); }
  }

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <AppHeader title="Community Profile" showBack />
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Stats row */}
        <View style={s.statsCard}>
          <TouchableOpacity style={s.statCell} onPress={() => setActiveList(null)}>
            <Text style={s.statVal}>{myPosts.length}</Text>
            <Text style={s.statLbl}>Posts</Text>
          </TouchableOpacity>
          <View style={s.statDivider} />
          <TouchableOpacity style={s.statCell} onPress={() => setActiveList("followers")}>
            <Text style={s.statVal}>{followers.length}</Text>
            <Text style={s.statLbl}>Followers</Text>
          </TouchableOpacity>
          <View style={s.statDivider} />
          <TouchableOpacity style={s.statCell} onPress={() => setActiveList("following")}>
            <Text style={s.statVal}>{following.length}</Text>
            <Text style={s.statLbl}>Following</Text>
          </TouchableOpacity>
          <View style={s.statDivider} />
          <View style={s.statCell}>
            <Text style={s.statVal}>{totalLikes}</Text>
            <Text style={s.statLbl}>Likes</Text>
          </View>
        </View>

        {/* Following / Followers list */}
        {activeList && (
          <View style={s.listCard}>
            <View style={s.listHeader}>
              <Text style={s.listTitle}>{activeList === "following" ? "Following" : "Followers"}</Text>
              <TouchableOpacity onPress={() => setActiveList(null)}>
                <Ionicons name="close" size={18} color={MUTED} />
              </TouchableOpacity>
            </View>
            {(activeList === "following" ? following : followers).length === 0 ? (
              <Text style={s.listEmpty}>No {activeList} yet</Text>
            ) : (
              (activeList === "following" ? following : followers).map(user => (
                <View key={user.id} style={s.userRow}>
                  <View style={s.userAvatar}>
                    <Text style={s.userInitial}>{(user.full_name?.[0] ?? "U").toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.userName}>{user.full_name ?? "User"}</Text>
                    {user.username && <Text style={s.userHandle}>@{user.username}</Text>}
                  </View>
                  {activeList === "following" ? (
                    <TouchableOpacity style={s.unfollowBtn} onPress={() => handleUnfollow(user.id)} activeOpacity={0.7}>
                      <Text style={s.unfollowTxt}>Unfollow</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={s.blockBtn} onPress={() => handleBlock(user.id, user.full_name ?? "User")} activeOpacity={0.7}>
                      <Ionicons name="ban-outline" size={14} color={CORAL} />
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Bio */}
        <Text style={s.sectionLabel}>Bio</Text>
        <View style={s.card}>
          <TextInput
            style={s.bioInput}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community about yourself..."
            placeholderTextColor={DIM}
            multiline
            maxLength={150}
          />
          <Text style={s.charCount}>{bio.length}/150</Text>
        </View>

        {/* Privacy */}
        <Text style={[s.sectionLabel, { marginTop: 16 }]}>Privacy</Text>
        <View style={s.card}>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.switchLabel}>Public profile</Text>
              <Text style={s.switchSub}>{isPublic ? "Visible to the community" : "Only you can see your posts"}</Text>
            </View>
            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: DIM, true: "rgba(245,200,66,0.4)" }} thumbColor={GOLD} />
          </View>
        </View>

        <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={BG} /> : <Text style={s.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>

        {/* My Posts */}
        <Text style={[s.sectionLabel, { marginTop: 24 }]}>My Posts</Text>
        {myPosts.length === 0 ? (
          <View style={s.emptyPosts}>
            <Ionicons name="images-outline" size={32} color={DIM} />
            <Text style={s.emptyText}>No posts yet</Text>
          </View>
        ) : myPosts.map(post => (
          <View key={post.id} style={s.postCard}>
            <View style={{ flex: 1 }}>
              <Text style={s.postName} numberOfLines={1}>{post.mealName}</Text>
              <Text style={s.postMeta}>{post.timeAgo} · {post.nutrition.calories} kcal · {post.likes} likes</Text>
            </View>
            <TouchableOpacity onPress={() => handleDeletePost(post)} activeOpacity={0.7} style={{ padding: 8 }}>
              <Ionicons name="trash-outline" size={16} color={CORAL} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 16, paddingBottom: 60 },

  statsCard: { flexDirection: "row", backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, paddingVertical: 16, marginBottom: 16 },
  statCell: { flex: 1, alignItems: "center", gap: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(232,224,208,0.06)" },
  statVal: { fontSize: 20, fontWeight: "800", color: TEXT_C },
  statLbl: { fontSize: 10, fontWeight: "600", color: DIM, textTransform: "uppercase", letterSpacing: 0.3 },

  listCard: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 14, marginBottom: 16, gap: 10 },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  listTitle: { fontSize: 15, fontWeight: "700", color: TEXT_C },
  listEmpty: { fontSize: 13, color: DIM, textAlign: "center", paddingVertical: 12 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(245,200,66,0.12)", alignItems: "center", justifyContent: "center" },
  userInitial: { fontSize: 15, fontWeight: "700", color: GOLD },
  userName: { fontSize: 14, fontWeight: "600", color: TEXT_C },
  userHandle: { fontSize: 12, color: DIM },
  unfollowBtn: { borderWidth: 1, borderColor: "rgba(232,224,208,0.15)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  unfollowTxt: { fontSize: 12, fontWeight: "600", color: MUTED },
  blockBtn: { padding: 8 },

  sectionLabel: { fontSize: 11, fontWeight: "700", color: DIM, textTransform: "uppercase", letterSpacing: 0.6, paddingLeft: 4, marginBottom: 6 },
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER },
  bioInput: { paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: TEXT_C, minHeight: 80, textAlignVertical: "top" },
  charCount: { textAlign: "right", paddingRight: 12, paddingBottom: 8, fontSize: 11, color: DIM },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  switchLabel: { fontSize: 15, fontWeight: "700", color: TEXT_C },
  switchSub: { fontSize: 12, color: DIM, marginTop: 2 },
  saveBtn: { backgroundColor: GOLD, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 16 },
  saveBtnText: { color: BG, fontWeight: "800", fontSize: 16 },

  emptyPosts: { alignItems: "center", paddingVertical: 24, gap: 6 },
  emptyText: { fontSize: 14, color: DIM },
  postCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CARD, borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: BORDER },
  postName: { fontSize: 14, fontWeight: "700", color: TEXT_C },
  postMeta: { fontSize: 11, color: DIM, marginTop: 2 },
});
