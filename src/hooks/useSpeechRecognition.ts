import { useCallback, useEffect, useRef, useState } from 'react';

const LANG_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-BR',
  tl: 'fil-PH',
};

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(continuous = false, language = 'en'): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognition;

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const start = useCallback(() => {
    if (!SpeechRecognition) return;
    stop();

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = LANG_MAP[language] || LANG_MAP.en;

    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) {
        setTranscript(prev => prev + (prev ? ' ' : '') + final.trim());
      }
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };
    recognition.onerror = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [SpeechRecognition, stop, continuous, language]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  return { isListening, transcript, interimTranscript, isSupported, start, stop, toggle, resetTranscript };
}
