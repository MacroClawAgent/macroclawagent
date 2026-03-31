import React, { useRef } from 'react';
import { Dimensions, PanResponder, GestureResponderHandlers } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

/**
 * Swipe between footer tabs — instant navigation, no visual sliding.
 *
 * Quick swipe (velocity) → instant tab switch.
 * Slow drag past 35% screen → switch on release.
 *
 * Uses `onMoveShouldSetPanResponder` (NOT capture) so horizontal
 * ScrollViews and swipable cards handle gestures first. The parent
 * only claims the gesture when no child wants it.
 */

const SCREEN_W = Dimensions.get('window').width;
const TAB_ORDER = ['/home', '/community', '/agent', '/cart'];
const VELOCITY_THRESHOLD = 0.4;
const DISTANCE_RATIO = 0.35;

export function useTabSwipe(): GestureResponderHandlers {
  const router = useRouter();
  const pathnameRef = useRef('');
  const pathname = usePathname();
  pathnameRef.current = pathname;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 25 && Math.abs(dx) > Math.abs(dy) * 2.5,

      onPanResponderRelease: (_, { dx, vx }) => {
        const current = TAB_ORDER.findIndex(t =>
          pathnameRef.current === t || pathnameRef.current.startsWith(t + '/')
        );
        if (current === -1) return;

        const direction = dx < 0 ? 1 : -1;
        const next = current + direction;
        const fast = Math.abs(vx) > VELOCITY_THRESHOLD;
        const far = Math.abs(dx) > SCREEN_W * DISTANCE_RATIO;

        if ((fast || far) && next >= 0 && next < TAB_ORDER.length) {
          router.replace(`/(tabs)${TAB_ORDER[next]}` as any);
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
}

/**
 * Pass-through wrapper — kept so existing imports don't break.
 * Simply renders children without any Animated wrapping.
 */
export function TabSwipeWrapper({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement;
}
