import { useCallback, useEffect, useRef, useState } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    stop();
    if (!isEnabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isEnabled, stop]);

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
