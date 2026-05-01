import { useEffect, useRef } from 'react';
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { isNative } from '@/lib/platform';
import { getReminderTimes, getRemindersEnabled } from '@/hooks/usePrayerReminders';

/**
 * Native on-device prayer reminders for iOS.
 *
 * On the web (and in the iframe preview) this hook is a no-op — the existing
 * `usePrayerReminders` toast loop continues to handle in-app reminders.
 *
 * On iOS we additionally schedule a repeating daily LocalNotification per
 * configured slot (Morning / Midday / Night). Local notifications fire even
 * when the app is backgrounded / killed, no APNs setup required, no server.
 *
 * Strategy:
 *  - Re-schedule on app launch and whenever the app comes to foreground
 *    (covers user changing their reminder times in Settings).
 *  - Cancel anything we previously scheduled before re-scheduling — no
 *    duplicates.
 *  - We use stable numeric IDs per slot so cancel works deterministically.
 */

const SLOT_IDS: Record<string, number> = {
  morning: 1001,
  midday: 1002,
  night: 1003,
};

async function ensurePermission(): Promise<boolean> {
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === 'granted') return true;
    if (status.display === 'denied') return false;
    const req = await LocalNotifications.requestPermissions();
    return req.display === 'granted';
  } catch {
    return false;
  }
}

async function rescheduleAll() {
  if (!isNative()) return;
  if (!getRemindersEnabled()) {
    // User turned reminders off — clear anything scheduled.
    try {
      await LocalNotifications.cancel({ notifications: Object.values(SLOT_IDS).map((id) => ({ id })) });
    } catch {}
    return;
  }
  const granted = await ensurePermission();
  if (!granted) return;

  // Cancel previous schedules to avoid stacking.
  try {
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter((n) => Object.values(SLOT_IDS).includes(n.id));
    if (ours.length) {
      await LocalNotifications.cancel({ notifications: ours.map((n) => ({ id: n.id })) });
    }
  } catch {}

  const times = getReminderTimes();
  const toSchedule: LocalNotificationSchema[] = times.map((t) => ({
    id: SLOT_IDS[t.slot],
    title: t.label,
    body: t.message,
    // Repeating daily at the chosen time (local time zone).
    schedule: {
      on: { hour: t.hour, minute: t.minute },
      allowWhileIdle: true,
      repeats: true,
    },
    smallIcon: 'ic_stat_icon_config_sample',
    sound: undefined,
    extra: { slot: t.slot, route: `/prayer/${t.slot}` },
  }));

  try {
    await LocalNotifications.schedule({ notifications: toSchedule });
  } catch (e) {
    console.warn('[LocalNotifications] schedule failed', e);
  }
}

export function useNativeNotifications() {
  const initialized = useRef(false);

  useEffect(() => {
    if (!isNative()) return;
    if (initialized.current) return;
    initialized.current = true;

    void rescheduleAll();

    // Re-schedule when the app returns to foreground (covers settings changes
    // and time-zone shifts after travel).
    const sub = App.addListener('appStateChange', (state) => {
      if (state.isActive) void rescheduleAll();
    });

    // When the user taps a reminder we want to deep-link them to the slot.
    const tapSub = LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
      const route = (event.notification.extra as any)?.route;
      if (typeof route === 'string') {
        // Defer to React Router by setting hash; route guard in App handles the rest.
        window.location.assign(route);
      }
    });

    return () => {
      void sub.then((s) => s.remove());
      void tapSub.then((s) => s.remove());
    };
  }, []);
}

/** Imperative helper to call from Settings when the user updates reminder times. */
export function rescheduleNativeReminders() {
  void rescheduleAll();
}
