import { Text, TextInput, StyleSheet } from 'react-native';

const DEFAULT_FONT = 'DMSans_400Regular';

/**
 * Patches React Native's Text and TextInput to use DM Sans by default.
 * Call once after fonts are loaded.
 */
export function setDefaultFont() {
  // Patch Text
  const oldTextRender = (Text as any).render;
  if (oldTextRender) {
    (Text as any).render = function (...args: any[]) {
      const origin = oldTextRender.apply(this, args);
      const flatStyle = StyleSheet.flatten(origin.props.style) || {};
      // Only inject if no fontFamily is explicitly set
      if (!flatStyle.fontFamily) {
        return {
          ...origin,
          props: {
            ...origin.props,
            style: [{ fontFamily: DEFAULT_FONT }, origin.props.style],
          },
        };
      }
      return origin;
    };
  }

  // Patch TextInput
  const oldInputRender = (TextInput as any).render;
  if (oldInputRender) {
    (TextInput as any).render = function (...args: any[]) {
      const origin = oldInputRender.apply(this, args);
      const flatStyle = StyleSheet.flatten(origin.props.style) || {};
      if (!flatStyle.fontFamily) {
        return {
          ...origin,
          props: {
            ...origin.props,
            style: [{ fontFamily: DEFAULT_FONT }, origin.props.style],
          },
        };
      }
      return origin;
    };
  }
}
