// Deterministic personalized devotional plan generator.
// Translates onboarding answers into a concrete plan of prayers, a saint companion,
// scripture anchor, confession cadence, daily routine, and journal prompts.

export interface DevotionalPlanInputs {
  goals: string[];
  stage: string;
  burdens: string[];
  styles: string[];
  commitment: string; // '5' | '10' | '20' | 'deep'
}

export interface PlanPrayer {
  prayer_id: string;
  title: string;
  reason: string;
  slot: 'morning' | 'midday' | 'evening' | 'anytime';
}

export interface PlanRoutine {
  morning: string;
  midday: string;
  evening: string;
}

export interface DevotionalPlan {
  generated_at: string;
  version: number;
  saint: { key: string; name: string; reason: string };
  prayers: PlanPrayer[];
  scripture: { ref: string; text: string; reason: string };
  confession_cadence: { label: string; interval_days: number; reason: string };
  routine: PlanRoutine;
  journal_prompts: string[];
  daily_focus: { goal: string; label: string };
  daily_prayer_goal: number;
}

const SAINTS: Record<string, { name: string; specialty: string[] }> = {
  st_francis: { name: 'St. Francis of Assisi', specialty: ['peace', 'gratitude', 'anxiety', 'simplicity'] },
  st_augustine: { name: 'St. Augustine', specialty: ['lust', 'forgiveness', 'return_to_faith', 'doubt'] },
  st_thomas_aquinas: { name: 'St. Thomas Aquinas', specialty: ['discernment', 'doubt', 'guidance', 'vocation'] },
  st_teresa: { name: 'St. Teresa of Ávila', specialty: ['prayer_habit', 'devotion', 'contemplative'] },
  st_michael: { name: 'St. Michael the Archangel', specialty: ['overcoming_temptation', 'anger', 'burnout', 'protection'] },
  st_padre_pio: { name: 'St. Padre Pio', specialty: ['grief', 'healing', 'loneliness', 'suffering'] },
  st_joan_of_arc: { name: 'St. Joan of Arc', specialty: ['purpose', 'vocation', 'discernment', 'family'] },
};

function pickSaint(goals: string[], burdens: string[]): { key: string; name: string; reason: string } {
  const tags = [...goals, ...burdens];
  if (burdens.includes('anxiety') || goals.includes('peace'))
    return { key: 'st_francis', name: SAINTS.st_francis.name, reason: 'A companion of peace, simplicity, and trust in God through creation.' };
  if (burdens.includes('lust') || burdens.includes('forgiveness') || goals.includes('return_to_faith'))
    return { key: 'st_augustine', name: SAINTS.st_augustine.name, reason: 'A restless heart turned toward God — he understands your road.' };
  if (goals.includes('discernment') || burdens.includes('vocation') || burdens.includes('doubt'))
    return { key: 'st_thomas_aquinas', name: SAINTS.st_thomas_aquinas.name, reason: 'Clarity, reason, and quiet wisdom for the path ahead.' };
  if (burdens.includes('grief') || goals.includes('grief') || burdens.includes('loneliness') || goals.includes('healing'))
    return { key: 'st_padre_pio', name: SAINTS.st_padre_pio.name, reason: 'A friend in suffering who points always to mercy.' };
  if (goals.includes('overcoming_temptation') || burdens.includes('anger') || burdens.includes('burnout'))
    return { key: 'st_michael', name: SAINTS.st_michael.name, reason: 'Courage and protection in spiritual battle.' };
  if (goals.includes('devotion') || goals.includes('prayer_habit'))
    return { key: 'st_teresa', name: SAINTS.st_teresa.name, reason: 'A teacher of interior prayer and steady devotion.' };
  if (goals.includes('purpose') || goals.includes('family'))
    return { key: 'st_joan_of_arc', name: SAINTS.st_joan_of_arc.name, reason: 'Holy boldness for the mission God places before you.' };
  if (tags.length === 0)
    return { key: 'st_teresa', name: SAINTS.st_teresa.name, reason: 'A gentle teacher of interior prayer to begin your path.' };
  return { key: 'st_francis', name: SAINTS.st_francis.name, reason: 'A gentle companion to begin your devotional path.' };
}

function pickScripture(goals: string[], burdens: string[]): { ref: string; text: string; reason: string } {
  if (burdens.includes('anxiety')) return { ref: 'Psalm 23', text: 'The Lord is my shepherd; I shall not want.', reason: 'For the anxious heart that needs to be led beside still waters.' };
  if (burdens.includes('grief')) return { ref: 'Matthew 5:4', text: 'Blessed are those who mourn, for they shall be comforted.', reason: 'A promise to hold while you carry your loss.' };
  if (burdens.includes('loneliness')) return { ref: 'Deuteronomy 31:6', text: 'He will not leave you nor forsake you.', reason: 'A reminder that you are never truly alone.' };
  if (burdens.includes('lust') || burdens.includes('overcoming_temptation')) return { ref: '1 Corinthians 10:13', text: 'God is faithful, and will not let you be tempted beyond your strength.', reason: 'Strength for the daily struggle, with a way of escape.' };
  if (burdens.includes('forgiveness')) return { ref: 'Ephesians 4:32', text: 'Be kind to one another, forgiving one another, as God in Christ forgave you.', reason: 'A pattern for the forgiveness you are seeking or offering.' };
  if (goals.includes('gratitude')) return { ref: '1 Thessalonians 5:18', text: 'Give thanks in all circumstances.', reason: 'A daily anchor for the grateful heart.' };
  if (goals.includes('discernment') || goals.includes('guidance')) return { ref: 'Proverbs 3:5–6', text: 'Trust in the Lord with all your heart, and lean not on your own understanding.', reason: 'A compass for the decisions ahead.' };
  if (goals.includes('healing')) return { ref: 'Psalm 147:3', text: 'He heals the brokenhearted and binds up their wounds.', reason: 'For the healing only God can give.' };
  if (goals.includes('return_to_faith')) return { ref: 'Luke 15:20', text: 'While he was yet at a distance, his father saw him and had compassion, and ran.', reason: 'For the road home — the Father is already running.' };
  return { ref: 'Psalm 46:10', text: 'Be still, and know that I am God.', reason: 'A daily invitation into stillness with God.' };
}

function pickPrayers(goals: string[], burdens: string[], styles: string[], commitment: string): PlanPrayer[] {
  const out: PlanPrayer[] = [];
  const has = (arr: string[], v: string) => arr.includes(v);

  // Always-on morning anchor
  out.push({ prayer_id: 'morning_offering', title: 'Morning Offering', reason: 'A gentle daily start — give the day to God.', slot: 'morning' });

  // Style-driven core
  if (has(styles, 'rosary') || has(goals, 'devotion') || has(goals, 'peace')) {
    out.push({ prayer_id: 'hail_holy_queen', title: 'Hail Holy Queen', reason: 'A Marian anchor for those drawn to the Rosary.', slot: 'anytime' });
  }
  if (has(styles, 'contemplative') || has(styles, 'scripture')) {
    out.push({ prayer_id: 'come_holy_spirit', title: 'Come Holy Spirit', reason: 'Open your heart to listen before scripture or silent prayer.', slot: 'anytime' });
  }
  if (has(styles, 'structured')) {
    out.push({ prayer_id: 'apostles_creed', title: 'The Apostles\' Creed', reason: 'A daily profession of faith for a structured rhythm.', slot: 'morning' });
  }

  // Burden-driven
  if (has(burdens, 'anxiety') || has(goals, 'peace')) {
    out.push({ prayer_id: 'anima_christi', title: 'Anima Christi', reason: 'A quieting prayer when anxiety rises.', slot: 'anytime' });
  }
  if (has(burdens, 'overcoming_temptation') || has(goals, 'overcoming_temptation') || has(burdens, 'lust') || has(burdens, 'anger')) {
    out.push({ prayer_id: 'st_michael_prayer', title: 'Prayer to St. Michael', reason: 'Spiritual protection in moments of struggle.', slot: 'anytime' });
  }
  if (has(burdens, 'forgiveness') || has(goals, 'return_to_faith')) {
    out.push({ prayer_id: 'act_of_contrition', title: 'Act of Contrition', reason: 'A simple, honest prayer of return to God.', slot: 'evening' });
  }
  if (has(burdens, 'grief') || has(goals, 'grief')) {
    out.push({ prayer_id: 'prayer_for_the_dead', title: 'Prayer for the Dead', reason: 'A way to hold those you have lost.', slot: 'anytime' });
  }
  if (has(burdens, 'marriage') || has(burdens, 'parenting') || has(goals, 'family')) {
    out.push({ prayer_id: 'prayer_family', title: 'Prayer for the Family', reason: 'For the people closest to you.', slot: 'evening' });
  }
  if (has(goals, 'discernment') || has(burdens, 'vocation')) {
    out.push({ prayer_id: 'prayer_discernment', title: 'Prayer for Discernment', reason: 'Clarity for the decisions you are weighing.', slot: 'morning' });
  }
  if (has(burdens, 'burnout') || has(goals, 'guidance')) {
    out.push({ prayer_id: 'prayer_strength', title: 'Prayer for Strength', reason: 'For the days that ask more than you have.', slot: 'morning' });
  }

  // Evening anchor for deeper commitments
  if (commitment === '10' || commitment === '20' || commitment === 'deep' || has(styles, 'examen')) {
    out.push({ prayer_id: 'examination_prayer', title: 'Daily Examen', reason: 'An evening review with God — the Ignatian rhythm.', slot: 'evening' });
  }
  if (commitment === '20' || commitment === 'deep') {
    out.push({ prayer_id: 'evening_prayer', title: 'Evening Prayer', reason: 'A closing of the day in God\'s presence.', slot: 'evening' });
  }
  if (commitment === 'deep') {
    out.push({ prayer_id: 'angelus', title: 'The Angelus', reason: 'A midday pause to remember the Incarnation.', slot: 'midday' });
  }

  // De-duplicate by prayer_id, cap to a manageable number
  const seen = new Set<string>();
  const cap = commitment === '5' ? 3 : commitment === '10' ? 5 : commitment === '20' ? 7 : 9;
  return out.filter((p) => (seen.has(p.prayer_id) ? false : (seen.add(p.prayer_id), true))).slice(0, cap);
}

function pickConfessionCadence(burdens: string[], stage: string): { label: string; interval_days: number; reason: string } {
  const heavy = burdens.includes('lust') || burdens.includes('anger') || burdens.includes('forgiveness');
  if (heavy) return { label: 'Every 2 weeks', interval_days: 14, reason: 'A gentle, frequent rhythm for the struggles you carry.' };
  if (stage === 'deep' || stage === 'regularly') return { label: 'Monthly', interval_days: 30, reason: 'A steady monthly cadence for an established prayer life.' };
  if (stage === 'exploring' || stage === 'returning') return { label: 'Every 6–8 weeks', interval_days: 50, reason: 'A welcoming rhythm as you find your footing.' };
  return { label: 'Monthly', interval_days: 30, reason: 'A traditional monthly cadence — the saints\' suggestion.' };
}

function pickRoutine(commitment: string, styles: string[]): PlanRoutine {
  const morning = styles.includes('structured')
    ? 'Sign of the Cross · Morning Offering · brief intention'
    : 'A quiet breath, the Morning Offering, and one intention for the day.';
  const midday = commitment === 'deep'
    ? 'The Angelus or a moment of recollection.'
    : commitment === '20'
    ? 'A 1-minute pause: breathe, recall God\'s presence.'
    : 'Optional — a single breath of recollection if you can.';
  const evening = styles.includes('examen') || commitment !== '5'
    ? 'A short Examen: gratitude, review, sorrow, hope.'
    : 'A simple thank-you and a Sign of the Cross before sleep.';
  return { morning, midday, evening };
}

function pickJournalPrompts(goals: string[], burdens: string[]): string[] {
  const prompts: string[] = [];
  if (burdens.includes('anxiety')) prompts.push('What am I afraid of right now, and where might God be in it?');
  if (burdens.includes('grief')) prompts.push('Who or what am I grieving, and what would I say to God about them today?');
  if (burdens.includes('loneliness')) prompts.push('Where did I feel known or seen today — even slightly?');
  if (burdens.includes('forgiveness')) prompts.push('Is there someone I am holding something against? What would mercy look like?');
  if (burdens.includes('lust') || goals.includes('overcoming_temptation')) prompts.push('What was I really longing for when I was most tempted today?');
  if (goals.includes('gratitude')) prompts.push('Name three small graces from today.');
  if (goals.includes('discernment') || goals.includes('guidance')) prompts.push('What is the next small step I sense God inviting?');
  if (goals.includes('healing')) prompts.push('Where do I most need healing right now?');
  if (goals.includes('return_to_faith')) prompts.push('What first drew me to God? What is drawing me back now?');
  // Always include the Examen anchors
  prompts.push('Where did I feel close to God today?');
  prompts.push('Where did I resist God today?');
  // De-dupe & cap at 5
  return Array.from(new Set(prompts)).slice(0, 5);
}

const GOAL_LABELS: Record<string, string> = {
  peace: 'Peace',
  prayer_habit: 'Stronger prayer habit',
  healing: 'Healing',
  guidance: 'Guidance',
  overcoming_temptation: 'Overcoming temptation',
  gratitude: 'Gratitude',
  devotion: 'Deeper Catholic devotion',
  return_to_faith: 'Return to faith',
  grief: 'Help through grief',
  discernment: 'Discernment',
  family: 'Marriage / family growth',
  purpose: 'Purpose',
};

const COMMITMENT_GOAL: Record<string, number> = { '5': 1, '10': 2, '20': 3, deep: 4 };

export function buildDevotionalPlan(inputs: DevotionalPlanInputs): DevotionalPlan {
  const { goals, stage, burdens, styles, commitment } = inputs;
  const saint = pickSaint(goals, burdens);
  const scripture = pickScripture(goals, burdens);
  const prayers = pickPrayers(goals, burdens, styles, commitment);
  const confession_cadence = pickConfessionCadence(burdens, stage);
  const routine = pickRoutine(commitment, styles);
  const journal_prompts = pickJournalPrompts(goals, burdens);
  const topGoal = goals[0] ?? 'devotion';
  return {
    generated_at: new Date().toISOString(),
    version: 1,
    saint,
    prayers,
    scripture,
    confession_cadence,
    routine,
    journal_prompts,
    daily_focus: { goal: topGoal, label: GOAL_LABELS[topGoal] ?? 'A deeper prayer life' },
    daily_prayer_goal: COMMITMENT_GOAL[commitment] ?? 2,
  };
}
