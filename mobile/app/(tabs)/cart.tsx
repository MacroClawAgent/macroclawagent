import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { MacroGoalCard } from "@/components/features/cart/MacroGoalCard";
import { MealOptionCard } from "@/components/features/cart/MealOptionCard";
import { CartCTAButton } from "@/components/features/cart/CartCTAButton";
import { MacroMatchedBadge } from "@/components/features/cart/MacroMatchedBadge";
import { useTheme } from "@/context/ThemeContext";
import { useCartViewModel } from "@/lib/viewModels/useCartViewModel";

const DAY_LABELS = ["Today", "Mon", "Tue", "Wed", "Thu", "Fri", "Sun"];

export default function CartScreen() {
  const { colors } = useTheme();
  const vm = useCartViewModel();

  if (vm.loading) {
    return (
      <Screen>
        <AppHeader title="Smart Cart" showAvatar />
        <View style={styles.centered}>
          <ActivityIndicator color={colors.teal} size="large" />
        </View>
      </Screen>
    );
  }

  if (!vm.plan) {
    return (
      <Screen>
        <AppHeader title="Smart Cart" showAvatar />
        <View style={styles.centered}>
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>✦</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No plan yet</Text>
            <Text style={[styles.emptyBody, { color: colors.textMuted }]}>
              Let Jonno build a personalised 7-day meal plan based on your training load and macro targets.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={vm.generatePlan}
              disabled={vm.generating}
              style={[styles.generateBtn, { backgroundColor: colors.teal }]}
            >
              {vm.generating ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.generateBtnLabel}>Build my plan ✦</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <AppHeader
        title="Smart Cart"
        showAvatar
        rightElement={<MacroMatchedBadge />}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={vm.refreshing}
            onRefresh={vm.refresh}
            tintColor={colors.teal}
          />
        }
      >
        {/* Macro goal */}
        <MacroGoalCard
          label={vm.macroGoal.label}
          consumed={vm.macroGoal.consumed}
          target={vm.macroGoal.target}
          ratio={vm.macroGoal.ratio}
        />

        {/* Day picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayPicker}
        >
          {DAY_LABELS.map((label, i) => (
            <TouchableOpacity
              key={label}
              onPress={() => vm.setSelectedDay(i)}
              activeOpacity={0.75}
              style={[
                styles.dayChip,
                {
                  backgroundColor:
                    vm.selectedDay === i ? colors.teal : colors.surface,
                  borderColor:
                    vm.selectedDay === i ? colors.teal : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayChipLabel,
                  {
                    color:
                      vm.selectedDay === i ? "#FFF" : colors.textSecondary,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meal cards */}
        {vm.mealOptions.length > 0 ? (
          vm.mealOptions.map((meal, i) => (
            <MealOptionCard
              key={i}
              name={meal.name}
              tag={meal.tag}
              kcal={meal.kcal}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              prepMin={meal.prepMin}
            />
          ))
        ) : (
          <View style={styles.noMeals}>
            <Text style={[styles.noMealsText, { color: colors.textMuted }]}>
              No meals planned for this day.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky CTA */}
      <CartCTAButton
        label="Order on Uber Eats"
        onPress={vm.openUberEats}
        secondary={{
          label: "View Grocery List",
          onPress: vm.openGroceryList,
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyEmoji: { fontSize: 32, marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptyBody: { fontSize: 14, fontWeight: "500", textAlign: "center", lineHeight: 20 },
  generateBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 100,
    minWidth: 160,
    alignItems: "center",
  },
  generateBtnLabel: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  scroll: { paddingTop: 4, gap: 12 },
  dayPicker: { paddingHorizontal: 20, gap: 8, paddingVertical: 4 },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  dayChipLabel: { fontSize: 13, fontWeight: "600" },
  noMeals: { paddingHorizontal: 20, paddingVertical: 12 },
  noMealsText: { fontSize: 14, fontWeight: "500", textAlign: "center" },
  bottomSpacer: { height: 8 },
});
