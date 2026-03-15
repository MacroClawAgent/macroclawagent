import React, { useEffect, useRef } from "react";
import {
  FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { Screen } from "@/components/ui/Screen";
import { AgentStatusHeader } from "@/components/features/agent/AgentStatusHeader";
import { MacroMiniCard } from "@/components/features/agent/MacroMiniCard";
import { ChatBubble } from "@/components/features/agent/ChatBubble";
import { PromptChip } from "@/components/features/agent/PromptChip";
import { useTheme } from "@/context/ThemeContext";
import { useAgentViewModel } from "@/lib/viewModels/useAgentViewModel";

export default function AgentScreen() {
  const { colors } = useTheme();
  const vm = useAgentViewModel();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (vm.messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [vm.messages.length]);

  const showPrompts = vm.messages.length <= 1 && !vm.sending && !vm.loading;

  return (
    <Screen edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <AgentStatusHeader />

        <View style={styles.macroRow}>
          <MacroMiniCard label="Calories" consumed={vm.macroContext.calories} target={vm.macroContext.caloriesTarget} unit="kcal" color={colors.macroCalories} />
          <MacroMiniCard label="Protein" consumed={vm.macroContext.protein} target={vm.macroContext.proteinTarget} unit="g" color={colors.macroProtein} />
        </View>

        <FlatList
          ref={listRef}
          data={vm.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
          ListFooterComponent={vm.sending ? <ChatBubble role="assistant" content="…" /> : null}
        />

        {showPrompts ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prompts}>
            {vm.suggestedPrompts.map((p) => (
              <PromptChip key={p} label={p} onPress={() => vm.setInput(p)} />
            ))}
          </ScrollView>
        ) : null}

        <View style={[styles.inputRow, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Ask Jonno about nutrition…"
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
            style={[styles.sendBtn, { backgroundColor: vm.input.trim() && !vm.sending ? colors.teal : colors.border }]}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  macroRow: { flexDirection: "row", gap: 10, paddingHorizontal: 20, paddingBottom: 12 },
  messages: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  prompts: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
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
