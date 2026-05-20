/**
 * Mood-matched Saint quotes and brief prayers.
 * Companion to scriptureByMood — together they form the post-journal reflection.
 */

import { normalizeMood, type Mood } from './scriptureByMood';

export interface SaintQuote {
  saint: string;
  text: string;
}

export interface BriefPrayer {
  title: string;
  text: string;
}

const SAINT_QUOTES: Record<Mood, SaintQuote[]> = {
  peaceful: [
    { saint: 'St. Francis de Sales', text: 'Do not lose your inward peace for anything whatsoever, even if your whole world seems upset.' },
    { saint: 'St. Teresa of Ávila', text: 'Let nothing disturb you. Let nothing frighten you. All things pass. God does not change.' },
    { saint: 'St. John of the Cross', text: 'In the evening of life, we shall be judged on love alone.' },
  ],
  grateful: [
    { saint: 'St. Ambrose', text: 'No duty is more urgent than that of returning thanks.' },
    { saint: 'St. Gianna Molla', text: 'The secret of happiness is to live moment by moment and to thank God for all that He, in His goodness, sends to us day after day.' },
    { saint: 'St. Thérèse of Lisieux', text: 'Everything is a grace, everything is the direct effect of our Father’s love.' },
  ],
  struggling: [
    { saint: 'St. Padre Pio', text: 'Pray, hope, and don’t worry. Worry is useless. God is merciful and will hear your prayer.' },
    { saint: 'St. Augustine', text: 'God is closer to us than we are to ourselves.' },
    { saint: 'St. Faustina', text: 'When it seems to us that our suffering exceeds our strength, let us contemplate Christ’s wounds.' },
  ],
  anxious: [
    { saint: 'St. Francis de Sales', text: 'Have patience with all things, but first of all with yourself.' },
    { saint: 'St. Pio of Pietrelcina', text: 'My past, O Lord, to Your mercy; my present, to Your love; my future, to Your providence.' },
    { saint: 'St. Catherine of Siena', text: 'All the way to heaven is heaven, because Jesus said, “I am the Way.”' },
  ],
  joyful: [
    { saint: 'St. Teresa of Calcutta', text: 'Joy is a net of love by which you can catch souls.' },
    { saint: 'St. Philip Neri', text: 'A glad spirit attains to perfection more quickly than any other.' },
    { saint: 'St. John Paul II', text: 'Do not abandon yourselves to despair. We are the Easter people and hallelujah is our song.' },
  ],
  lonely: [
    { saint: 'St. Teresa of Calcutta', text: 'Loneliness and the feeling of being unwanted is the most terrible poverty. We must be the love of God in action.' },
    { saint: 'St. Augustine', text: 'You have made us for Yourself, O Lord, and our hearts are restless until they rest in You.' },
    { saint: 'St. Thérèse of Lisieux', text: 'I am not alone — Jesus is with me, and where He is, there is heaven.' },
  ],
  lost: [
    { saint: 'St. John Henry Newman', text: 'Lead, kindly Light, amid the encircling gloom, lead Thou me on.' },
    { saint: 'St. Ignatius of Loyola', text: 'Go forth and set the world on fire.' },
    { saint: 'St. Augustine', text: 'Late have I loved You, O Beauty ever ancient, ever new — late have I loved You.' },
  ],
  neutral: [
    { saint: 'St. Thérèse of Lisieux', text: 'Miss nothing… make use of every little thing as if it were of great importance.' },
    { saint: 'St. Francis de Sales', text: 'Be who you are and be that well.' },
    { saint: 'St. Josemaría Escrivá', text: 'Do everything for Love. Thus there will be no little things: everything will be big.' },
  ],
};

const BRIEF_PRAYERS: Record<Mood, BriefPrayer[]> = {
  peaceful: [
    { title: 'A Prayer of Stillness', text: 'Lord, keep me in this quiet you have given. Let my heart rest in You, and my breath be a gentle thanksgiving. Amen.' },
  ],
  grateful: [
    { title: 'A Prayer of Thanksgiving', text: 'Father, every good gift comes from You. Thank You for the small mercies of this day. Make my whole life a quiet Te Deum. Amen.' },
  ],
  struggling: [
    { title: 'A Prayer in Difficulty', text: 'Lord Jesus, You know the weight I carry. Walk with me through it. Where I cannot see, You see. Where I am weak, be my strength. Amen.' },
  ],
  anxious: [
    { title: 'A Prayer Against Anxiety', text: 'Jesus, I cast my cares upon You. Quiet what I cannot control. Lead me into the peace that surpasses understanding. Amen.' },
  ],
  joyful: [
    { title: 'A Prayer of Joy', text: 'Lord, my soul magnifies You. Keep this joy holy — rooted not in circumstance, but in Your love. Let it overflow to others. Amen.' },
  ],
  lonely: [
    { title: 'A Prayer in Loneliness', text: 'Jesus, You who were abandoned in the garden, abide with me now. Let me know in my bones that I am seen, named, and loved. Amen.' },
  ],
  lost: [
    { title: 'A Prayer for Guidance', text: 'Holy Spirit, lead me in the next small step. I do not need to see the whole road — only the place to put my foot. Amen.' },
  ],
  neutral: [
    { title: 'A Simple Offering', text: 'Lord, I offer You this day — what I have done, what I have left undone, and what is still before me. Sanctify it all. Amen.' },
  ],
};

function dayHash(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((+date - +start) / 86_400_000);
}

export function getSaintQuoteForMood(mood?: string | null, date = new Date()): SaintQuote {
  const m = normalizeMood(mood);
  const list = SAINT_QUOTES[m];
  return list[dayHash(date) % list.length];
}

export function getBriefPrayerForMood(mood?: string | null, date = new Date()): BriefPrayer {
  const m = normalizeMood(mood);
  const list = BRIEF_PRAYERS[m];
  return list[dayHash(date) % list.length];
}
