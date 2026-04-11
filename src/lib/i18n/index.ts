import { LanguageCode, Translations } from './types';
import { en } from './en';
import { it } from './it';
import { es } from './es';
import { pt } from './pt';
import { fr } from './fr';
import { tl } from './tl';

export type { LanguageCode, Translations };
export { SUPPORTED_LANGUAGES } from './types';

const translations: Record<LanguageCode, Translations> = { en, it, es, pt, fr, tl };

export function getTranslations(lang: LanguageCode): Translations {
  return translations[lang] || translations.en;
}

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  tl: 'Tagalog',
};
