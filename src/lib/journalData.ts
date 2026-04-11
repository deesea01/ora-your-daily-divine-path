export interface ExamenStep {
  number: number;
  name: string;
  title: string;
  description: string;
  prompts: string[];
}

export const EXAMEN_STEPS: ExamenStep[] = [
  {
    number: 1,
    name: 'presence',
    title: 'Become Aware of God\'s Presence',
    description: 'Place yourself in the presence of the Lord. He is here, now, with you.',
    prompts: [
      'Where did I notice God today?',
      'When did I feel closest to the Lord?',
      'Where did grace appear unexpectedly?',
      'In what moment did I sense God speaking to my heart?',
    ],
  },
  {
    number: 2,
    name: 'gratitude',
    title: 'Review the Day with Gratitude',
    description: 'Walk through your day and notice the gifts God has given you.',
    prompts: [
      'What am I most thankful for today?',
      'What gift did God give me today?',
      'Who blessed me today?',
      'What small mercy went unnoticed until now?',
    ],
  },
  {
    number: 3,
    name: 'failures',
    title: 'Notice Failures and Resistance',
    description: 'With honesty and gentleness, look at where you fell short.',
    prompts: [
      'Where did I resist grace today?',
      'Where was I impatient, prideful, fearful, or uncharitable?',
      'What do I need to bring to God with honesty?',
      'When did I choose my will over God\'s?',
    ],
  },
  {
    number: 4,
    name: 'mercy',
    title: 'Receive Mercy',
    description: 'Let the Lord\'s mercy wash over your failures. He loves you still.',
    prompts: [
      'What do I need forgiveness for?',
      'Can I entrust this to Christ now?',
      'What truth do I need to remember about God\'s mercy?',
      'How does God see me in this moment?',
    ],
  },
  {
    number: 5,
    name: 'tomorrow',
    title: 'Look Toward Tomorrow',
    description: 'With hope and trust, place tomorrow in the Lord\'s hands.',
    prompts: [
      'Where do I need strength tomorrow?',
      'What virtue do I want to practice?',
      'What intention do I want to place before the Lord?',
      'What is God inviting me into?',
    ],
  },
];

export interface JournalPrompt {
  text: string;
  category: string;
}

export const JOURNAL_PROMPT_CATEGORIES = [
  'Gratitude', 'Suffering', 'Temptation', 'Vocational Discernment',
  'Marriage & Family', 'Masculinity & Virtue', 'Trust in God',
  'Fear & Surrender', 'Healing', 'Hope', 'Charity', 'Repentance',
  'Spiritual Dryness', 'Peace After Confession', 'Growth in Discipline',
];

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  { text: 'What are three things God gave me today that I didn\'t earn?', category: 'Gratitude' },
  { text: 'Where did I see beauty today that pointed me to the Creator?', category: 'Gratitude' },
  { text: 'Who in my life am I most grateful for right now, and why?', category: 'Gratitude' },
  { text: 'What suffering am I carrying right now, and can I offer it to Christ?', category: 'Suffering' },
  { text: 'How is God using this trial to shape me?', category: 'Suffering' },
  { text: 'What cross am I avoiding that God is asking me to pick up?', category: 'Suffering' },
  { text: 'What temptation keeps returning, and what does it reveal about my desires?', category: 'Temptation' },
  { text: 'Where am I most vulnerable to sin right now?', category: 'Temptation' },
  { text: 'What truth from Scripture can I cling to when tempted?', category: 'Temptation' },
  { text: 'What is God calling me to in this season of my life?', category: 'Vocational Discernment' },
  { text: 'If I had no fear, what would I do for God?', category: 'Vocational Discernment' },
  { text: 'Where do I feel most alive and purposeful?', category: 'Vocational Discernment' },
  { text: 'How am I loving my spouse or family today? Where am I falling short?', category: 'Marriage & Family' },
  { text: 'What does my family need from me spiritually right now?', category: 'Marriage & Family' },
  { text: 'How can I lead my family closer to Christ this week?', category: 'Marriage & Family' },
  { text: 'What does it mean to be a man of God in my current circumstances?', category: 'Masculinity & Virtue' },
  { text: 'Where do I need more courage, discipline, or gentleness?', category: 'Masculinity & Virtue' },
  { text: 'Which virtue is God asking me to grow in right now?', category: 'Masculinity & Virtue' },
  { text: 'What am I holding onto that God is asking me to release?', category: 'Trust in God' },
  { text: 'Where do I struggle most to trust God\'s plan?', category: 'Trust in God' },
  { text: 'What would change if I truly believed God is in control?', category: 'Trust in God' },
  { text: 'What am I afraid of right now, and can I name it before God?', category: 'Fear & Surrender' },
  { text: 'What would surrender look like in my current situation?', category: 'Fear & Surrender' },
  { text: 'Lord, what are You asking me to let go of?', category: 'Fear & Surrender' },
  { text: 'What wound am I carrying that I need to bring to Jesus?', category: 'Healing' },
  { text: 'Where do I need God\'s healing touch in my life?', category: 'Healing' },
  { text: 'Can I forgive someone who has hurt me, even if it\'s hard?', category: 'Healing' },
  { text: 'What gives me hope today, even in difficulty?', category: 'Hope' },
  { text: 'What promise of God can I hold onto right now?', category: 'Hope' },
  { text: 'Where do I see resurrection and new life breaking through?', category: 'Hope' },
  { text: 'Who in my life needs my help, and am I responding?', category: 'Charity' },
  { text: 'How can I love my neighbor more concretely today?', category: 'Charity' },
  { text: 'Where is God asking me to be generous?', category: 'Charity' },
  { text: 'What sin do I keep returning to? What does it reveal about my heart?', category: 'Repentance' },
  { text: 'Am I truly sorry, or just sorry I got caught?', category: 'Repentance' },
  { text: 'What does genuine conversion look like for me right now?', category: 'Repentance' },
  { text: 'God feels distant. What might He be teaching me in the silence?', category: 'Spiritual Dryness' },
  { text: 'Can I remain faithful in prayer even when I feel nothing?', category: 'Spiritual Dryness' },
  { text: 'What saints experienced dryness, and what can I learn from them?', category: 'Spiritual Dryness' },
  { text: 'How do I feel after my last confession? What grace did I receive?', category: 'Peace After Confession' },
  { text: 'What truth about God\'s mercy became clearer through reconciliation?', category: 'Peace After Confession' },
  { text: 'What habit or discipline is God inviting me to build?', category: 'Growth in Discipline' },
  { text: 'Where have I been lazy in my spiritual life?', category: 'Growth in Discipline' },
  { text: 'What small daily commitment can I make to grow closer to God?', category: 'Growth in Discipline' },
];

export const EMOTIONAL_STATES = [
  { key: 'peaceful', emoji: '☮️', label: 'Peaceful' },
  { key: 'joyful', emoji: '😊', label: 'Joyful' },
  { key: 'grateful', emoji: '🙏', label: 'Grateful' },
  { key: 'anxious', emoji: '😰', label: 'Anxious' },
  { key: 'sad', emoji: '😢', label: 'Sad' },
  { key: 'angry', emoji: '😤', label: 'Angry' },
  { key: 'hopeful', emoji: '🌱', label: 'Hopeful' },
  { key: 'restless', emoji: '💭', label: 'Restless' },
  { key: 'consoled', emoji: '💛', label: 'Consoled' },
  { key: 'dry', emoji: '🏜️', label: 'Spiritually Dry' },
];

export const SPIRITUAL_STATES = [
  { key: 'close_to_god', emoji: '✝️', label: 'Close to God' },
  { key: 'seeking', emoji: '🔍', label: 'Seeking' },
  { key: 'struggling', emoji: '⚡', label: 'Struggling' },
  { key: 'growing', emoji: '🌿', label: 'Growing' },
  { key: 'surrendered', emoji: '🕊️', label: 'Surrendered' },
  { key: 'distant', emoji: '🌫️', label: 'Distant' },
  { key: 'convicted', emoji: '🔥', label: 'Convicted' },
  { key: 'at_peace', emoji: '☮️', label: 'At Peace' },
];

export function getDailyPrompt(): JournalPrompt {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return JOURNAL_PROMPTS[dayOfYear % JOURNAL_PROMPTS.length];
}
