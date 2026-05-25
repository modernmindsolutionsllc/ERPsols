import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { trackingApi } from '@/services/api';

/**
 * useSessionHeartbeat
 * ───────────────────
 * Visibility-aware session heartbeat + exit-beacon hook.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  DOUBLE-LOCK RELIABILITY PATTERN                               │
 * │                                                                │
 * │  Lock 1 (Primary):   visibilitychange + beforeunload           │
 * │    → fetch(keepalive:true) to POST /disconnect                 │
 * │    → Updates last_active_at to the EXACT second of exit        │
 * │                                                                │
 * │  Lock 2 (Fallback):  setInterval every 60s                     │
 * │    → POST /heartbeat also sets last_active_at = now()          │
 * │    → If the browser crashes and Lock 1 never fires,            │
 * │      last_active_at is still accurate to ~60 seconds           │
 * └─────────────────────────────────────────────────────────────────┘
 */
export function useSessionHeartbeat() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const INTERVAL_MS = 60_000; // 60 seconds

    // ── Lock 2: Periodic heartbeat (fallback) ──────────────────────────────
    const intervalId = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;

      try {
        await trackingApi.heartbeat(60);
      } catch {
        // Fail silently — don't crash the app for a tracking blip
      }
    }, INTERVAL_MS);

    // ── Lock 1: Exit beacon (primary) ──────────────────────────────────────
    // Uses fetch(keepalive:true) which properly sends the Authorization header
    // — unlike navigator.sendBeacon which drops custom headers (causing 401s)

    let hasDisconnected = false;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !hasDisconnected) {
        hasDisconnected = true;
        trackingApi.disconnect();
      } else if (document.visibilityState === 'visible') {
        hasDisconnected = false;
      }
    };

    const handleBeforeUnload = () => {
      if (!hasDisconnected) {
        hasDisconnected = true;
        trackingApi.disconnect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated]);
}
