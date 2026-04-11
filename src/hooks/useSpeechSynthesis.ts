import { useCallback, useEffect, useRef, useState } from 'react';
import { SpiritualGuideKey } from '@/lib/guides';

interface VoiceProfile {
  rate: number;
  pitch: number;
  voiceName?: string; // preferred voice name substring match
}

const VOICE_PROFILES: Record<string, VoiceProfile> = {
  monk:             { rate: 0.80, pitch: 0.85 },           // slow, deep, calm
  st_francis:       { rate: 0.88, pitch: 1.05 },           // warm, gentle, slightly higher
  st_augustine:     { rate: 0.82, pitch: 0.80 },           // deep, measured, contemplative
  st_thomas_aquinas:{ rate: 0.90, pitch: 0.90 },           // steady, clear, professorial
  st_teresa:        { rate: 0.85, pitch: 1.15 },           // warm, feminine, expressive
  st_michael:       { rate: 0.95, pitch: 0.70 },           // commanding, strong, low
  st_padre_pio:     { rate: 0.78, pitch: 0.88 },           // slow, gentle, fatherly
  st_joan_of_arc:   { rate: 0.92, pitch: 1.10 },           // earnest, youthful, bold
};

const DEFAULT_PROFILE: VoiceProfile = { rate: 0.85, pitch: 0.9 };

export function useSpeechSynthesis(guideKey?: SpiritualGuideKey) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const profile = VOICE_PROFILES[guideKey || 'monk'] || DEFAULT_PROFILE;

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    stop();
    if (!isEnabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;

    // Try to pick a fitting voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Prefer English voices; try to vary by guide
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      if (enVoices.length > 0) {
        // Use a deterministic pick based on guide key hash
        const hash = (guideKey || 'monk').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        utterance.voice = enVoices[hash % enVoices.length];
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isEnabled, stop, profile.rate, profile.pitch, guideKey]);

  const toggle = useCallback(() => {
    if (isEnabled) {
      stop();
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  }, [isEnabled, stop]);

  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  return { isSpeaking, isEnabled, speak, stop, toggle };
}
