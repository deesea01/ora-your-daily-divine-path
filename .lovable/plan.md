# Sacred Polish: Journal Fix + Mood Verses + Reverent Ambience

## 1. Journal save button fix

The fixed top-right account avatar (`AuthNav`, ~`right:12px top:safe+12px`, 36x36) overlaps the Save / + buttons in the journal header and write modal.

- Add `pr-14` to `JournalHome` page header and the New Entry modal header so Save/+ buttons sit clear of the avatar.
- Add `pr-14` to `JournalExamen` header for consistency.

No logic changes. Pure layout.

## 2. Mood-matched Scripture verses

### New file `src/lib/scriptureByMood.ts`

A small curated library, ~6–8 verses per mood, each: `{ ref, text, mood, theme }`. Moods covered: `peaceful`, `grateful`, `struggling`, `anxious`, `joyful`, `lonely`, `lost`, `neutral`. Sources span Psalms, Isaiah, Matthew, John, Romans, Philippians, 2 Corinthians, 1 Peter, Lamentations, Jeremiah — not Psalms-only.

Helpers:
- `getVerseForMood(mood, seed?)` — deterministic-by-day rotation so the same verse shows all day, then changes.
- `getVerseForLatestEntry(entries)` — picks the most recent journal mood; falls back to `peaceful`.

### Home (Today's Prayer Path)

`src/components/TodaysPrayerPath.tsx` (or wherever the daily verse renders — verify) gets a small "A word for today" verse card that prefers the user's latest journal mood, otherwise rotates a peaceful default.

### Journal save confirmation

After `saveEntry` succeeds in `JournalHome`, show a brief in-modal "A word for you" verse panel based on the chosen mood (auto-dismiss on close). No new dependencies.

## 3. Reverent ambience pass (sacred upgrade)

### Candle / Sacred Pause

`src/components/SacredPause.tsx`:
- Replace the single blurred orb candle with a layered organic flame: inner core, outer halo, base wick, and a `flame-flicker` keyframe (irregular x/y nudge + opacity, 1.6–2.4s loop) so it breathes like a real candle.
- Add a soft golden glow ring that pulses at half-rate.
- Add an ambient "incense" layer — two slow-drifting blurred plumes rising at 0.04 opacity (`@keyframes incense-rise`).
- Honors `prefers-reduced-motion` (already wired).

### Guided transition states

New tiny component `src/components/ReverentTransition.tsx` — a labeled fade overlay (e.g., "Prepare your heart…", "Be still…", "Breathe…") used between prayer steps. `~600ms` cross-fade with subtle gold underline. Wired into the existing prayer flow at step boundaries (Index → prayer detail handoff and rosary step changes).

### Saint introduction moments

`src/components/SaintAvatar.tsx`:
- Add a `reverent` variant: gentle scale-in (0.96 → 1.0) over 700ms, soft gold halo fade-in, hold-still after. No bouncing.
- New keyframes `saint-reveal` and `halo-pulse-soft` in `index.css`.
- Used in `GuideSelect`, `MonkChat` header, and `SaintCompanionsCarousel` first appearance.

### Global page transitions

Existing `RouteTransition` already does fade. Soften duration to `0.6s` with `ease-elegant`, and add a 1px gold underline sweep on the active nav (no new layout).

### Ambient soundscapes (gentle, opt-in)

Single new component `src/components/AmbientSoundscape.tsx` + hook `src/hooks/useAmbience.ts`:
- Uses pre-rendered short looping clips generated via existing `ELEVENLABS_API_KEY` connector through a new edge function `supabase/functions/generate-ambience/index.ts` (sound-effects API, 22s loops, cached to `saint-audio` bucket so we generate once per soundscape).
- Soundscapes: `chapel`, `rain`, `monastery`, `choir-drone`. All very quiet (default volume 0.18).
- Tiny floating control on Index + Sacred Pause + Rosary: a single icon that opens a 4-tile picker and a volume slider. State persists in `localStorage` (`ora.ambience`).
- Off by default. Never autoplays without a tap (browser policy + user trust).

### Personalized reflection memory (foundation)

This is intentionally scoped small in this pass — it's a long-term moat:
- New table `reflection_memory` (user_id, mood, verse_ref, prayer_id, created_at) — captures every mood-verse pairing and prayer completion so future AI passes (Spiritual Memory Engine) can reference it.
- A row is written when a mood-matched verse is shown post-journal, and when a prayer is completed.
- No UI surface yet beyond what exists; the data starts accumulating now.

## Technical notes

- All new keyframes added under existing `@layer utilities` in `src/index.css` and respect `@media (prefers-reduced-motion: reduce)`.
- Ambience audio is base64-cached server-side; client streams from public `saint-audio` bucket URL — no per-play API cost.
- Edge function `generate-ambience` is idempotent: checks bucket first, only calls ElevenLabs if missing.
- Migration adds `reflection_memory` with RLS (`auth.uid() = user_id` for select/insert).

## Files touched

```
src/pages/JournalHome.tsx          (pr-14 + verse panel)
src/pages/JournalExamen.tsx        (pr-14)
src/lib/scriptureByMood.ts         (new)
src/components/TodaysPrayerPath.tsx (verse card)
src/components/SacredPause.tsx     (layered candle, incense)
src/components/SaintAvatar.tsx     (reverent variant)
src/components/ReverentTransition.tsx (new)
src/components/AmbientSoundscape.tsx  (new)
src/hooks/useAmbience.ts            (new)
src/components/RouteTransition.tsx  (softer timing)
src/index.css                       (keyframes)
src/pages/Index.tsx                 (verse + ambience control)
src/pages/Rosary.tsx                (transitions + ambience)
supabase/functions/generate-ambience/index.ts (new)
supabase/migrations/<timestamp>_reflection_memory.sql (new)
```
