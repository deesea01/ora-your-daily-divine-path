export interface ExaminationCategory {
  key: string;
  label: string;
  prompt: string;
  items: string[];
}

export const EXAMINATION_CATEGORIES: ExaminationCategory[] = [
  {
    key: 'relationship_with_god',
    label: 'Relationship with God',
    prompt: 'Have I made God the center of my life, or have I placed other things above Him?',
    items: [
      'Doubted or denied my faith',
      'Neglected daily prayer',
      'Put superstition or occult before God',
      'Failed to trust in God\'s providence',
    ],
  },
  {
    key: 'lords_name',
    label: 'Use of the Lord\'s Name',
    prompt: 'Have I honored God\'s name in my speech and actions?',
    items: [
      'Used God\'s name in vain',
      'Cursed or sworn oaths lightly',
      'Spoke irreverently about sacred things',
    ],
  },
  {
    key: 'sunday_obligation',
    label: 'Sunday Obligation',
    prompt: 'Have I kept the Lord\'s Day holy?',
    items: [
      'Missed Mass on Sunday without serious reason',
      'Arrived late or left early without cause',
      'Failed to rest and honor the Sabbath',
    ],
  },
  {
    key: 'prayer_life',
    label: 'Prayer Life',
    prompt: 'Have I been faithful and sincere in my prayer?',
    items: [
      'Prayed without attention or devotion',
      'Neglected regular prayer habits',
      'Failed to pray for others',
    ],
  },
  {
    key: 'purity',
    label: 'Purity',
    prompt: 'Have I respected the dignity of my body and others\'?',
    items: [
      'Entertained impure thoughts willfully',
      'Viewed inappropriate content',
      'Failed in modesty of speech or action',
    ],
  },
  {
    key: 'charity',
    label: 'Charity',
    prompt: 'Have I loved my neighbor as myself?',
    items: [
      'Refused to help someone in need',
      'Been indifferent to the suffering of others',
      'Failed to forgive',
      'Held resentment or bitterness',
    ],
  },
  {
    key: 'honesty',
    label: 'Honesty',
    prompt: 'Have I been truthful and just in my dealings?',
    items: [
      'Told lies or half-truths',
      'Cheated or been dishonest',
      'Stolen or kept what belongs to others',
    ],
  },
  {
    key: 'anger',
    label: 'Anger',
    prompt: 'Have I controlled my temper and responded with patience?',
    items: [
      'Lost my temper unnecessarily',
      'Spoke harshly to others',
      'Held grudges or sought revenge',
    ],
  },
  {
    key: 'gossip',
    label: 'Gossip',
    prompt: 'Have I guarded my tongue and spoken well of others?',
    items: [
      'Talked about others behind their back',
      'Spread rumors or unverified information',
      'Damaged someone\'s reputation',
    ],
  },
  {
    key: 'neglect_of_duties',
    label: 'Neglect of Duties',
    prompt: 'Have I fulfilled my responsibilities faithfully?',
    items: [
      'Neglected work or school duties',
      'Been lazy or procrastinated',
      'Failed in my obligations to others',
    ],
  },
  {
    key: 'pride',
    label: 'Pride',
    prompt: 'Have I been humble before God and others?',
    items: [
      'Been boastful or vain',
      'Looked down on others',
      'Refused to admit mistakes',
      'Sought attention or praise',
    ],
  },
  {
    key: 'family',
    label: 'Family Responsibilities',
    prompt: 'Have I honored and cared for my family?',
    items: [
      'Disrespected parents or elders',
      'Neglected family members',
      'Failed to be patient with loved ones',
    ],
  },
  {
    key: 'use_of_time',
    label: 'Use of Time',
    prompt: 'Have I used my time wisely and for God\'s glory?',
    items: [
      'Wasted significant time on trivial things',
      'Neglected spiritual reading or growth',
      'Failed to make time for others',
    ],
  },
  {
    key: 'mercy',
    label: 'Mercy and Forgiveness',
    prompt: 'Have I shown mercy and forgiven as Christ forgives me?',
    items: [
      'Refused to forgive someone',
      'Been judgmental or unmerciful',
      'Failed to give others the benefit of the doubt',
    ],
  },
];
