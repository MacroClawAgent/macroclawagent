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
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import type { CommunityPost } from '@/types/community';
import { getPostImage } from '@/data/communityMockData';
import { useTheme } from '@/context/ThemeContext';

const TEAL = '#2DD4BF';

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

function postTypeLabel(postType: CommunityPost['postType']): string {
  switch (postType) {
    case 'eating_out': return '🍽️ Eating out';
    case 'meal_prep':  return '📦 Meal prep';
    default:           return '🏠 Home cooked';
  }
}

interface Props {
  post: CommunityPost;
  onLike: (id: string) => void;
  isOwn?: boolean;
  onDelete?: () => void;
}

export function CommunityPostCard({ post, onLike, isOwn, onDelete }: Props) {
  const likeScale = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const { isDark } = useTheme();

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

  return (
    <View style={[s.card, isDark && { backgroundColor: '#1C1410', borderColor: 'rgba(255,220,150,0.12)', shadowColor: '#000' }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.push(`/profile/${post.userId}` as any)} activeOpacity={0.7}>
          <View style={[s.avatar, isDark && { backgroundColor: '#E07B54' }]}>
            <Text style={s.avatarText}>{post.userInitial}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={s.meta} onPress={() => router.push(`/profile/${post.userId}` as any)} activeOpacity={0.7}>
          <View style={s.nameRow}>
            <Text style={[s.name, isDark && { color: '#E8E0D0' }]}>{post.userName}</Text>
            {post.goalHit && (
              <View style={[s.goalPill, isDark && { backgroundColor: 'rgba(139,158,110,0.15)', borderColor: 'rgba(139,158,110,0.3)' }]}>
                <Text style={[s.goalPillText, isDark && { color: '#8B9E6E' }]}>✓ Goal hit</Text>
              </View>
            )}
          </View>
          <View style={s.metaRow}>
            <Text style={[s.timeAgo, isDark && { color: 'rgba(232,224,208,0.4)' }]}>{post.timeAgo}</Text>
            <View style={[s.typeBadge, isDark && { backgroundColor: 'rgba(255,220,150,0.08)' }]}>
              <Text style={[s.typeBadgeText, isDark && { color: 'rgba(232,224,208,0.55)' }]}>{postTypeLabel(post.postType)}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {isOwn && onDelete && (
          <TouchableOpacity style={s.menuBtn} onPress={onDelete} activeOpacity={0.7}>
            <Text style={[s.menuDots, isDark && { color: 'rgba(232,224,208,0.4)' }]}>···</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      {(() => {
        const localImg = getPostImage(post.id);
        const restaurantPill = post.postType === 'eating_out' && post.restaurantName ? (
          <View style={s.restaurantPill}>
            <Text style={s.restaurantText}>{post.restaurantName}</Text>
          </View>
        ) : null;
        if (localImg) {
          return (
            <View style={s.imageContainer}>
              <Image source={localImg} style={s.image} resizeMode="cover" />
              {restaurantPill}
            </View>
          );
        }
        if (post.imageUri) {
          return (
            <View style={s.imageContainer}>
              <Image source={{ uri: post.imageUri }} style={s.image} resizeMode="cover" />
              {restaurantPill}
            </View>
          );
        }
        return (
          <LinearGradient colors={imageGradient(post)} style={s.imagePlaceholder}>
            <Text style={s.imageEmoji}>{mealEmoji(post)}</Text>
            {restaurantPill}
          </LinearGradient>
        );
      })()}

      {/* Caption */}
      <Text style={[s.caption, isDark && { color: 'rgba(232,224,208,0.8)' }]}>{post.caption}</Text>

      {/* Nutrition strip */}
      <View style={s.nutritionStrip}>
        {[
          { label: 'Cal',     value: String(post.nutrition.calories), color: isDark ? '#E8E0D0' : '#1E293B' },
          { label: 'Protein', value: `${post.nutrition.protein}g`,    color: isDark ? '#E07B54' : TEAL },
          { label: 'Carbs',   value: `${post.nutrition.carbs}g`,      color: isDark ? '#F5C842' : '#94A3B8' },
          { label: 'Fat',     value: `${post.nutrition.fat}g`,        color: isDark ? '#8B9E6E' : '#94A3B8' },
        ].map((m) => (
          <View key={m.label} style={[s.nutritionPill, isDark && { backgroundColor: 'rgba(255,220,150,0.06)', borderColor: 'rgba(255,220,150,0.1)' }]}>
            <Text style={[s.nutritionVal, { color: m.color }]}>{m.value}</Text>
            <Text style={[s.nutritionLabel, isDark && { color: 'rgba(232,224,208,0.4)' }]}>{m.label}</Text>
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
            <View key={ing} style={[s.chip, isDark && { backgroundColor: 'rgba(255,220,150,0.06)', borderColor: 'rgba(255,220,150,0.12)' }]}>
              <Text style={[s.chipText, isDark && { color: 'rgba(232,224,208,0.7)' }]}>{ing}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Action row */}
      <View style={[s.actionRow, isDark && { borderTopColor: 'rgba(255,220,150,0.08)' }]}>
        {/* Like */}
        <TouchableOpacity style={s.actionBtn} onPress={handleLike} activeOpacity={0.75}>
          <Animated.Text style={[s.likeIcon, post.hasLiked && s.likeIconActive, { transform: [{ scale: likeScale }] }]}>
            ♥
          </Animated.Text>
          <Text style={[s.actionCount, isDark && { color: 'rgba(232,224,208,0.4)' }, post.hasLiked && { color: '#F43F5E' }]}>{post.likes}</Text>
        </TouchableOpacity>

        {/* Cart — any post that has ingredients */}
        {post.ingredients && post.ingredients.length > 0 && (
          <TouchableOpacity style={[s.cartBtn, isDark && { backgroundColor: '#F5C842', shadowColor: '#F5C842' }]} onPress={handleAddToCart} activeOpacity={0.8}>
            <Text style={[s.cartBtnText, isDark && { color: '#1C1410' }]}>🛒 Add to Cart</Text>
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
    shadowColor: '#B0C4D8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: TEAL },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  meta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  goalPill: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  goalPillText: { fontSize: 10, fontWeight: '600', color: '#16A34A' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  timeAgo: { fontSize: 12, color: '#94A3B8' },
  typeBadge: { backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { fontSize: 11, fontWeight: '500', color: '#64748B' },
  menuBtn: { padding: 6 },
  menuDots: { fontSize: 18, color: '#94A3B8', letterSpacing: 1 },

  // Image
  imageContainer: { height: 200, width: '100%' },
  image: { height: 200, width: '100%' },
  imagePlaceholder: { height: 200, width: '100%', alignItems: 'center', justifyContent: 'center' },
  imageEmoji: { fontSize: 64 },
  restaurantPill: {
    position: 'absolute', bottom: 10, left: 14,
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  restaurantText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Caption
  caption: { fontSize: 14, color: '#374151', lineHeight: 20, paddingHorizontal: 16, paddingTop: 12 },

  // Nutrition strip
  nutritionStrip: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  nutritionPill: {
    flex: 1, alignItems: 'center',
    backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  nutritionVal: { fontSize: 14, fontWeight: '700' },
  nutritionLabel: { fontSize: 10, color: '#94A3B8', marginTop: 1 },

  // Ingredient chips
  chipsRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
  chip: {
    backgroundColor: '#F8FAFC', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  chipText: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  // Actions
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.06)',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  likeIcon: { fontSize: 20, color: '#CBD5E1' },
  likeIconActive: { color: '#F43F5E' },
  actionCount: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  cartBtn: {
    marginLeft: 'auto' as const,
    backgroundColor: '#3B6FD4',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#3B6FD4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cartBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
