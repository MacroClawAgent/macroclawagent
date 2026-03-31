import { useRef } from 'react';
import { PanResponder, GestureResponderHandlers } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

/**
 * Swipe between footer tabs.
 *
 * Uses `onMoveShouldSetPanResponder` (NOT capture), so child views
 * like horizontal ScrollViews claim the gesture first. The hook only
 * takes over when no child handles the horizontal drag.
 *
 * Returns panHandlers to spread on the root View / SafeAreaView.
 */

const TAB_ORDER = ['/home', '/community', '/agent', '/cart'];
const MOVE_THRESHOLD = 30;   // px before we even consider claiming
const SWIPE_THRESHOLD = 100; // px of dx required on release to switch

export function useTabSwipe(): GestureResponderHandlers {
  const router = useRouter();
  const pathnameRef = useRef('');
  const pathname = usePathname();
  pathnameRef.current = pathname;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > MOVE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 2,
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) < SWIPE_THRESHOLD) return;
        const current = TAB_ORDER.findIndex(t =>
          pathnameRef.current === t || pathnameRef.current.startsWith(t + '/')
        );
        if (current === -1) return;
        const next = dx < 0 ? current + 1 : current - 1;
        if (next >= 0 && next < TAB_ORDER.length) {
          router.replace(`/(tabs)${TAB_ORDER[next]}` as any);
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
}
