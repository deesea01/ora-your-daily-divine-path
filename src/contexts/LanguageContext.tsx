import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode, Translations, getTranslations } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LanguageContextValue {
  language: LanguageCode;
  t: Translations;
  setLanguage: (lang: LanguageCode) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  t: getTranslations('en'),
  setLanguage: async () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLang] = useState<LanguageCode>('en');

  // Load language from profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_profiles')
      .select('preferred_language')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.preferred_language) {
          setLang(data.preferred_language as LanguageCode);
        }
      });
  }, [user]);

  const setLanguage = useCallback(async (lang: LanguageCode) => {
    setLang(lang);
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ preferred_language: lang, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }
  }, [user]);

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
