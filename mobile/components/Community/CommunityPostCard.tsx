import React, { useRef } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import type { CommunityPost, UserGoal } from '@/types/community';
import { getPostImage } from '@/data/communityMockData';

const BLUE = '#3B6FD4';

function goalGradient(goal: UserGoal): [string, string] {
  switch (goal) {
    case 'build_muscle':  return ['#6EE7B7', '#22C55E'];
    case 'fat_loss':      return ['#FCA5A5', '#EF4444'];
    case 'performance':   return ['#FDE68A', '#F59E0B'];
    default:              return ['#93C5FD', '#3B82F6'];
  }
}

function mealEmoji(post: CommunityPost): string {
  if (post.postType === 'eating_out') return '🍽️';
  if (post.postType === 'meal_prep') return '📦';
  const text = [...(post.ingredients ?? []), post.mealName].join(' ').toLowerCase();
  if (text.includes('chicken')) return '🍗';
  if (text.includes('salmon') || text.includes('tuna') || text.includes('fish')) return '🐟';
  if (text.includes('egg')) return '🥚';
  if (text.includes('oat')) return '🥣';
  if (text.includes('rice')) return '🍚';
  return '🥗';
}

function imageGradient(post: CommunityPost): [string, string, string] {
  switch (post.postType) {
    case 'eating_out':  return ['#DBEAFE', '#93C5FD', '#60A5FA'];
    case 'meal_prep':   return ['#EDE9FE', '#C4B5FD', '#A78BFA'];
    default:            return ['#D1FAE5', '#6EE7B7', '#34D399'];
  }
}

function postTypeBadge(postType: CommunityPost['postType']): { label: string; bg: string; color: string } {
  switch (postType) {
    case 'eating_out': return { label: '🍽️ Eating out', bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' };
    case 'meal_prep':  return { label: '📦 Meal prep',  bg: 'rgba(139,92,246,0.1)',  color: '#8B5CF6' };
    default:           return { label: '🏠 Home cooked', bg: 'rgba(34,197,94,0.1)',  color: '#22C55E' };
  }
}

interface Props {
  post: CommunityPost;
  onLike: (id: string) => void;
}

export function CommunityPostCard({ post, onLike }: Props) {
  const likeScale = useRef(new Animated.Value(1)).current;

  function handleLike() {
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.35, useNativeDriver: true, speed: 30 }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    onLike(post.id);
  }

  function handleAddToCart() {
    // TODO: pass ingredients to smart cart store
    Toast.show({ type: 'success', text1: 'Ingredients added to Smart Cart 🛒', visibilityTime: 2000 });
  }

  const badge = postTypeBadge(post.postType);
  const [g1, g2] = goalGradient(post.userGoal);

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <LinearGradient colors={[g1, g2]} style={s.avatar}>
          <Text style={s.avatarText}>{post.userInitial}</Text>
        </LinearGradient>
        <View style={s.meta}>
          <Text style={s.name}>{post.userName}</Text>
          <View style={s.metaRow}>
            <Text style={s.timeAgo}>{post.timeAgo}</Text>
            <View style={[s.typeBadge, { backgroundColor: badge.bg }]}>
              <Text style={[s.typeBadgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={s.menuBtn} activeOpacity={0.7}>
          <Text style={s.menuDots}>···</Text>
        </TouchableOpacity>
      </View>

      {/* Goal hit banner */}
      {post.goalHit && (
        <View style={s.goalBanner}>
          <Text style={s.goalBannerText}>✅ Goal hit today</Text>
        </View>
      )}

      {/* Image */}
      {(() => {
        const localImg = getPostImage(post.id);
        return localImg ? (
          <View style={s.imageContainer}>
            <Image source={localImg} style={s.image} resizeMode="cover" />
            {post.postType === 'eating_out' && post.restaurantName && (
              <View style={s.restaurantPill}>
                <Text style={s.restaurantText}>{post.restaurantName}</Text>
              </View>
            )}
          </View>
        ) : (
          <LinearGradient colors={imageGradient(post)} style={s.imagePlaceholder}>
            <Text style={s.imageEmoji}>{mealEmoji(post)}</Text>
            {post.postType === 'eating_out' && post.restaurantName && (
              <View style={s.restaurantPill}>
                <Text style={s.restaurantText}>{post.restaurantName}</Text>
              </View>
            )}
          </LinearGradient>
        );
      })()}

      {/* Caption */}
      <Text style={s.caption}>{post.caption}</Text>

      {/* Nutrition strip */}
      <View style={s.nutritionStrip}>
        {[
          { label: 'Cal',     value: String(post.nutrition.calories), color: '#1E293B' },
          { label: 'Protein', value: `${post.nutrition.protein}g`,    color: '#22C55E' },
          { label: 'Carbs',   value: `${post.nutrition.carbs}g`,      color: '#F59E0B' },
          { label: 'Fat',     value: `${post.nutrition.fat}g`,        color: '#8B5CF6' },
        ].map((m) => (
          <View key={m.label} style={s.nutritionPill}>
            <Text style={[s.nutritionVal, { color: m.color }]}>{m.value}</Text>
            <Text style={s.nutritionLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Ingredient chips */}
      {post.postType !== 'eating_out' && post.ingredients && post.ingredients.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
        >
          {post.ingredients.map((ing) => (
            <View key={ing} style={s.chip}>
              <Text style={s.chipText}>{ing}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Action row */}
      <View style={s.actionRow}>
        {/* Like */}
        <TouchableOpacity style={s.actionBtn} onPress={handleLike} activeOpacity={0.75}>
          <Animated.Text style={[s.actionIcon, { transform: [{ scale: likeScale }] }]}>
            {post.hasLiked ? '❤️' : '🤍'}
          </Animated.Text>
          <Text style={[s.actionCount, post.hasLiked && { color: '#EF4444' }]}>{post.likes}</Text>
        </TouchableOpacity>

        {/* Cart — only for home cooked / meal prep with ingredients */}
        {post.postType !== 'eating_out' && post.ingredients && post.ingredients.length > 0 && (
          <TouchableOpacity style={[s.smartBtn, s.cartBtn]} onPress={handleAddToCart} activeOpacity={0.75}>
            <Text style={[s.smartBtnText, { color: BLUE }]}>🛒 Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#A0C0D8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  meta: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  timeAgo: { fontSize: 12, color: '#94A3B8' },
  typeBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { fontSize: 11, fontWeight: '600' },
  menuBtn: { padding: 6 },
  menuDots: { fontSize: 18, color: '#94A3B8', letterSpacing: 1 },

  // Goal banner
  goalBanner: { backgroundColor: 'rgba(34,197,94,0.1)', paddingVertical: 6, paddingHorizontal: 16 },
  goalBannerText: { fontSize: 12, fontWeight: '500', color: '#16A34A' },

  // Image
  imageContainer: { height: 200, width: '100%' },
  image: { height: 200, width: '100%' },
  imagePlaceholder: {
    height: 200,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEmoji: { fontSize: 64 },
  restaurantPill: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  restaurantText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Caption
  caption: { fontSize: 14, color: '#374151', lineHeight: 20, paddingHorizontal: 16, paddingTop: 12 },

  // Nutrition strip
  nutritionStrip: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  nutritionPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  nutritionVal: { fontSize: 14, fontWeight: '700' },
  nutritionLabel: { fontSize: 10, color: '#94A3B8', marginTop: 1 },

  // Ingredient chips
  chipsRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
  chip: {
    backgroundColor: 'rgba(45,212,191,0.08)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.2)',
  },
  chipText: { fontSize: 12, color: '#2DD4BF', fontWeight: '500' },

  // Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 18 },
  actionCount: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  smartBtn: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    marginLeft: 'auto' as const,
  },
  cartBtn: {
    backgroundColor: 'rgba(59,111,212,0.1)',
    borderColor: 'rgba(59,111,212,0.3)',
  },
  smartBtnText: { fontSize: 13, fontWeight: '600' },
});
