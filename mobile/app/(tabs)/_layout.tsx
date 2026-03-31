import React, { useCallback, useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";

function TabIcon({
  iosName,
  androidName,
  color,
  size = 24,
}: {
  iosName: string;
  androidName: string;
  color: string;
  size?: number;
}) {
  return (
    <SymbolView
      name={{ ios: iosName, android: androidName, web: androidName }}
      tintColor={color}
      size={size}
    />
  );
}

function LogFABButton() {
  const router = useRouter();
  const { isDark } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => router.push("/nutrition/log-food" as any)}
      activeOpacity={0.82}
      style={fabStyles.wrap}
    >
      {isDark ? (
        <View style={[fabStyles.circle, {
          backgroundColor: '#F5C842',
          shadowColor: '#F5C842',
          shadowOpacity: 0.4,
        }]}>
          <Text style={[fabStyles.plus, { color: '#1C1612' }]}>+</Text>
        </View>
      ) : (
        <LinearGradient
          colors={["#5B8DEF", "#3B6FD4", "#2A5AC2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={fabStyles.circle}
        >
          <Text style={fabStyles.plus}>+</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F5C842',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#1C1612',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
});

const fabStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: Platform.OS === "ios" ? 2 : 0,
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
    shadowColor: "#20C7B7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  plus: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 32,
    textAlign: "center",
    includeFontPadding: false,
  },
});

function useCartBadgeCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    AsyncStorage.getItem('jonno_agent_cart')
      .then(raw => {
        if (!raw) { setCount(0); return; }
        const data = JSON.parse(raw);
        const n = (data.ingredients || []).filter(
          (i: { isInPantry?: boolean; isChecked?: boolean }) => !i.isInPantry && !i.isChecked
        ).length;
        setCount(n);
      })
      .catch(() => setCount(0));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { count, refresh };
}

export default function TabLayout() {
  const { isDark } = useTheme();
  const cartBadge = useCartBadgeCount();

  return (
    <Tabs
      screenListeners={{ focus: () => cartBadge.refresh() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#F5C842' : '#35C7B8',
        tabBarInactiveTintColor: isDark ? 'rgba(232,224,208,0.4)' : '#9CA3AF',
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1612' : 'rgba(255,255,255,0.85)',
          borderTopColor: isDark ? 'rgba(248,213,97,0.15)' : 'rgba(230,235,242,0.8)',
          borderTopWidth: isDark ? 1 : StyleSheet.hairlineWidth,
          elevation: 0,
          shadowColor: isDark ? '#000' : '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0 : 0.06,
          shadowRadius: 20,
          height: Platform.OS === "ios" ? 82 : 64,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          paddingBottom: Platform.OS === "ios" ? 0 : 6,
        },
      }}
    >
      {/* ── Home ── */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="house.fill" androidName="home" color={color} size={28} />
          ),
        }}
      />

      {/* ── Community ── */}
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="person.2.fill" androidName="group" color={color} size={28} />
          ),
        }}
      />

      {/* ── Log FAB (center) ── */}
      <Tabs.Screen
        name="log"
        options={{
          title: "",
          tabBarButton: () => <LogFABButton />,
        }}
      />

      {/* ── Agent ── */}
      <Tabs.Screen
        name="agent"
        options={{
          title: "Agent",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="sparkles" androidName="auto_awesome" color={color} size={28} />
          ),
        }}
      />

      {/* ── Smart Cart ── */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "Smart Cart",
          tabBarIcon: ({ color }) => (
            <View>
              <TabIcon iosName="cart.fill" androidName="shopping_cart" color={color} size={28} />
              {cartBadge.count > 0 && (
                <View style={badgeStyles.badge}>
                  <Text style={badgeStyles.badgeText}>
                    {cartBadge.count > 9 ? '9+' : cartBadge.count}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      {/* ── Hidden screens (not in tab bar) ── */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="meals" options={{ href: null }} />
      <Tabs.Screen name="nutrition" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
