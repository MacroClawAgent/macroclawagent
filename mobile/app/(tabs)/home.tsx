import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useFocusEffect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Screen } from "@/components/ui/Screen";
import { AvatarButton } from "@/components/ui/AvatarButton";
import { InsightCard } from "@/components/features/home/InsightCard";
import { MealsEatenCard } from "@/components/features/home/MealsEatenCard";
import { NutritionWidget } from "@/components/features/home/NutritionWidget";
import { TodayActivitiesCard } from "@/components/features/home/TodayActivitiesCard";
import { WeekCalendarStrip } from "@/components/features/home/WeekCalendarStrip";
import { AppleHealthCard } from "@/components/features/home/AppleHealthCard";
import { useHealthKit } from "@/hooks/useHealthKit";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useHomeViewModel } from "@/lib/viewModels/useHomeViewModel";

const SCREEN_W = Dimensions.get("window").width;
const CARD_COUNT = 3;
const CAROUSEL_H = 350;

function useForYouStats(calorieProgress: { consumed: number; target: number }) {
  const [recipeCount, setRecipeCount] = useState(0);
  const [hasPlan, setHasPlan] = useState(false);
  const [unreadTips, setUnreadTips] = useState(3);

  useEffect(() => {
    AsyncStorage.getItem('jonno_meal_plan_history')
      .then(raw => { if (raw) setRecipeCount(JSON.parse(raw).length); })
      .catch(() => {});
    AsyncStorage.getItem('jonno_meal_plan')
      .then(raw => { if (raw) setHasPlan(true); })
      .catch(() => {});
    AsyncStorage.getItem('jonno_tip_reads')
      .then(raw => {
        const readCount = raw ? JSON.parse(raw).length : 0;
        setUnreadTips(Math.max(0, 5 - readCount));
      })
      .catch(() => {});
  }, []);

  const progressStat = calorieProgress.consumed > 0
    ? `${Math.round((calorieProgress.consumed / calorieProgress.target) * 100)}% of goal today`
    : 'Log meals to track';
  const recipeStat = recipeCount > 0 ? `${recipeCount} saved` : 'Try the Agent ✦';
  const planStat = hasPlan ? 'Plan ready to prep' : 'Generate a plan first';
  const tipsStat = unreadTips > 0 ? `${unreadTips} new tips` : 'Up to date';

  return { recipeStat, progressStat, planStat, tipsStat, hasPlan };
}

function SkeletonCard() {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.skeleton,
        { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "transparent" },
      ]}
    />
  );
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { userProfile } = useAuth();
  const router = useRouter();
  const vm = useHomeViewModel();
  const hk = useHealthKit();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef<ScrollView>(null);
  const forYou = useForYouStats(vm.calorieProgress);

  // Stagger animations for For You tiles
  const tileAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const [tilesVisible, setTilesVisible] = useState(false);
  useEffect(() => {
    if (!tilesVisible) return;
    tileAnims.forEach((a, i) => {
      Animated.timing(a, { toValue: 1, duration: 300, delay: i * 80, useNativeDriver: true }).start();
    });
  }, [tilesVisible]);

  // Refresh nutrition data every time the home tab comes into focus
  // (e.g. after returning from food log or photo confirm screens)
  useFocusEffect(
    useCallback(() => {
      vm.silentRefresh();
    }, [vm.silentRefresh])
  );

  return (
    <Screen style={{ backgroundColor: isDark ? "#0D0A07" : "#C8DFF0" }}>
      {/* Full-screen gradient backdrop */}
      <LinearGradient
        colors={isDark
          ? ['#000000', '#080603', '#120D08', '#1C1410', '#2E1A0A']
          : ['#E8F2F8', '#D4E7F3', '#C8DFF0']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />
      {/* Top header: greeting left, avatar + goal right */}
      <View style={styles.topHeader}>
        <View style={styles.greetingBlock}>
          <Text style={[styles.greetingWord, isDark && { color: 'rgba(232,224,208,0.55)' }]}>
            {vm.greeting}
          </Text>
          <Text style={[styles.greetingName, isDark && { color: '#E8E0D0' }]}>
            {vm.userName}
          </Text>
        </View>
        <AvatarButton
          name={userProfile?.full_name ?? ""}
          onPress={() => router.push("/profile")}
          size={44}
          color="#F5C842"
          textColor="#1C1410"
          style={{ borderWidth: 3, borderColor: '#F5C842' }}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.refresh}
            tintColor={isDark ? "#F5C842" : "#35C7B8"}
          />
        }
      >

        {/* 7-day week streak strip */}
        <WeekCalendarStrip
          weeklyCalories={vm.weeklyCalories}
          goals={{
            calories: vm.calorieProgress.target,
            protein: vm.macros.protein.target,
            carbs: vm.macros.carbs.target,
            fat: vm.macros.fat.target,
          }}
        />

        {/* AI Insight card */}
        <InsightCard insight={vm.jonnoInsight} />

        {/* Cards carousel: Nutrition → Activities → Meals */}
        <View>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setCarouselIdx(idx);
            }}
          >
            <View style={{ width: SCREEN_W, height: CAROUSEL_H }}>
              {vm.loading ? <SkeletonCard /> : (
                <NutritionWidget
                  calorieProgress={vm.calorieProgress}
                  macros={vm.macros}
                  goalLabel={vm.goalLabel}
                />
              )}
            </View>
            <View style={{ width: SCREEN_W, height: CAROUSEL_H }}>
              {vm.loading ? <SkeletonCard /> : (
                <TodayActivitiesCard activities={vm.todayActivities} />
              )}
            </View>
            <View style={{ width: SCREEN_W, height: CAROUSEL_H }}>
              <MealsEatenCard />
            </View>
          </ScrollView>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {Array.from({ length: CARD_COUNT }).map((_, i) => (
              <View key={i} style={[
                styles.dot,
                isDark && { backgroundColor: 'rgba(255,220,150,0.12)' },
                carouselIdx === i && styles.dotActive,
                carouselIdx === i && isDark && { backgroundColor: '#F5C842' },
              ]} />
            ))}
          </View>
        </View>

        {/* Apple Health standalone card */}
        <AppleHealthCard
          authorized={hk.authorized}
          loading={hk.loading}
          summary={hk.summary}
          error={hk.error}
        />

        {/* For You */}
        <View
          style={styles.forYouSection}
          onLayout={() => setTilesVisible(true)}
        >
          <Text style={styles.forYouHeading}>For You</Text>
          <Text style={styles.forYouSub}>Personalised to your goals</Text>

          <View style={styles.tileGrid}>
            {([
              { title: 'My Recipes', stat: forYou.recipeStat, statColor: '#E07B54', icon: 'restaurant-outline' as const, iconBg: 'rgba(224,123,84,0.15)', iconColor: '#E07B54', route: '/recipes' },
              { title: 'My Progress', stat: forYou.progressStat, statColor: '#F5C842', icon: 'trending-up-outline' as const, iconBg: 'rgba(248,213,97,0.12)', iconColor: '#F5C842', route: '/progress' },
              { title: 'Prep Guide', stat: forYou.planStat, statColor: forYou.hasPlan ? '#8B9E6E' : 'rgba(232,224,208,0.3)', icon: 'cube-outline' as const, iconBg: 'rgba(139,158,110,0.12)', iconColor: '#8B9E6E', route: '/prep-guide' },
              { title: 'Nutrition Tips', stat: forYou.tipsStat, statColor: '#F5C842', icon: 'bulb-outline' as const, iconBg: 'rgba(248,213,97,0.1)', iconColor: '#F5C842', route: '/nutrition-tips' },
            ] as const).map((tile, i) => (
              <Animated.View
                key={tile.title}
                style={[styles.tileWrap, {
                  opacity: tileAnims[i],
                  transform: [{ translateY: tileAnims[i].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
                }]}
              >
                <TouchableOpacity
                  style={styles.tile}
                  activeOpacity={0.75}
                  onPress={() => router.push(tile.route as any)}
                >
                  <View style={[styles.tileIcon, { backgroundColor: tile.iconBg }]}>
                    <Ionicons name={tile.icon} size={22} color={tile.iconColor} />
                  </View>
                  <View>
                    <Text style={[styles.tileStat, { color: tile.statColor }]}>{tile.stat}</Text>
                    <Text style={styles.tileTitle}>{tile.title}</Text>
                    <Text style={styles.tileArrow}>→</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 0,
    gap: 14,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  greetingBlock: {
    gap: 3,
    flex: 1,
  },
  greetingWord: {
    fontSize: 16,
    fontFamily: "BebasNeue_400Regular",
    letterSpacing: 1.5,
    color: "#6B7280",
  },
  greetingName: {
    fontSize: 42,
    fontFamily: "BebasNeue_400Regular",
    letterSpacing: 1,
    lineHeight: 44,
    color: "#111827",
  },

  skeleton: {
    height: 140,
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "rgba(255,255,255,0.6)",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#35C7B8",
    borderRadius: 3,
  },
  bottomSpacer: { height: 24 },

  forYouSection: { marginTop: 28 },
  forYouHeading: { fontSize: 20, fontWeight: '800', color: '#E8E0D0', marginLeft: 20 },
  forYouSub: { fontSize: 12, color: 'rgba(232,224,208,0.4)', marginLeft: 20, marginTop: 2, marginBottom: 14 },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginHorizontal: 16 },
  tileWrap: { width: (SCREEN_W - 32 - 12) / 2 },
  tile: {
    aspectRatio: 1,
    backgroundColor: '#252018',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(248,213,97,0.08)',
    padding: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  tileIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tileStat: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  tileTitle: { fontSize: 15, fontWeight: '700', color: '#E8E0D0' },
  tileArrow: { fontSize: 12, color: 'rgba(232,224,208,0.3)', marginTop: 2 },
});
