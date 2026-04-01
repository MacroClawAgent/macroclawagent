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
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  async function handleAddToCart() {
    const ingredients = post.ingredients ?? [];
    if (ingredients.length === 0) return;

    // Build consolidated ingredients for the cart
    const consolidated = ingredients.map((name, i) => ({
      id: `community-${post.id}-${i}`,
      name,
      totalQuantity: 0,
      unit: '',
      category: 'other' as const,
      isInPantry: false,
      estimatedPrice: 3,
      usedIn: [post.mealName],
    }));

    // Save as agent cart so useSmartCart picks it up
    const payload = {
      ingredients: consolidated,
      planType: 'single' as const,
      mealCount: 1,
      generatedAt: new Date().toISOString(),
      label: post.mealName,
    };
    await AsyncStorage.setItem('jonno_agent_cart', JSON.stringify(payload));

    // Also add to carts index
    const indexRaw = await AsyncStorage.getItem('jonno_carts_index');
    const existing = indexRaw ? JSON.parse(indexRaw) : [];
    const entry = {
      id: `community-${post.id}`,
      label: post.mealName,
      source: 'community' as const,
      ingredientCount: ingredients.length,
      estimatedTotal: ingredients.length * 3,
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem('jonno_carts_index', JSON.stringify([entry, ...existing].slice(0, 20)));

    Toast.show({ type: 'success', text1: `${post.mealName} added to Smart Cart`, visibilityTime: 2000 });
    router.push('/(tabs)/cart' as any);
  }

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.push(`/profile/${post.userId}` as any)} activeOpacity={0.7}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{post.userInitial}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={s.meta} onPress={() => router.push(`/profile/${post.userId}` as any)} activeOpacity={0.7}>
          <View style={s.nameRow}>
            <Text style={s.name}>{post.userName}</Text>
            {post.goalHit && (
              <View style={s.goalPill}>
                <Text style={s.goalPillText}>✓ Goal hit</Text>
              </View>
            )}
          </View>
          <View style={s.metaRow}>
            <Text style={s.timeAgo}>{post.timeAgo}</Text>
            <View style={s.typeBadge}>
              <Text style={s.typeBadgeText}>{postTypeLabel(post.postType)}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {isOwn && onDelete && (
          <TouchableOpacity style={s.menuBtn} onPress={onDelete} activeOpacity={0.7}>
            <Text style={s.menuDots}>···</Text>
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
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={s.imageOverlay}>
                <Text style={s.imageDishName} numberOfLines={1}>{post.mealName}</Text>
              </LinearGradient>
              {restaurantPill}
            </View>
          );
        }
        if (post.imageUri) {
          return (
            <View style={s.imageContainer}>
              <Image source={{ uri: post.imageUri }} style={s.image} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={s.imageOverlay}>
                <Text style={s.imageDishName} numberOfLines={1}>{post.mealName}</Text>
              </LinearGradient>
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
      <Text style={s.caption}>{post.caption}</Text>

      {/* Nutrition strip */}
      <View style={s.nutritionStrip}>
        {[
          { label: 'Cal',     value: String(post.nutrition.calories),                    color: '#E8E0D0' },
          { label: 'Protein', value: `${post.nutrition.protein}g`,                       color: '#E07B54' },
          { label: 'Carbs',   value: `${post.nutrition.carbs}g`,                         color: '#F5C842' },
          { label: 'Fat',     value: `${post.nutrition.fat}g`,                           color: '#8B9E6E' },
          ...(post.nutrition.fiber != null ? [{ label: 'Fiber', value: `${post.nutrition.fiber}g`, color: '#6EAF8B' }] : []),
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
          <Animated.Text style={[s.likeIcon, post.hasLiked && s.likeIconActive, { transform: [{ scale: likeScale }] }]}>
            ♥
          </Animated.Text>
          <Text style={[s.actionCount, post.hasLiked && { color: '#F43F5E' }]}>{post.likes}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={s.actionBtn} activeOpacity={0.75}>
          <Text style={s.actionIcon}>💬</Text>
          <Text style={s.actionCount}>{(post as any).comments ?? 0}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={s.actionBtn} activeOpacity={0.75}>
          <Text style={s.actionIcon}>↗</Text>
        </TouchableOpacity>

        {/* Cart — any post that has ingredients */}
        {post.ingredients && post.ingredients.length > 0 && (
          <TouchableOpacity style={s.cartBtn} onPress={handleAddToCart} activeOpacity={0.8}>
            <Text style={s.cartBtnText}>🛒</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#1C1410',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,220,150,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E07B54' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#1C1410' },
  meta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '600', color: '#E8E0D0' },
  goalPill: {
    backgroundColor: 'rgba(139,158,110,0.15)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(139,158,110,0.3)',
  },
  goalPillText: { fontSize: 10, fontWeight: '600', color: '#8B9E6E' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  timeAgo: { fontSize: 12, color: 'rgba(232,224,208,0.4)' },
  typeBadge: { backgroundColor: 'rgba(255,220,150,0.08)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  typeBadgeText: { fontSize: 11, fontWeight: '500', color: 'rgba(232,224,208,0.55)' },
  menuBtn: { padding: 6 },
  menuDots: { fontSize: 18, color: 'rgba(232,224,208,0.4)', letterSpacing: 1 },

  // Image
  imageContainer: { height: 200, width: '100%' },
  image: { height: 200, width: '100%' },
  imageOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 70, justifyContent: 'flex-end',
    paddingHorizontal: 14, paddingBottom: 10,
  },
  imageDishName: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', fontFamily: 'BebasNeue_400Regular', letterSpacing: 0.2 },
  imagePlaceholder: { height: 200, width: '100%', alignItems: 'center', justifyContent: 'center' },
  imageEmoji: { fontSize: 64 },
  restaurantPill: {
    position: 'absolute', bottom: 10, left: 14,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  restaurantText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Caption
  caption: { fontSize: 14, color: 'rgba(232,224,208,0.8)', lineHeight: 20, paddingHorizontal: 16, paddingTop: 12 },

  // Nutrition strip
  nutritionStrip: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  nutritionPill: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,220,150,0.06)', borderRadius: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,220,150,0.1)',
  },
  nutritionVal: { fontSize: 14, fontWeight: '700' },
  nutritionLabel: { fontSize: 10, color: 'rgba(232,224,208,0.4)', marginTop: 1 },

  // Ingredient chips
  chipsRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
  chip: {
    backgroundColor: 'rgba(255,220,150,0.06)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,220,150,0.12)',
  },
  chipText: { fontSize: 12, color: 'rgba(232,224,208,0.7)', fontWeight: '500' },

  // Actions
  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,220,150,0.08)',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionIcon: { fontSize: 15, color: 'rgba(232,224,208,0.4)' },
  likeIcon: { fontSize: 20, color: 'rgba(232,224,208,0.3)' },
  likeIconActive: { color: '#F43F5E' },
  actionCount: { fontSize: 14, color: 'rgba(232,224,208,0.4)', fontWeight: '500' },
  cartBtn: {
    marginLeft: 'auto' as const,
    backgroundColor: '#F5C842',
    borderRadius: 20,
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#F5C842',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  cartBtnText: { fontSize: 16 },
});
