import { View } from "react-native";

// This route exists only to satisfy the Expo Router tab slot.
// The LogFABButton in _layout.tsx navigates directly to /nutrition/log-food.
export default function LogPlaceholder() {
  return <View />;
}
