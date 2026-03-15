import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/context/ThemeContext";
import { getCache } from "@/lib/cache";
import { apiGet } from "@/lib/api";

interface GroceryItem { name: string; qty: number; unit: string; category?: string; }

export default function GroceryListScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cached = getCache<any>("cart_plan", 6 * 60 * 60 * 1000);
        const plan = cached ?? await apiGet<any>("/api/optimizer/create");
        setItems(plan?.grocery_list ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleShare = async () => {
    const text = items.map(i => `• ${i.name} ${i.qty}${i.unit}`).join("\n");
    await Share.share({ message: `Grocery List\n\n${text}` });
  };

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Grocery List" showBack />
        <View style={styles.centered}><ActivityIndicator color={colors.teal} /></View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title="Grocery List" showBack />
      <FlatList
        data={items}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.item, { borderBottomColor: colors.border }]}>
            <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.name}</Text>
            <Text style={[styles.itemQty, { color: colors.textMuted }]}>{item.qty}{item.unit}</Text>
          </View>
        )}
        ListFooterComponent={
          items.length > 0 ? (
            <TouchableOpacity onPress={handleShare} style={[styles.shareBtn, { backgroundColor: colors.teal }]}>
              <Text style={styles.shareBtnText}>Share List</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No grocery list yet. Generate a plan first.</Text>
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemQty: { fontSize: 14, fontWeight: "500" },
  shareBtn: { marginTop: 24, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  shareBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  emptyText: { fontSize: 14, fontWeight: "500", textAlign: "center", lineHeight: 20 },
});
