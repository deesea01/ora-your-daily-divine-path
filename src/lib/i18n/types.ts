export type LanguageCode = 'en' | 'it' | 'es' | 'pt' | 'fr' | 'tl';

export interface LanguageMeta {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'it', label: 'Italian', nativeLabel: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'tl', label: 'Tagalog', nativeLabel: 'Tagalog', flag: '🇵🇭' },
];

export interface Translations {
  // Common
  loading: string;
  signOut: string;
  back: string;
  save: string;
  cancel: string;
  clear: string;
  delete: string;
  today: string;
  
  // Auth
  authTitle: string;
  authSubtitle: string;
  email: string;
  password: string;
  signIn: string;
  signUp: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  checkEmail: string;
  checkEmailDesc: string;
  forgotPassword: string;
  resetPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  passwordsDoNotMatch: string;
  passwordResetSent: string;
  passwordResetSentDesc: string;
  passwordUpdated: string;
  passwordUpdatedDesc: string;
  updatePassword: string;

  // Index / Home
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  prayerStreak: string;
  day: string;
  days: string;
  todaysPrayerPath: string;
  morningLauds: string;
  morningLaudsDesc: string;
  middayAngelus: string;
  middayAngelusDesc: string;
  nightCompline: string;
  nightComplineDesc: string;
  holyRosary: string;
  holyRosaryDesc: string;
  prayerLibrary: string;
  prayerLibraryDesc: string;
  spiritualJournal: string;
  spiritualJournalDesc: string;
  confessionTracker: string;
  confessionTrackerDesc: string;
  talkTo: string;
  spiritualGuidance: string;
  yourGuide: string;
  impact: string;
  impactDesc: string;
  language: string;
  changeLanguage: string;

  // Chat
  helpYouToday: string;
  askAnything: string;
  helpMePray: string;
  iFeelAnxious: string;
  guideMyReflection: string;
  listening: string;
  speaking: string;
  listeningToYou: string;
  spiritualGuidanceAnytime: string;
  clearConversation: string;
  conversationCleared: string;
  muteVoice: string;
  enableVoice: string;
  stopListening: string;
  speakToSaint: string;
  askSaint: string;

  // Impact
  impactTitle: string;
  impactMessage: string;

  // Onboarding
  welcomeToOra: string;
  whatSeeking: string;
  experienceLevel: string;
  chooseGuide: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  getStarted: string;
  next: string;
  
  // Prayer categories
  essentialPrayers: string;
  marianPrayers: string;
  readPrayer: string;
  listenPrayer: string;
  practicePrayer: string;
}
