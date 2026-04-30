// Dispatcher: scans reminder_prefs every 5 minutes, sends scheduled
// reminders for the current local time window per user, and follow-ups
// for unfinished prayer sessions. Idempotent via reminder_send_log.
//
// Channels:
//  - email  → enqueued through send-transactional-email (template: prayer_reminder)
//  - sms    → Twilio gateway (no-op if TWILIO_API_KEY not configured)
//
// Scheduling tolerance: fires when local time is within [target, target+15min].

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY');
const TWILIO_FROM = Deno.env.get('TWILIO_FROM_NUMBER'); // optional E.164 sender

const APP_URL = 'https://oradevotion.com';
const WINDOW_MIN = 15;
const UNFINISHED_AGE_MIN = 180; // 3h after start, prompt to resume

const SLOTS = ['morning', 'midday', 'night'] as const;
type Slot = typeof SLOTS[number];

const SLOT_META: Record<Slot, { label: string; invocation: string; scripture: string }> = {
  morning: {
    label: 'Morning Lauds',
    invocation: 'Begin your day in grace.',
    scripture: 'In the morning, Lord, you hear my voice. (Psalm 5:3)',
  },
  midday: {
    label: 'Midday Angelus',
    invocation: 'Pause and remember the Incarnation.',
    scripture: 'The Lord is near to all who call on him. (Psalm 145:18)',
  },
  night: {
    label: 'Night Compline',
    invocation: 'Close the day in His peace.',
    scripture: 'Into your hands, Lord, I commend my spirit. (Luke 23:46)',
  },
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PrefRow {
  user_id: string;
  enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  email_address: string | null;
  phone_e164: string | null;
  timezone: string;
  morning_hour: number; morning_minute: number;
  midday_hour: number; midday_minute: number;
  night_hour: number; night_minute: number;
  unfinished_followup: boolean;
}

function localTimeIn(tz: string, now: Date) {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
    const parts = fmt.formatToParts(now);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
    return {
      hour: get('hour') % 24,
      minute: get('minute'),
      dateStr: `${parts.find((p) => p.type === 'year')?.value}-${parts.find((p) => p.type === 'month')?.value}-${parts.find((p) => p.type === 'day')?.value}`,
    };
  } catch {
    return { hour: now.getUTCHours(), minute: now.getUTCMinutes(), dateStr: now.toISOString().slice(0, 10) };
  }
}

function withinWindow(targetH: number, targetM: number, nowH: number, nowM: number): boolean {
  const target = targetH * 60 + targetM;
  const now = nowH * 60 + nowM;
  const delta = now - target;
  return delta >= 0 && delta <= WINDOW_MIN;
}

async function sendEmail(supabase: any, pref: PrefRow, slot: Slot | 'unfinished') {
  if (!pref.email_enabled || !pref.email_address) return;
  const isFollowup = slot === 'unfinished';
  const meta = isFollowup ? null : SLOT_META[slot as Slot];
  const idemKind = isFollowup ? 'unfinished' : `scheduled-${slot}`;
  const idem = `prayer-reminder-${pref.user_id}-${idemKind}-${new Date().toISOString().slice(0, 10)}`;
  await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'prayer_reminder',
      recipientEmail: pref.email_address,
      idempotencyKey: idem,
      templateData: {
        slotLabel: meta?.label,
        invocation: meta?.invocation,
        scripture: meta?.scripture,
        prayUrl: `${APP_URL}/prayer/${isFollowup ? 'morning' : slot}`,
        kind: isFollowup ? 'unfinished' : 'scheduled',
      },
    },
  });
}

async function sendSms(pref: PrefRow, slot: Slot | 'unfinished') {
  if (!pref.sms_enabled || !pref.phone_e164) return;
  if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !TWILIO_FROM) {
    console.log('[reminders] SMS skipped — Twilio not configured');
    return;
  }
  const isFollowup = slot === 'unfinished';
  const meta = isFollowup ? null : SLOT_META[slot as Slot];
  const body = isFollowup
    ? `Ora · Continue your prayer when you’re ready: ${APP_URL}/prayer/morning`
    : `Ora · ${meta!.label} — ${meta!.invocation} ${APP_URL}/prayer/${slot}`;

  const res = await fetch('https://connector-gateway.lovable.dev/twilio/Messages.json', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TWILIO_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: pref.phone_e164, From: TWILIO_FROM, Body: body }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error(`[reminders] Twilio send failed [${res.status}]: ${err}`);
  }
}

async function dedupedSend(
  supabase: any,
  pref: PrefRow,
  slot: Slot | 'unfinished',
  channel: 'email' | 'sms',
  sentForDate: string,
  send: () => Promise<void>,
) {
  const kind = slot === 'unfinished' ? 'unfinished' : 'scheduled';
  const { data, error } = await supabase
    .from('reminder_send_log')
    .insert({ user_id: pref.user_id, slot, channel, kind, sent_for_date: sentForDate })
    .select('id')
    .maybeSingle();
  if (error) {
    if (!String(error.message || '').toLowerCase().includes('duplicate')) {
      console.error(`[reminders] log insert error for ${pref.user_id}/${slot}/${channel}:`, error);
    }
    return;
  }
  if (!data) return;
  try {
    await send();
  } catch (e) {
    console.error(`[reminders] send error ${channel}/${slot} for ${pref.user_id}:`, e);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const now = new Date();

  const { data: prefs, error } = await supabase
    .from('reminder_prefs')
    .select('*')
    .eq('enabled', true)
    .or('email_enabled.eq.true,sms_enabled.eq.true');

  if (error) {
    console.error('[reminders] fetch prefs failed:', error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let scheduledCount = 0;
  let followupCount = 0;

  for (const pref of (prefs ?? []) as PrefRow[]) {
    const local = localTimeIn(pref.timezone || 'UTC', now);

    for (const slot of SLOTS) {
      const h = pref[`${slot}_hour` as const];
      const m = pref[`${slot}_minute` as const];
      if (!withinWindow(h, m, local.hour, local.minute)) continue;

      const { data: completion } = await supabase
        .from('prayer_completions')
        .select('id')
        .eq('user_id', pref.user_id)
        .eq('prayer_date', local.dateStr)
        .eq('prayer_type', slot)
        .maybeSingle();
      if (completion) continue;

      if (pref.email_enabled) {
        await dedupedSend(supabase, pref, slot, 'email', local.dateStr,
          () => sendEmail(supabase, pref, slot));
        scheduledCount++;
      }
      if (pref.sms_enabled) {
        await dedupedSend(supabase, pref, slot, 'sms', local.dateStr,
          () => sendSms(pref, slot));
        scheduledCount++;
      }
    }

    if (!pref.unfinished_followup) continue;

    const cutoff = new Date(now.getTime() - UNFINISHED_AGE_MIN * 60_000).toISOString();
    const { data: openSession } = await supabase
      .from('prayer_progress_sessions')
      .select('id, prayer_type, updated_at')
      .eq('user_id', pref.user_id)
      .eq('prayer_date', local.dateStr)
      .lt('updated_at', cutoff)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!openSession) continue;

    const { data: doneToday } = await supabase
      .from('prayer_completions')
      .select('id')
      .eq('user_id', pref.user_id)
      .eq('prayer_date', local.dateStr)
      .eq('prayer_type', openSession.prayer_type)
      .maybeSingle();
    if (doneToday) continue;

    if (pref.email_enabled) {
      await dedupedSend(supabase, pref, 'unfinished', 'email', local.dateStr,
        () => sendEmail(supabase, pref, 'unfinished'));
      followupCount++;
    }
    if (pref.sms_enabled) {
      await dedupedSend(supabase, pref, 'unfinished', 'sms', local.dateStr,
        () => sendSms(pref, 'unfinished'));
      followupCount++;
    }
  }

  return new Response(
    JSON.stringify({ ok: true, scheduledCount, followupCount, scanned: prefs?.length ?? 0 }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  );
});
