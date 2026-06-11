// Scalable rotation pool for the Midday Angelus.
// Add new entries freely — the rotation picks deterministically by day-of-year
// and an offset derived from the user id, so successive days surface fresh
// scripture, themes, and saint companions while preserving the Angelus form.

export type MiddayTheme =
  | "incarnation"
  | "humility"
  | "obedience"
  | "vocational_work"
  | "midday_renewal"
  | "service_and_surrender"
  | "gospel_in_daily_life";

export interface MiddayScripture {
  ref: string;
  text: string;
  themes: MiddayTheme[];
}

export interface MiddaySaintSeed {
  key: string;
  name: string;
  note: string; // one short line of their charism for the model to draw from
  themes: MiddayTheme[];
}

export interface MiddayReflectionSeed {
  theme: MiddayTheme;
  prompt: string; // one-line spiritual angle the model should explore
}

// ---- Scripture pool (Marian + Incarnation + noon-hour + daily-work) ----
export const MIDDAY_SCRIPTURES: MiddayScripture[] = [
  // Marian / Incarnation core (kept, but now part of a wider rotation)
  { ref: "Luke 1:38", text: "Behold, I am the handmaid of the Lord; let it be to me according to your word.", themes: ["humility", "obedience", "incarnation"] },
  { ref: "John 1:14", text: "And the Word became flesh and dwelt among us, full of grace and truth.", themes: ["incarnation"] },
  { ref: "Luke 1:46-47", text: "My soul magnifies the Lord, and my spirit rejoices in God my Savior.", themes: ["humility", "midday_renewal"] },
  { ref: "Luke 1:49", text: "He who is mighty has done great things for me, and holy is his name.", themes: ["humility", "incarnation"] },
  { ref: "Philippians 2:6-7", text: "Though he was in the form of God, he emptied himself, taking the form of a servant.", themes: ["incarnation", "humility", "service_and_surrender"] },
  { ref: "Philippians 2:8", text: "He humbled himself and became obedient unto death, even death on a cross.", themes: ["obedience", "humility"] },
  { ref: "Hebrews 10:7", text: "Behold, I have come to do your will, O God.", themes: ["obedience", "service_and_surrender"] },

  // Noon-hour / midday renewal
  { ref: "Psalm 113:3", text: "From the rising of the sun to its setting, the name of the Lord is to be praised.", themes: ["midday_renewal"] },
  { ref: "Psalm 55:17", text: "Evening and morning and at noon I utter my complaint and moan, and he will hear my voice.", themes: ["midday_renewal"] },
  { ref: "Psalm 90:14", text: "Satisfy us in the morning with your steadfast love, that we may rejoice and be glad all our days.", themes: ["midday_renewal"] },
  { ref: "Lamentations 3:22-23", text: "The steadfast love of the Lord never ceases; his mercies are new every morning.", themes: ["midday_renewal"] },

  // Vocational work / daily life
  { ref: "Colossians 3:17", text: "Whatever you do, in word or deed, do everything in the name of the Lord Jesus.", themes: ["vocational_work", "gospel_in_daily_life"] },
  { ref: "Colossians 3:23", text: "Whatever you do, work heartily, as for the Lord and not for men.", themes: ["vocational_work"] },
  { ref: "1 Corinthians 10:31", text: "Whether you eat or drink, or whatever you do, do all to the glory of God.", themes: ["vocational_work", "gospel_in_daily_life"] },
  { ref: "Ecclesiastes 9:10", text: "Whatever your hand finds to do, do it with your might.", themes: ["vocational_work"] },
  { ref: "2 Thessalonians 3:13", text: "Brothers, do not grow weary in doing good.", themes: ["vocational_work", "midday_renewal"] },

  // Gospel in daily life
  { ref: "Matthew 5:16", text: "Let your light shine before others, that they may see your good works and give glory to your Father.", themes: ["gospel_in_daily_life", "vocational_work"] },
  { ref: "Matthew 11:29", text: "Take my yoke upon you, and learn from me, for I am gentle and lowly in heart.", themes: ["humility", "midday_renewal"] },
  { ref: "Matthew 20:28", text: "The Son of Man came not to be served but to serve, and to give his life as a ransom for many.", themes: ["service_and_surrender", "obedience"] },
  { ref: "Mark 10:45", text: "Even the Son of Man came not to be served but to serve.", themes: ["service_and_surrender"] },
  { ref: "John 13:14", text: "If I then, your Lord and Teacher, have washed your feet, you also ought to wash one another's feet.", themes: ["service_and_surrender", "humility"] },
  { ref: "John 15:5", text: "I am the vine; you are the branches. Whoever abides in me bears much fruit.", themes: ["vocational_work", "gospel_in_daily_life"] },
  { ref: "Luke 9:23", text: "If anyone would come after me, let him deny himself and take up his cross daily and follow me.", themes: ["service_and_surrender", "obedience"] },
  { ref: "Luke 10:42", text: "One thing is necessary. Mary has chosen the good portion, which will not be taken away from her.", themes: ["midday_renewal", "gospel_in_daily_life"] },
  { ref: "James 1:22", text: "Be doers of the word, and not hearers only.", themes: ["gospel_in_daily_life", "vocational_work"] },
  { ref: "1 Peter 5:6", text: "Humble yourselves, therefore, under the mighty hand of God so that at the proper time he may exalt you.", themes: ["humility", "service_and_surrender"] },
  { ref: "Romans 12:1", text: "Present your bodies as a living sacrifice, holy and acceptable to God, which is your spiritual worship.", themes: ["service_and_surrender", "vocational_work"] },
  { ref: "Galatians 2:20", text: "It is no longer I who live, but Christ who lives in me.", themes: ["service_and_surrender", "incarnation"] },
  { ref: "Isaiah 6:8", text: "Here am I! Send me.", themes: ["obedience", "vocational_work"] },
  { ref: "1 Samuel 3:10", text: "Speak, Lord, for your servant hears.", themes: ["obedience"] },
];

// ---- Saint companions for the Angelus (broader than Marian-only) ----
export const MIDDAY_SAINTS: MiddaySaintSeed[] = [
  { key: "st_joseph", name: "St. Joseph", note: "Silent worker who obeyed God in dreams and labored faithfully at Nazareth.", themes: ["obedience", "vocational_work", "humility"] },
  { key: "st_therese", name: "St. Thérèse of Lisieux", note: "The Little Way: small hidden acts of love done for God in daily work.", themes: ["humility", "vocational_work", "service_and_surrender"] },
  { key: "st_benedict", name: "St. Benedict", note: "Ora et labora — prayer and work as one offering; the noon pause sanctifies the day.", themes: ["vocational_work", "midday_renewal", "obedience"] },
  { key: "st_josemaria", name: "St. Josemaría Escrivá", note: "Sanctity in ordinary work; the daily task becomes a path to holiness.", themes: ["vocational_work", "gospel_in_daily_life"] },
  { key: "st_john_paul_ii", name: "St. John Paul II", note: "Human work shares in the Creator's activity; surrender as Totus Tuus.", themes: ["vocational_work", "service_and_surrender"] },
  { key: "st_teresa_calcutta", name: "St. Teresa of Calcutta", note: "Do small things with great love; meet Christ in the person in front of you.", themes: ["service_and_surrender", "gospel_in_daily_life"] },
  { key: "st_ignatius", name: "St. Ignatius of Loyola", note: "Suscipe — take, Lord, and receive; find God in all things, even midday tasks.", themes: ["service_and_surrender", "obedience"] },
  { key: "st_francis_de_sales", name: "St. Francis de Sales", note: "Devotion fitted to your state of life; gentle steady faithfulness.", themes: ["vocational_work", "humility"] },
  { key: "st_zelie_martin", name: "St. Zélie Martin", note: "Holiness in a working mother's hidden labor and family devotion.", themes: ["vocational_work", "humility", "gospel_in_daily_life"] },
  { key: "st_isidore", name: "St. Isidore the Farmer", note: "The plow becomes prayer; faithful labor offered in union with God.", themes: ["vocational_work", "midday_renewal"] },
  { key: "bl_charles_de_foucauld", name: "Bl. Charles de Foucauld", note: "Prayer of abandonment: 'Father, I abandon myself into your hands.'", themes: ["service_and_surrender", "obedience"] },
  { key: "st_john_vianney", name: "St. John Vianney", note: "The duty of the moment, done for love, is the shortest path to God.", themes: ["vocational_work", "obedience"] },
];

// ---- Reflection seeds — angles the model can explore each day ----
export const MIDDAY_REFLECTIONS: MiddayReflectionSeed[] = [
  { theme: "incarnation", prompt: "God did not stay distant — he entered ordinary time. The noon hour is ordinary; he is here." },
  { theme: "incarnation", prompt: "The Word became flesh inside a working household. Your kitchen, desk, or commute is not outside the mystery." },
  { theme: "humility", prompt: "Mary's fiat was not dramatic — it was quiet. What quiet yes is being asked at this midday?" },
  { theme: "humility", prompt: "To be small before God is not to be erased; it is to be carried." },
  { theme: "obedience", prompt: "Obedience at noon usually looks like returning to the task you left unfinished, with love." },
  { theme: "obedience", prompt: "'Speak, Lord, your servant hears' — make the next hour a listening hour, not just a producing hour." },
  { theme: "vocational_work", prompt: "Your work this afternoon is a place where Christ is already laboring. Join him there." },
  { theme: "vocational_work", prompt: "Offer the unfinished, the tedious, and the interrupted — they are real material for holiness." },
  { theme: "midday_renewal", prompt: "Half the day is spent. Hand back what was wasted; receive the rest as new mercy." },
  { theme: "midday_renewal", prompt: "Even the sun pauses overhead. Let this be a true pause, not just a shorter rush." },
  { theme: "service_and_surrender", prompt: "Surrender is not collapse — it is placing the afternoon's people and tasks in stronger hands." },
  { theme: "service_and_surrender", prompt: "Who will cross your path before evening? Pray for them now, by name if you can." },
  { theme: "gospel_in_daily_life", prompt: "The Gospel is not for Sunday only. Let one Gospel sentence shape one real choice today." },
  { theme: "gospel_in_daily_life", prompt: "Christ met people at wells and roadsides — meet him at your desk, your sink, your screen." },
];

// Stable pseudo-random index from a string seed and day-of-year.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

function dayOfYear(d = new Date()): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const now = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor((now - start) / 86400000);
}

export interface MiddayRotationPick {
  scripture: MiddayScripture;
  saint: MiddaySaintSeed;
  reflection: MiddayReflectionSeed;
  focusTheme: MiddayTheme;
}

export function pickMiddayRotation(opts: {
  userId: string;
  date?: Date;
  avoidRefs?: string[];
  avoidSaintKeys?: string[];
  avoidThemes?: string[];
}): MiddayRotationPick {
  const { userId, date, avoidRefs = [], avoidSaintKeys = [], avoidThemes = [] } = opts;
  const offset = hashSeed(userId || "anon");
  const day = dayOfYear(date);

  const scrIdx = (day + offset) % MIDDAY_SCRIPTURES.length;
  const saintIdx = (day * 7 + (offset >>> 3)) % MIDDAY_SAINTS.length;
  const reflIdx = (day * 11 + (offset >>> 5)) % MIDDAY_REFLECTIONS.length;

  // Try to walk forward a few steps if we land on a recently-used ref/saint/theme.
  let scripture = MIDDAY_SCRIPTURES[scrIdx];
  for (let i = 1; i <= 6; i++) {
    if (!avoidRefs.includes(scripture.ref) && !scripture.themes.every((t) => avoidThemes.includes(t))) break;
    scripture = MIDDAY_SCRIPTURES[(scrIdx + i) % MIDDAY_SCRIPTURES.length];
  }
  let saint = MIDDAY_SAINTS[saintIdx];
  for (let i = 1; i <= 6; i++) {
    if (!avoidSaintKeys.includes(saint.key)) break;
    saint = MIDDAY_SAINTS[(saintIdx + i) % MIDDAY_SAINTS.length];
  }
  const reflection = MIDDAY_REFLECTIONS[reflIdx];
  const focusTheme = scripture.themes[0] ?? reflection.theme;

  return { scripture, saint, reflection, focusTheme };
}
