/**
 * Mood-matched Scripture library.
 * Curated, devotional, deliberately ranging beyond the Psalms — Isaiah, the
 * Gospels, Pauline letters, Lamentations, Jeremiah, 1 Peter, 2 Corinthians, etc.
 *
 * `getVerseForMood` is deterministic per-day so the same verse stays with the
 * user through the day, then quietly changes overnight.
 */

export type Mood =
  | 'peaceful'
  | 'grateful'
  | 'struggling'
  | 'anxious'
  | 'joyful'
  | 'lonely'
  | 'lost'
  | 'neutral';

export interface ScriptureVerse {
  ref: string;
  text: string;
  theme: string;
}

const VERSES: Record<Mood, ScriptureVerse[]> = {
  peaceful: [
    { ref: 'John 14:27', text: 'Peace I leave with you; my peace I give to you. Not as the world gives do I give it to you. Do not let your hearts be troubled or afraid.', theme: 'peace' },
    { ref: 'Philippians 4:7', text: 'Then the peace of God that surpasses all understanding will guard your hearts and minds in Christ Jesus.', theme: 'peace' },
    { ref: 'Isaiah 26:3', text: 'A nation of firm purpose you keep in peace; in peace, for its trust in you.', theme: 'trust' },
    { ref: 'Psalm 23:2–3', text: 'In green pastures he makes me lie down; to still waters he leads me; he restores my soul.', theme: 'rest' },
    { ref: 'Matthew 11:28', text: 'Come to me, all you who labor and are burdened, and I will give you rest.', theme: 'rest' },
    { ref: '2 Thessalonians 3:16', text: 'May the Lord of peace himself give you peace at all times and in every way.', theme: 'peace' },
  ],
  grateful: [
    { ref: '1 Thessalonians 5:18', text: 'In all circumstances give thanks, for this is the will of God for you in Christ Jesus.', theme: 'gratitude' },
    { ref: 'Psalm 100:4', text: 'Enter his gates with thanksgiving, his courts with praise. Give thanks to him; bless his name.', theme: 'gratitude' },
    { ref: 'Colossians 3:17', text: 'And whatever you do, in word or in deed, do everything in the name of the Lord Jesus, giving thanks to God the Father through him.', theme: 'gratitude' },
    { ref: 'James 1:17', text: 'All good giving and every perfect gift is from above, coming down from the Father of lights.', theme: 'gift' },
    { ref: 'Psalm 107:1', text: 'Give thanks to the Lord, for he is good; his mercy endures forever.', theme: 'mercy' },
    { ref: 'Ephesians 5:20', text: 'Giving thanks always and for everything in the name of our Lord Jesus Christ to God the Father.', theme: 'gratitude' },
  ],
  struggling: [
    { ref: '2 Corinthians 12:9', text: 'My grace is sufficient for you, for power is made perfect in weakness.', theme: 'grace' },
    { ref: 'Romans 8:28', text: 'We know that all things work for good for those who love God.', theme: 'hope' },
    { ref: 'Isaiah 41:10', text: 'Do not fear: I am with you; do not be anxious: I am your God. I will strengthen you, I will help you, I will uphold you with my victorious right hand.', theme: 'strength' },
    { ref: 'Psalm 34:18', text: 'The Lord is close to the brokenhearted, saves those whose spirit is crushed.', theme: 'comfort' },
    { ref: 'Lamentations 3:22–23', text: "The Lord's acts of mercy are not exhausted, his compassion is not spent; they are renewed each morning — great is your faithfulness!", theme: 'mercy' },
    { ref: '1 Peter 5:7', text: 'Cast all your worries upon him because he cares for you.', theme: 'trust' },
    { ref: 'Romans 5:3–4', text: 'Affliction produces endurance, and endurance, proven character, and proven character, hope.', theme: 'endurance' },
  ],
  anxious: [
    { ref: 'Philippians 4:6–7', text: 'Have no anxiety at all, but in everything, by prayer and petition, with thanksgiving, make your requests known to God. Then the peace of God that surpasses all understanding will guard your hearts and minds.', theme: 'peace' },
    { ref: 'Matthew 6:34', text: 'Do not worry about tomorrow; tomorrow will take care of itself. Sufficient for a day is its own evil.', theme: 'today' },
    { ref: 'John 14:1', text: 'Do not let your hearts be troubled. You have faith in God; have faith also in me.', theme: 'faith' },
    { ref: 'Isaiah 43:1', text: 'Do not fear, for I have redeemed you; I have called you by name: you are mine.', theme: 'belonging' },
    { ref: 'Psalm 56:3', text: 'When I am afraid, in you I place my trust.', theme: 'trust' },
    { ref: 'Deuteronomy 31:6', text: 'Be strong and steadfast; have no fear or dread of them, for it is the Lord, your God, who marches with you.', theme: 'courage' },
  ],
  joyful: [
    { ref: 'Psalm 118:24', text: 'This is the day the Lord has made; let us rejoice in it and be glad.', theme: 'joy' },
    { ref: 'Philippians 4:4', text: 'Rejoice in the Lord always. I shall say it again: rejoice!', theme: 'joy' },
    { ref: 'Nehemiah 8:10', text: 'The joy of the Lord is your strength.', theme: 'strength' },
    { ref: 'John 15:11', text: 'I have told you this so that my joy may be in you and your joy may be complete.', theme: 'fullness' },
    { ref: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace in believing.', theme: 'hope' },
    { ref: 'Isaiah 12:3', text: 'With joy you will draw water at the fountain of salvation.', theme: 'joy' },
  ],
  lonely: [
    { ref: 'Hebrews 13:5', text: 'I will never forsake you or abandon you.', theme: 'presence' },
    { ref: 'Matthew 28:20', text: 'And behold, I am with you always, until the end of the age.', theme: 'presence' },
    { ref: 'Psalm 139:7–8', text: 'Where can I go from your spirit? From your presence, where can I flee? If I ascend to the heavens, you are there; if I lie down in Sheol, there you are.', theme: 'presence' },
    { ref: 'Isaiah 49:15', text: 'Can a mother forget her infant, be without tenderness for the child of her womb? Even should she forget, I will never forget you.', theme: 'love' },
    { ref: 'Psalm 27:10', text: 'Even if my father and mother forsake me, the Lord will take me in.', theme: 'belonging' },
    { ref: 'John 14:18', text: 'I will not leave you orphans; I will come to you.', theme: 'presence' },
  ],
  lost: [
    { ref: 'Jeremiah 29:11', text: 'For I know well the plans I have in mind for you — plans for your welfare and not for woe, to give you a future of hope.', theme: 'hope' },
    { ref: 'Proverbs 3:5–6', text: 'Trust in the Lord with all your heart, on your own intelligence do not rely; in all your ways be mindful of him, and he will make straight your paths.', theme: 'guidance' },
    { ref: 'Luke 15:4', text: 'What man among you having a hundred sheep and losing one of them would not leave the ninety-nine in the desert and go after the lost one?', theme: 'sought' },
    { ref: 'Psalm 119:105', text: 'Your word is a lamp for my feet, a light for my path.', theme: 'guidance' },
    { ref: 'Isaiah 30:21', text: 'And your ears shall hear a word behind you: "This is the way; walk in it," when you would turn to the right or the left.', theme: 'guidance' },
    { ref: 'John 14:6', text: 'I am the way and the truth and the life.', theme: 'way' },
  ],
  neutral: [
    { ref: 'Psalm 46:10', text: 'Be still and know that I am God.', theme: 'stillness' },
    { ref: 'Lamentations 3:25', text: 'The Lord is good to those who trust in him, to the one that seeks him.', theme: 'trust' },
    { ref: '1 Peter 5:10', text: 'The God of all grace who called you to his eternal glory through Christ Jesus will himself, after you have suffered a little, restore, confirm, strengthen, and establish you.', theme: 'restoration' },
    { ref: 'Psalm 16:11', text: 'You will show me the path to life, abounding joy in your presence, the delights at your right hand forever.', theme: 'path' },
    { ref: 'Isaiah 40:31', text: 'They that hope in the Lord will renew their strength, they will soar on eagles\u2019 wings.', theme: 'renewal' },
    { ref: 'Micah 6:8', text: 'Only to do justice and to love goodness, and to walk humbly with your God.', theme: 'walk' },
  ],
};

/** Map any incoming label (e.g. journal mood) onto our internal palette. */
export function normalizeMood(input?: string | null): Mood {
  if (!input) return 'neutral';
  const m = input.toLowerCase();
  if (m.includes('peace')) return 'peaceful';
  if (m.includes('grate') || m.includes('thank')) return 'grateful';
  if (m.includes('struggl') || m.includes('sad') || m.includes('hurt') || m.includes('grief')) return 'struggling';
  if (m.includes('anx') || m.includes('worry') || m.includes('fear') || m.includes('stress')) return 'anxious';
  if (m.includes('joy') || m.includes('happy') || m.includes('glad')) return 'joyful';
  if (m.includes('lone') || m.includes('alone') || m.includes('isolat')) return 'lonely';
  if (m.includes('lost') || m.includes('confus') || m.includes('search')) return 'lost';
  return 'neutral';
}

/** Stable day-of-year hash so the verse stays put through the day. */
function dayHash(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((+date - +start) / 86_400_000);
}

export function getVerseForMood(mood?: string | null, date = new Date()): ScriptureVerse {
  const m = normalizeMood(mood);
  const list = VERSES[m];
  return list[dayHash(date) % list.length];
}

export function getVerseForLatestEntry(
  entries: Array<{ mood?: string | null; created_at: string }> | undefined,
  date = new Date(),
): ScriptureVerse {
  const latest = entries?.find((e) => e.mood);
  return getVerseForMood(latest?.mood ?? 'neutral', date);
}
