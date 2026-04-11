import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[userId]" />
      <Stack.Screen name="personal" />
      <Stack.Screen name="personalise" />
      <Stack.Screen name="integrations" />
      <Stack.Screen name="settings-page" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
