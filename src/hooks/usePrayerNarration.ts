import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notifyAdminError } from '@/lib/notifyAdmin';

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/saint-tts`;
const MAX_CHUNK = 1100; // saint-tts caps text at 1200; leave headroom
const SPEED_KEY = 'ora:prayer-narration:speed';

/** Strip markdown so the voice doesn't read symbols. */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`>]/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split long text on sentence boundaries into <= MAX_CHUNK pieces. */
function chunkText(text: string, max = MAX_CHUNK): string[] {
  const clean = cleanForSpeech(text);
  if (clean.length <= max) return clean ? [clean] : [];
  const sentences = clean.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [clean];
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if ((current + ' ' + s).trim().length > max) {
      if (current) chunks.push(current.trim());
      // If a single sentence exceeds max, hard-split it.
      if (s.length > max) {
        for (let i = 0; i < s.length; i += max) chunks.push(s.slice(i, i + max));
        current = '';
      } else {
        current = s;
      }
    } else {
      current = current ? `${current} ${s}` : s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

interface NarrationOptions {
  guide?: string;
  mood?: 'casual' | 'prayer' | 'confession' | 'reflection';
}

/**
 * Plays narration for a given key (e.g. stage id). Calls saint-tts, splits long text
 * into chunks, and plays them sequentially. Cancels prior playback when a new key starts.
 */
export function usePrayerNarration({ guide = 'monk', mood = 'prayer' }: NarrationOptions = {}) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const v = parseFloat(localStorage.getItem(SPEED_KEY) || '1');
    return Number.isFinite(v) && v >= 0.5 && v <= 2 ? v : 1;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelRef = useRef<{ key: string | null }>({ key: null });

  const stop = useCallback(() => {
    cancelRef.current.key = null;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setActiveKey(null);
    setLoadingKey(null);
  }, []);

  useEffect(() => () => stop(), [stop]);

  useEffect(() => {
    try { localStorage.setItem(SPEED_KEY, String(speed)); } catch {}
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  const fetchAudio = useCallback(
    async (text: string): Promise<string | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, guide, mood }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`TTS failed (${res.status}): ${detail.slice(0, 160)}`);
      }
      const json = await res.json();
      if (json.url) return json.url as string;
      if (json.audio && json.mime) return `data:${json.mime};base64,${json.audio}`;
      return null;
    },
    [guide, mood],
  );

  const playSequence = useCallback(
    async (key: string, urls: string[]) => {
      for (let i = 0; i < urls.length; i++) {
        if (cancelRef.current.key !== key) return;
        const url = urls[i];
        const audio = new Audio(url);
        audio.playbackRate = speed;
        audio.preload = 'auto';
        audioRef.current = audio;
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error('Playback failed'));
          audio.play().catch(reject);
        });
      }
      if (cancelRef.current.key === key) {
        setActiveKey(null);
        audioRef.current = null;
      }
    },
    [speed],
  );

  const play = useCallback(
    async (key: string, text: string) => {
      // Toggle off if same key already playing
      if (activeKey === key) {
        stop();
        return;
      }
      // Cancel any prior playback
      stop();
      const chunks = chunkText(text);
      if (chunks.length === 0) return;

      cancelRef.current.key = key;
      setErrorKey(null);
      setLoadingKey(key);

      try {
        // Fetch first chunk before showing "playing", so the spinner reads as loading time.
        const firstUrl = await fetchAudio(chunks[0]);
        if (cancelRef.current.key !== key) return;
        if (!firstUrl) throw new Error('Empty TTS response');

        // Pre-fetch the rest in parallel (saint-tts caches in storage).
        const restPromise = Promise.all(chunks.slice(1).map((c) => fetchAudio(c)));

        setLoadingKey(null);
        setActiveKey(key);

        // Start the first; await rest only when needed.
        const audio = new Audio(firstUrl);
        audio.playbackRate = speed;
        audioRef.current = audio;

        const playFirst = new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error('Playback failed'));
          audio.play().catch(reject);
        });

        await playFirst;
        if (cancelRef.current.key !== key) return;

        const restUrls = (await restPromise).filter((u): u is string => !!u);
        await playSequence(key, restUrls);
      } catch (err: any) {
        console.error('Narration error:', err);
        notifyAdminError('prayer-narration', err?.message || String(err), undefined, { guide, mood });
        setErrorKey(key);
        setActiveKey(null);
        setLoadingKey(null);
      }
    },
    [activeKey, fetchAudio, guide, mood, playSequence, speed, stop],
  );

  return {
    play,
    stop,
    activeKey,
    loadingKey,
    errorKey,
    speed,
    setSpeed,
    isPlaying: (key: string) => activeKey === key,
    isLoading: (key: string) => loadingKey === key,
  };
}
