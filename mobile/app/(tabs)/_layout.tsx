import React from "react";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { SymbolView } from "expo-symbols";
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

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#35C7B8",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.85)",
          borderTopColor: "rgba(230,235,242,0.8)",
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 20,
          height: Platform.OS === "ios" ? 82 : 64,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
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
            <TabIcon iosName="house.fill" androidName="home" color={color} />
          ),
        }}
      />

      {/* ── Activity ── */}
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="figure.run" androidName="directions_run" color={color} />
          ),
        }}
      />

      {/* ── Agent ── */}
      <Tabs.Screen
        name="agent"
        options={{
          title: "Agent",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="sparkles" androidName="auto_awesome" color={color} />
          ),
        }}
      />

      {/* ── Smart Cart ── */}
      <Tabs.Screen
        name="cart"
        options={{
          title: "Smart Cart",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="cart.fill" androidName="shopping_cart" color={color} />
          ),
        }}
      />

      {/* ── Hidden screens (not in tab bar) ── */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="meals" options={{ href: null }} />
      <Tabs.Screen name="nutrition" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
