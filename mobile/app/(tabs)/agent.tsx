import React, { useRef } from "react";
import {
  FlatList, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { Screen } from "@/components/ui/Screen";
import { AgentStatusHeader } from "@/components/features/agent/AgentStatusHeader";
import { ChatBubble } from "@/components/features/agent/ChatBubble";
import { SmartCartCTACard } from "@/components/features/agent/SmartCartCTACard";
import { useTheme } from "@/context/ThemeContext";
import { useAgentViewModel } from "@/lib/viewModels/useAgentViewModel";
import type { AgentMessage } from "@/lib/viewModels/useAgentViewModel";

const TEAL = "#20C7B7";

// ── Inline ActionButton ───────────────────────────────────────────────────────

interface ActionButtonProps {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  accent?: boolean;
}

function ActionButton({ emoji, title, subtitle, onPress, disabled, accent }: ActionButtonProps) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[
        btnStyles.btn,
        {
          backgroundColor: accent ? colors.tealAlpha : colors.surface,
          borderColor: accent ? colors.teal : colors.border,
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      <Text style={btnStyles.emoji}>{emoji}</Text>
      <Text style={[btnStyles.title, { color: accent ? colors.teal : colors.textPrimary }]}>{title}</Text>
      <Text style={[btnStyles.sub, { color: colors.textMuted }]}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const btnStyles = StyleSheet.create({
  btn: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  emoji: { fontSize: 22 },
  title: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  sub: { fontSize: 11, fontWeight: "500", lineHeight: 15 },
});

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AgentScreen() {
  const { colors } = useTheme();
  const vm = useAgentViewModel();
  const listRef = useRef<FlatList<AgentMessage>>(null);

  const isFresh = vm.messages.length <= 1 && !vm.sending;

  const proteinPct = vm.macroContext.proteinTarget > 0
    ? Math.round((vm.macroContext.protein / vm.macroContext.proteinTarget) * 100)
    : 0;
  const calPct = vm.macroContext.caloriesTarget > 0
    ? Math.round((vm.macroContext.calories / vm.macroContext.caloriesTarget) * 100)
    : 0;

  // Initial action buttons — contextual
  const initialActions: ActionButtonProps[] = vm.activityContext
    ? [
        { emoji: "🥗", title: "Recovery fuel", subtitle: "Post-workout nutrition", onPress: () => vm.quickSend("What should I eat after training to recover?") },
        { emoji: "📅", title: "This week's plan", subtitle: "7-day meal structure", onPress: () => vm.quickSend("Create a meal plan for this week") },
        { emoji: "🥩", title: "High-protein day", subtitle: "Hit your targets", onPress: () => vm.quickSend("Build a high-protein meal plan for today") },
        { emoji: "🛒", title: "Make a Smart Cart", subtitle: "Build & shop now", onPress: () => vm.quickSend("Build today's meals and save to Smart Cart"), accent: true },
      ]
    : [
        { emoji: "🍽", title: "Build today's meals", subtitle: "Full day plan", onPress: () => vm.quickSend("Build a full meal plan for today") },
        { emoji: "📅", title: "This week's plan", subtitle: "7-day meal structure", onPress: () => vm.quickSend("Create a meal plan for this week") },
        { emoji: "🥩", title: "High-protein day", subtitle: "Hit your targets", onPress: () => vm.quickSend("Build a high-protein meal plan for today") },
        { emoji: "🛒", title: "Make a Smart Cart", subtitle: "Build & shop now", onPress: () => vm.quickSend("Build today's meals and save to Smart Cart"), accent: true },
      ];

  // Follow-up buttons after a reply
  const followUpActions: ActionButtonProps[] = [
    { emoji: "🔄", title: "Adjust it", subtitle: "Tweak the plan", onPress: () => vm.quickSend("Can you adjust that plan?") },
    { emoji: "🔀", title: "Different option", subtitle: "Try something else", onPress: () => vm.quickSend("Give me a completely different option") },
    { emoji: "🛒", title: "Build Smart Cart", subtitle: "Convert to a cart", onPress: () => vm.quickSend("Save this as a Smart Cart"), accent: true },
  ];

  return (
    <Screen style={{ backgroundColor: TEAL }} edges={["top"]}>
      {/* ── TEAL HEADER ZONE ── */}
      <AgentStatusHeader textColor="#FFF" dotColor="rgba(255,255,255,0.7)" />

      {/* Compact stats strip */}
      <View style={styles.statsStrip}>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Protein</Text>
          <Text style={styles.statValue}>{vm.macroContext.protein}/{vm.macroContext.proteinTarget}g</Text>
          <View style={styles.statBarTrack}>
            <View style={[styles.statBarFill, { width: `${Math.min(proteinPct, 100)}%`, backgroundColor: "#FFF" }]} />
          </View>
        </View>
        <View style={styles.statPill}>
          <Text style={styles.statLabel}>Calories</Text>
          <Text style={styles.statValue}>{vm.macroContext.calories}/{vm.macroContext.caloriesTarget}</Text>
          <View style={styles.statBarTrack}>
            <View style={[styles.statBarFill, { width: `${Math.min(calPct, 100)}%`, backgroundColor: "#FFF" }]} />
          </View>
        </View>
        {vm.activityContext && (
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>{vm.activityContext.type}</Text>
            <Text style={styles.statValue}>{vm.activityContext.kcal} kcal</Text>
            <Text style={styles.statSub}>{vm.activityContext.durationMin}min</Text>
          </View>
        )}
      </View>

      {/* ── WHITE CHAT ZONE ── */}
      <View style={[styles.chatZone, { backgroundColor: colors.bg }]}>
        <FlatList<AgentMessage>
          ref={listRef}
          data={vm.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
          ListFooterComponent={
            <>
              {vm.sending && <ChatBubble role="assistant" content="…" />}

              {/* Smart Cart CTA */}
              {vm.pendingSmartCartAction && (
                <SmartCartCTACard
                  onConfirm={vm.confirmSmartCart}
                  onDismiss={vm.dismissSmartCart}
                />
              )}

              {/* Initial action buttons — shown when fresh */}
              {isFresh && !vm.sending && (
                <View style={styles.actionSection}>
                  <Text style={[styles.actionLabel, { color: colors.textMuted }]}>What do you need?</Text>
                  <View style={styles.actionGrid}>
                    {initialActions.map((a) => (
                      <ActionButton key={a.title} {...a} disabled={vm.sending} />
                    ))}
                  </View>
                </View>
              )}

              {/* Follow-up buttons — shown after AI replies */}
              {vm.showFollowUps && !vm.pendingSmartCartAction && (
                <View style={styles.actionSection}>
                  <Text style={[styles.actionLabel, { color: colors.textMuted }]}>What's next?</Text>
                  <View style={styles.actionGrid}>
                    {followUpActions.map((a) => (
                      <ActionButton key={a.title} {...a} disabled={vm.sending} />
                    ))}
                  </View>
                </View>
              )}
            </>
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Stats strip (in teal zone)
  statsStrip: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },
  statPill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    padding: 12,
    gap: 3,
  },
  statLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 0.4 },
  statValue: { fontSize: 14, fontWeight: "800", color: "#FFF" },
  statSub: { fontSize: 11, fontWeight: "500", color: "rgba(255,255,255,0.7)" },
  statBarTrack: { height: 3, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.25)", marginTop: 4, overflow: "hidden" },
  statBarFill: { height: 3, borderRadius: 100 },

  // Chat zone
  chatZone: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  messages: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: Platform.OS === "ios" ? 36 : 20 },

  // Action buttons
  actionSection: {
    paddingHorizontal: 0,
    paddingTop: 16,
    gap: 10,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 2,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
