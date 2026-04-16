import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SpiritualGuideKey } from '@/lib/guides';
import { notifyAdminError } from '@/lib/notifyAdmin';

export type SaintMood = 'casual' | 'prayer' | 'confession' | 'reflection';

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/saint-tts`;
const ENABLED_KEY = 'ora_voice_mode_enabled';
const SPEED_KEY = 'ora_voice_playback_speed';

// In-memory audio cache keyed by `${guide}|${mood}|${textHash}`
const audioCache = new Map<string, string>(); // value = object URL

function hashText(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return String(h);
}

function cleanForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_`>]/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useSaintVoice(guideKey: SpiritualGuideKey) {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ENABLED_KEY) === '1';
  });
  const [speed, setSpeedState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const v = parseFloat(localStorage.getItem(SPEED_KEY) || '1');
    return Number.isFinite(v) ? v : 1;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  const setEnabled = useCallback((v: boolean) => {
    setIsEnabled(v);
    try { localStorage.setItem(ENABLED_KEY, v ? '1' : '0'); } catch {}
    if (!v) stop();
  }, [stop]);

  const toggle = useCallback(() => setEnabled(!isEnabled), [isEnabled, setEnabled]);

  const setSpeed = useCallback((v: number) => {
    setSpeedState(v);
    try { localStorage.setItem(SPEED_KEY, String(v)); } catch {}
    if (audioRef.current) audioRef.current.playbackRate = v;
  }, []);

  const fetchAudioUrl = useCallback(async (text: string, mood?: SaintMood): Promise<string | null> => {
    const cleaned = cleanForSpeech(text);
    if (!cleaned) return null;
    const key = `${guideKey}|${mood || 'casual'}|${hashText(cleaned)}`;
    const cached = audioCache.get(key);
    if (cached) return cached;

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) return null;

    const resp = await fetch(TTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ text: cleaned, guide: guideKey, mood }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error || `TTS failed (${resp.status})`);
    }
    const data = await resp.json();
    const url = `data:${data.mime || 'audio/mpeg'};base64,${data.audio}`;
    audioCache.set(key, url);
    return url;
  }, [guideKey]);

  const play = useCallback(async (text: string, mood?: SaintMood, opts?: { force?: boolean }) => {
    if (!isEnabled && !opts?.force) return;
    try {
      stop();
      setIsLoading(true);
      const url = await fetchAudioUrl(text, mood);
      setIsLoading(false);
      if (!url) return;
      const audio = new Audio(url);
      audio.playbackRate = speed;
      audioRef.current = audio;
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch (e: any) {
      setIsLoading(false);
      setIsSpeaking(false);
      console.error('Saint voice error:', e);
      notifyAdminError('saint-tts', e?.message || String(e), undefined, { guide: guideKey, mood });
      // Silent fallback — caller still has text.
    }
  }, [isEnabled, fetchAudioUrl, speed, stop, guideKey]);

  useEffect(() => () => stop(), [stop]);

  return { isEnabled, setEnabled, toggle, speed, setSpeed, isLoading, isSpeaking, play, stop };
}
