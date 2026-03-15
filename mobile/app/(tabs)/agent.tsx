import React, { useEffect, useRef } from "react";
import {
  FlatList, KeyboardAvoidingView, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Screen } from "@/components/ui/Screen";
import { AgentStatusHeader } from "@/components/features/agent/AgentStatusHeader";
import { ChatBubble } from "@/components/features/agent/ChatBubble";
import { PromptChip } from "@/components/features/agent/PromptChip";
import { SmartCartCTACard } from "@/components/features/agent/SmartCartCTACard";
import { useTheme } from "@/context/ThemeContext";
import { useAgentViewModel } from "@/lib/viewModels/useAgentViewModel";
import type { AgentMessage } from "@/lib/viewModels/useAgentViewModel";

const TEAL = "#20C7B7";

export default function AgentScreen() {
  const { colors } = useTheme();
  const vm = useAgentViewModel();
  const listRef = useRef<FlatList<AgentMessage>>(null);

  useEffect(() => {
    if (vm.messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [vm.messages.length]);

  const isFresh = vm.messages.length <= 1 && !vm.sending && !vm.loading;

  // Compact stat chips shown in the teal header zone
  const proteinPct = vm.macroContext.proteinTarget > 0
    ? Math.round((vm.macroContext.protein / vm.macroContext.proteinTarget) * 100)
    : 0;
  const calPct = vm.macroContext.caloriesTarget > 0
    ? Math.round((vm.macroContext.calories / vm.macroContext.caloriesTarget) * 100)
    : 0;

  return (
    <Screen style={{ backgroundColor: TEAL }} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
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
            renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
            ListFooterComponent={
              <>
                {vm.sending && <ChatBubble role="assistant" content="…" />}
                {/* Prompt chips — shown only when conversation is fresh, inside the list */}
                {isFresh && (
                  <View style={styles.chipGrid}>
                    {vm.suggestedPrompts.map((p) => (
                      <PromptChip key={p} label={p} onPress={() => vm.setInput(p)} />
                    ))}
                  </View>
                )}
                {/* Smart Cart CTA */}
                {vm.pendingSmartCartAction && (
                  <SmartCartCTACard
                    onConfirm={vm.confirmSmartCart}
                    onDismiss={vm.dismissSmartCart}
                  />
                )}
              </>
            }
          />

          {/* Input row */}
          <View style={[styles.inputRow, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
              placeholder="Ask Jonno…"
              placeholderTextColor={colors.textMuted}
              value={vm.input}
              onChangeText={vm.setInput}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={vm.send}
            />
            <TouchableOpacity
              onPress={vm.send}
              disabled={!vm.input.trim() || vm.sending}
              activeOpacity={0.8}
              style={[styles.sendBtn, { backgroundColor: vm.input.trim() && !vm.sending ? TEAL : colors.border }]}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

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
  messages: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },

  // Chip grid (below welcome message, inside FlatList footer)
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 4,
  },

  // Input row
  inputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, maxHeight: 120,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  sendIcon: { color: "#FFF", fontSize: 18, fontWeight: "700" },
});
