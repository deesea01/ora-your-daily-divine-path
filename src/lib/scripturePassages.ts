/**
 * Full text of Scripture passages referenced by spiritual-memory recommendations.
 * When a "scripture" recommendation is opened from the Spiritual Journey, we
 * show the passage inline instead of routing to the prayer library (where the
 * passage doesn't live).
 */

export interface ScripturePassage {
  ref: string;
  title: string;
  text: string;
}

/** Map a recommendation title to a full passage. Match by substring (case-insensitive). */
const PASSAGES: ScripturePassage[] = [
  {
    ref: "Psalm 23",
    title: "The Lord is my Shepherd",
    text:
      "The Lord is my shepherd; there is nothing I lack.\n" +
      "In green pastures he makes me lie down; to still waters he leads me;\n" +
      "he restores my soul.\n\n" +
      "He guides me along right paths for the sake of his name.\n" +
      "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me;\n" +
      "your rod and your staff comfort me.\n\n" +
      "You set a table before me in front of my enemies;\n" +
      "you anoint my head with oil; my cup overflows.\n\n" +
      "Indeed, goodness and mercy will pursue me all the days of my life;\n" +
      "I will dwell in the house of the Lord for endless days.",
  },
  {
    ref: "Psalm 34",
    title: "Near to the Brokenhearted",
    text:
      "I will bless the Lord at all times; his praise shall be always in my mouth.\n" +
      "My soul will glory in the Lord; let the poor hear and be glad.\n\n" +
      "I sought the Lord, and he answered me, delivered me from all my fears.\n" +
      "Look to him and be radiant, and your faces may not blush for shame.\n\n" +
      "This poor one cried out and the Lord heard, and from all his distress he saved him.\n" +
      "The angel of the Lord encamps around those who fear him, and he saves them.\n\n" +
      "Taste and see that the Lord is good; blessed is the stalwart one who takes refuge in him.\n\n" +
      "The Lord is close to the brokenhearted, saves those whose spirit is crushed.\n" +
      "Many are the troubles of the righteous, but the Lord delivers him from them all.",
  },
];

export function findPassageForTitle(title: string): ScripturePassage | null {
  const t = title.toLowerCase();
  for (const p of PASSAGES) {
    if (t.includes(p.ref.toLowerCase())) return p;
  }
  return null;
}
