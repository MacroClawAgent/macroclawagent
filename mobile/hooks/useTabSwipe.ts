import React, { useRef } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

/**
 * Smooth swipe-to-navigate between footer tabs.
 *
 * Content follows the finger while dragging. On release:
 * - Quick swipe (velocity > 0.5) → switches tab
 * - Held past 40% screen width → switches tab
 * - Otherwise → springs back
 *
 * Uses `onMoveShouldSetPanResponder` (NOT capture) so child
 * horizontal ScrollViews still work normally.
 */

const SCREEN_W = Dimensions.get('window').width;
const TAB_ORDER = ['/home', '/community', '/agent', '/cart'];
const VELOCITY_THRESHOLD = 0.5;
const DISTANCE_RATIO = 0.4; // 40% of screen width

export function TabSwipeWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathnameRef = useRef('');
  const pathname = usePathname();
  pathnameRef.current = pathname;

  const translateX = useRef(new Animated.Value(0)).current;

  const springBack = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy) * 2,

      onPanResponderMove: (_, { dx }) => {
        const current = TAB_ORDER.findIndex(t =>
          pathnameRef.current === t || pathnameRef.current.startsWith(t + '/')
        );
        // Apply resistance at edges (can't swipe past first/last tab)
        const atLeftEdge = dx > 0 && current === 0;
        const atRightEdge = dx < 0 && current === TAB_ORDER.length - 1;
        const damping = (atLeftEdge || atRightEdge) ? 0.15 : 0.55;
        translateX.setValue(dx * damping);
      },

      onPanResponderRelease: (_, { dx, vx }) => {
        const current = TAB_ORDER.findIndex(t =>
          pathnameRef.current === t || pathnameRef.current.startsWith(t + '/')
        );
        if (current === -1) { springBack(); return; }

        const direction = dx < 0 ? 1 : -1; // 1 = swipe left (next), -1 = swipe right (prev)
        const next = current + direction;
        const fastEnough = Math.abs(vx) > VELOCITY_THRESHOLD;
        const farEnough = Math.abs(dx) > SCREEN_W * DISTANCE_RATIO;

        if ((fastEnough || farEnough) && next >= 0 && next < TAB_ORDER.length) {
          // Animate content off-screen then navigate
          Animated.timing(translateX, {
            toValue: -direction * SCREEN_W,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            router.replace(`/(tabs)${TAB_ORDER[next]}` as any);
          });
        } else {
          springBack();
        }
      },

      onPanResponderTerminate: () => { springBack(); },
    })
  ).current;

  return React.createElement(
    Animated.View,
    {
      style: [styles.container, { transform: [{ translateX }] }],
      ...panResponder.panHandlers,
    },
    children
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
