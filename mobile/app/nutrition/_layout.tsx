import { Stack } from "expo-router";

export default function NutritionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="log-food" options={{ headerShown: false, title: "" }} />
      <Stack.Screen name="photo-confirm" options={{ headerShown: false, title: "" }} />
    </Stack>
  );
}
