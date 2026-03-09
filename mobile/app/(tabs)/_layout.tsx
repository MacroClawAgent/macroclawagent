import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { SymbolView } from "expo-symbols";
import { useTheme } from "@/context/ThemeContext";

// Tab icon helper — wraps SymbolView with cross-platform SF Symbol / Material icon names
function TabIcon({
  iosName,
  androidName,
  color,
  size = 26,
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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedMore,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        headerStyle: {
          backgroundColor: colors.bg,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 17,
          color: colors.text,
        },
      }}
    >
      {/* ── Home / Dashboard ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "Jonno",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="house.fill" androidName="home" color={color} />
          ),
        }}
      />

      {/* ── Nutrition ── */}
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="chart.bar.fill" androidName="bar_chart" color={color} />
          ),
        }}
      />

      {/* ── Meal Plans ── */}
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="fork.knife" androidName="restaurant" color={color} />
          ),
        }}
      />

      {/* ── AI Agent ── */}
      <Tabs.Screen
        name="agent"
        options={{
          title: "Agent",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="sparkles" androidName="auto_awesome" color={color} />
          ),
        }}
      />

      {/* ── Settings ── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <TabIcon iosName="gearshape.fill" androidName="settings" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
