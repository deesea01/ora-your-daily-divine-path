export interface Prayer {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedMinutes: number;
  text: string;
  lines: string[];
}

export interface PrayerCategory {
  key: string;
  label: string;
  emoji: string;
  description: string;
}

export interface SaintVoiceTheme {
  key: string;
  label: string;
  emoji: string;
  description: string;
  rate: number;
  pitch: number;
}

export const PRAYER_CATEGORIES: PrayerCategory[] = [
  { key: 'essential', label: 'Essential Prayers', emoji: '✝️', description: 'Core prayers every Catholic should know' },
  { key: 'marian', label: 'Marian Prayers', emoji: '🌹', description: 'Prayers honoring the Blessed Virgin Mary' },
  { key: 'jesus', label: 'Jesus-Centered Prayers', emoji: '🕯️', description: 'Prayers focused on Christ' },
  { key: 'st_joseph', label: 'Prayers to St. Joseph', emoji: '🪻', description: 'Prayers to the foster father of Jesus' },
  { key: 'st_michael', label: 'Prayers to St. Michael', emoji: '⚔️', description: 'Prayers for protection and spiritual strength' },
  { key: 'rosary', label: 'Rosary Prayers', emoji: '📿', description: 'Prayers for the Holy Rosary' },
  { key: 'divine_mercy', label: 'Divine Mercy Prayers', emoji: '❤️', description: 'Prayers of the Divine Mercy devotion' },
  { key: 'confession', label: 'Confession & Repentance', emoji: '🕊️', description: 'Prayers for reconciliation' },
  { key: 'morning', label: 'Morning Prayers', emoji: '🌅', description: 'Begin your day in grace' },
  { key: 'evening', label: 'Evening Prayers', emoji: '🌙', description: 'End your day in peace' },
  { key: 'eucharistic', label: 'Eucharistic Prayers', emoji: '🍞', description: 'Prayers of adoration and devotion' },
  { key: 'saints', label: 'Saints & Intercession', emoji: '⭐', description: 'Prayers through the communion of saints' },
  { key: 'novena', label: 'Novena Prayers', emoji: '🔥', description: 'Nine-day prayer frameworks' },
  { key: 'daily_life', label: 'Daily Life Prayers', emoji: '🙏', description: 'Prayers for meals and everyday moments' },
];

export const SAINT_VOICE_THEMES: SaintVoiceTheme[] = [
  { key: 'st_benedict', label: 'Inspired by St. Benedict', emoji: '⛪', description: 'Steady, monastic, rhythmic — rooted in the Rule of Life and ora et labora', rate: 0.8, pitch: 0.85 },
  { key: 'st_francis', label: 'Inspired by St. Francis of Assisi', emoji: '🕊️', description: 'Gentle, simple, peaceful — focused on humility and love of God through creation', rate: 0.85, pitch: 0.95 },
  { key: 'st_therese', label: 'Inspired by St. Thérèse of Lisieux', emoji: '🌸', description: 'Tender, childlike, trusting — the Little Way of spiritual childhood and love', rate: 0.9, pitch: 1.0 },
  { key: 'st_ignatius', label: 'Inspired by St. Ignatius of Loyola', emoji: '🎯', description: 'Focused, disciplined, reflective — suited for examen and discernment', rate: 0.85, pitch: 0.88 },
  { key: 'st_padre_pio', label: 'Inspired by St. Padre Pio', emoji: '🙏', description: 'Intense, devout, mystical — deep suffering united with Christ on the cross', rate: 0.8, pitch: 0.82 },
  { key: 'st_joan', label: 'Inspired by St. Joan of Arc', emoji: '🗡️', description: 'Bold, courageous, unwavering — trusting God in the face of opposition', rate: 0.9, pitch: 0.95 },
  { key: 'st_augustine', label: 'Inspired by St. Augustine', emoji: '📖', description: 'Introspective, passionate, confessional — a restless heart finding rest in God', rate: 0.82, pitch: 0.9 },
  { key: 'st_teresa_avila', label: 'Inspired by St. Teresa of Ávila', emoji: '🔥', description: 'Warm, contemplative, personal — interior prayer and friendship with God', rate: 0.85, pitch: 0.95 },
];

// Map spiritual guide keys to voice theme keys
export const GUIDE_TO_VOICE_THEME: Record<string, string> = {
  monk: 'st_benedict',
  st_francis: 'st_francis',
  st_augustine: 'st_augustine',
  st_thomas_aquinas: 'st_ignatius', // closest match: disciplined, reflective
  st_teresa: 'st_teresa_avila',
  st_michael: 'st_benedict', // closest match: steady, disciplined
  st_padre_pio: 'st_padre_pio',
  st_joan_of_arc: 'st_joan',
};

function splitLines(text: string): string[] {
  return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
}

const PRAYERS_RAW: Omit<Prayer, 'lines'>[] = [
  // Essential prayers
  {
    id: 'sign_of_cross',
    title: 'Sign of the Cross',
    description: 'The most fundamental Catholic prayer and gesture',
    category: 'essential',
    estimatedMinutes: 1,
    text: `In the name of the Father,\nand of the Son,\nand of the Holy Spirit.\nAmen.`,
  },
  {
    id: 'our_father',
    title: 'Our Father',
    description: 'The Lord\'s Prayer taught by Jesus himself',
    category: 'essential',
    estimatedMinutes: 1,
    text: `Our Father, who art in heaven,\nhallowed be thy name;\nthy kingdom come,\nthy will be done\non earth as it is in heaven.\nGive us this day our daily bread,\nand forgive us our trespasses,\nas we forgive those who trespass against us;\nand lead us not into temptation,\nbut deliver us from evil.\nAmen.`,
  },
  {
    id: 'hail_mary',
    title: 'Hail Mary',
    description: 'The most beloved prayer to the Blessed Mother',
    category: 'essential',
    estimatedMinutes: 1,
    text: `Hail Mary, full of grace,\nthe Lord is with thee.\nBlessed art thou amongst women,\nand blessed is the fruit of thy womb, Jesus.\nHoly Mary, Mother of God,\npray for us sinners,\nnow and at the hour of our death.\nAmen.`,
  },
  {
    id: 'glory_be',
    title: 'Glory Be',
    description: 'A short doxology praising the Holy Trinity',
    category: 'essential',
    estimatedMinutes: 1,
    text: `Glory be to the Father,\nand to the Son,\nand to the Holy Spirit,\nas it was in the beginning,\nis now, and ever shall be,\nworld without end.\nAmen.`,
  },
  {
    id: 'apostles_creed',
    title: 'Apostles\' Creed',
    description: 'A summary of the apostles\' faith',
    category: 'essential',
    estimatedMinutes: 2,
    text: `I believe in God,\nthe Father Almighty,\nCreator of heaven and earth,\nand in Jesus Christ, His only Son, our Lord,\nwho was conceived by the Holy Spirit,\nborn of the Virgin Mary,\nsuffered under Pontius Pilate,\nwas crucified, died and was buried;\nHe descended into hell;\non the third day He rose again from the dead;\nHe ascended into heaven,\nand is seated at the right hand of God the Father Almighty;\nfrom there He will come to judge the living and the dead.\nI believe in the Holy Spirit,\nthe holy catholic Church,\nthe communion of saints,\nthe forgiveness of sins,\nthe resurrection of the body,\nand life everlasting.\nAmen.`,
  },
  {
    id: 'nicene_creed',
    title: 'Nicene Creed',
    description: 'The creed professed at every Sunday Mass',
    category: 'essential',
    estimatedMinutes: 3,
    text: `I believe in one God,\nthe Father almighty,\nmaker of heaven and earth,\nof all things visible and invisible.\nI believe in one Lord Jesus Christ,\nthe Only Begotten Son of God,\nborn of the Father before all ages.\nGod from God, Light from Light,\ntrue God from true God,\nbegotten, not made, consubstantial with the Father;\nthrough him all things were made.\nFor us men and for our salvation\nhe came down from heaven,\nand by the Holy Spirit was incarnate of the Virgin Mary,\nand became man.\nFor our sake he was crucified under Pontius Pilate,\nhe suffered death and was buried,\nand rose again on the third day\nin accordance with the Scriptures.\nHe ascended into heaven\nand is seated at the right hand of the Father.\nHe will come again in glory\nto judge the living and the dead\nand his kingdom will have no end.\nI believe in the Holy Spirit, the Lord, the giver of life,\nwho proceeds from the Father and the Son,\nwho with the Father and the Son is adored and glorified,\nwho has spoken through the prophets.\nI believe in one, holy, catholic and apostolic Church.\nI confess one Baptism for the forgiveness of sins\nand I look forward to the resurrection of the dead\nand the life of the world to come.\nAmen.`,
  },
  {
    id: 'guardian_angel',
    title: 'Guardian Angel Prayer',
    description: 'Invoking your guardian angel\'s protection',
    category: 'essential',
    estimatedMinutes: 1,
    text: `Angel of God,\nmy guardian dear,\nto whom God's love\ncommits me here,\never this day,\nbe at my side,\nto light and guard,\nrule and guide.\nAmen.`,
  },
  // Marian prayers
  {
    id: 'hail_holy_queen',
    title: 'Hail, Holy Queen',
    description: 'A beautiful prayer of praise to Our Lady',
    category: 'marian',
    estimatedMinutes: 1,
    text: `Hail, Holy Queen, Mother of Mercy,\nour life, our sweetness and our hope.\nTo thee do we cry, poor banished children of Eve;\nto thee do we send up our sighs,\nmourning and weeping in this valley of tears.\nTurn then, most gracious advocate,\nthine eyes of mercy toward us,\nand after this our exile,\nshow unto us the blessed fruit of thy womb, Jesus.\nO clement, O loving, O sweet Virgin Mary.\nPray for us, O Holy Mother of God,\nthat we may be made worthy of the promises of Christ.\nAmen.`,
  },
  {
    id: 'memorare',
    title: 'Memorare',
    description: 'A powerful prayer of confident trust in Mary\'s intercession',
    category: 'marian',
    estimatedMinutes: 1,
    text: `Remember, O most gracious Virgin Mary,\nthat never was it known\nthat anyone who fled to thy protection,\nimplored thy help, or sought thy intercession\nwas left unaided.\nInspired by this confidence,\nI fly unto thee, O Virgin of virgins, my Mother;\nto thee do I come,\nbefore thee I stand, sinful and sorrowful.\nO Mother of the Word Incarnate,\ndespise not my petitions,\nbut in thy mercy hear and answer me.\nAmen.`,
  },
  {
    id: 'angelus',
    title: 'The Angelus',
    description: 'A devotion commemorating the Incarnation, prayed three times daily',
    category: 'marian',
    estimatedMinutes: 2,
    text: `V. The Angel of the Lord declared unto Mary,\nR. And she conceived of the Holy Spirit.\nHail Mary, full of grace...\n\nV. Behold the handmaid of the Lord,\nR. Be it done unto me according to thy word.\nHail Mary, full of grace...\n\nV. And the Word was made flesh,\nR. And dwelt among us.\nHail Mary, full of grace...\n\nV. Pray for us, O Holy Mother of God,\nR. That we may be made worthy of the promises of Christ.\n\nLet us pray:\nPour forth, we beseech Thee, O Lord,\nThy grace into our hearts;\nthat we, to whom the Incarnation of Christ Thy Son\nwas made known by the message of an Angel,\nmay by His Passion and Cross\nbe brought to the glory of His Resurrection.\nThrough the same Christ our Lord.\nAmen.`,
  },
  // Jesus-centered prayers
  {
    id: 'anima_christi',
    title: 'Anima Christi',
    description: 'Soul of Christ, sanctify me — a prayer of intimate union',
    category: 'jesus',
    estimatedMinutes: 1,
    text: `Soul of Christ, sanctify me.\nBody of Christ, save me.\nBlood of Christ, inebriate me.\nWater from the side of Christ, wash me.\nPassion of Christ, strengthen me.\nO good Jesus, hear me.\nWithin Thy wounds hide me.\nSuffer me not to be separated from Thee.\nFrom the malicious enemy defend me.\nIn the hour of my death call me\nand bid me come unto Thee,\nthat with Thy Saints I may praise Thee\nforever and ever.\nAmen.`,
  },
  {
    id: 'come_holy_spirit',
    title: 'Come, Holy Spirit',
    description: 'Invocation of the Holy Spirit for guidance and grace',
    category: 'jesus',
    estimatedMinutes: 1,
    text: `Come, Holy Spirit, fill the hearts of thy faithful\nand enkindle in them the fire of thy love.\nSend forth thy Spirit, and they shall be created.\nAnd thou shalt renew the face of the earth.\n\nO God, who by the light of the Holy Spirit\ndid instruct the hearts of the faithful,\ngrant that by the same Holy Spirit\nwe may be truly wise\nand ever enjoy His consolations.\nThrough Christ our Lord.\nAmen.`,
  },
  // St. Joseph
  {
    id: 'prayer_st_joseph',
    title: 'Prayer to St. Joseph',
    description: 'Seeking the intercession of the patron of the universal Church',
    category: 'st_joseph',
    estimatedMinutes: 1,
    text: `O St. Joseph,\nwhose protection is so great, so strong, so prompt\nbefore the throne of God,\nI place in thee all my interests and desires.\nO St. Joseph, do assist me by thy powerful intercession\nand obtain for me from thy Divine Son\nall spiritual blessings through Jesus Christ, Our Lord;\nso that having engaged here below thy heavenly power,\nI may offer my thanksgiving and homage\nto the most loving of Fathers.\nO St. Joseph, I never weary contemplating thee\nand Jesus asleep in thy arms.\nI dare not approach while He reposes near thy heart.\nPress Him in my name and kiss His fine head for me,\nand ask Him to return the kiss when I draw my dying breath.\nSt. Joseph, patron of departing souls, pray for us.\nAmen.`,
  },
  // St. Michael
  {
    id: 'st_michael_prayer',
    title: 'St. Michael Prayer',
    description: 'The great prayer of protection against evil',
    category: 'st_michael',
    estimatedMinutes: 1,
    text: `St. Michael the Archangel,\ndefend us in battle.\nBe our defense against the wickedness and snares of the Devil.\nMay God rebuke him, we humbly pray,\nand do thou,\nO Prince of the heavenly hosts,\nby the power of God,\nthrust into hell Satan,\nand all the evil spirits,\nwho prowl about the world\nseeking the ruin of souls.\nAmen.`,
  },
  // Rosary prayers
  {
    id: 'fatima_prayer',
    title: 'Fatima Prayer',
    description: 'The prayer requested by Our Lady of Fatima',
    category: 'rosary',
    estimatedMinutes: 1,
    text: `O my Jesus,\nforgive us our sins,\nsave us from the fires of hell,\nlead all souls to Heaven,\nespecially those most in need of Thy mercy.\nAmen.`,
  },
  // Divine Mercy
  {
    id: 'divine_mercy_chaplet_opening',
    title: 'Divine Mercy Chaplet',
    description: 'The chaplet given to St. Faustina — prayers of trust and mercy',
    category: 'divine_mercy',
    estimatedMinutes: 5,
    text: `You expired, Jesus, but the source of life gushed forth for souls,\nand the ocean of mercy opened up for the whole world.\nO Fount of Life, unfathomable Divine Mercy,\nenvelop the whole world and empty Yourself out upon us.\n\nO Blood and Water, which gushed forth from the Heart of Jesus\nas a fountain of Mercy for us, I trust in You!\n\nOur Father...\nHail Mary...\nThe Apostles' Creed...\n\nOn the large beads:\nEternal Father, I offer You the Body and Blood,\nSoul and Divinity of Your dearly beloved Son,\nOur Lord Jesus Christ,\nin atonement for our sins and those of the whole world.\n\nOn the small beads:\nFor the sake of His sorrowful Passion,\nhave mercy on us and on the whole world.\n\nClosing (3 times):\nHoly God, Holy Mighty One, Holy Immortal One,\nhave mercy on us and on the whole world.`,
  },
  // Confession
  {
    id: 'act_of_contrition',
    title: 'Act of Contrition',
    description: 'The prayer of repentance said during confession',
    category: 'confession',
    estimatedMinutes: 1,
    text: `O my God,\nI am heartily sorry for having offended Thee,\nand I detest all my sins\nbecause I dread the loss of heaven\nand the pains of hell;\nbut most of all because they offend Thee, my God,\nWho art all good and deserving of all my love.\nI firmly resolve,\nwith the help of Thy grace,\nto confess my sins,\nto do penance,\nand to amend my life.\nAmen.`,
  },
  {
    id: 'examination_prayer',
    title: 'Prayer Before Examination of Conscience',
    description: 'A prayer to invite the Holy Spirit before examining your conscience',
    category: 'confession',
    estimatedMinutes: 1,
    text: `Come, Holy Spirit,\nenlighten my mind that I may clearly know my sins.\nMove my heart that I may be sincerely sorry for them,\nfirmly resolved not to commit them again,\nand fully determined to make every effort to avoid the occasions of sin.\nO Blessed Virgin Mary, Mother of God,\npray for me.\nSt. Joseph, pray for me.\nMy Guardian Angel, pray for me.\nAmen.`,
  },
  // Morning
  {
    id: 'morning_offering',
    title: 'Morning Offering',
    description: 'Dedicate your entire day to God',
    category: 'morning',
    estimatedMinutes: 1,
    text: `O Jesus, through the Immaculate Heart of Mary,\nI offer You my prayers, works, joys, and sufferings of this day\nin union with the Holy Sacrifice of the Mass throughout the world.\nI offer them for all the intentions of Your Sacred Heart:\nthe salvation of souls, reparation for sin,\nand the reunion of all Christians.\nI offer them for the intentions of our bishops\nand of all Apostles of Prayer,\nand in particular for those recommended by our Holy Father this month.\nAmen.`,
  },
  // Evening
  {
    id: 'evening_prayer',
    title: 'Evening Prayer',
    description: 'A prayer of gratitude and surrender at day\'s end',
    category: 'evening',
    estimatedMinutes: 2,
    text: `Watch, O Lord, with those who wake,\nor watch, or weep tonight,\nand give Your angels and saints charge over those who sleep.\nTend Your sick ones, O Lord Christ.\nRest Your weary ones.\nBless Your dying ones.\nSoothe Your suffering ones.\nPity Your afflicted ones.\nShield Your joyous ones.\nAnd all for Your love's sake.\nAmen.\n\nVisit, we beseech Thee, O Lord, this dwelling,\nand drive far from it all snares of the enemy;\nlet Thy holy angels dwell herein to preserve us in peace;\nand let Thy blessing be upon all who dwell herein.\nThrough our Lord Jesus Christ.\nAmen.`,
  },
  // Eucharistic
  {
    id: 'anima_christi_eucharistic',
    title: 'Prayer Before the Blessed Sacrament',
    description: 'A prayer of adoration in the presence of the Eucharist',
    category: 'eucharistic',
    estimatedMinutes: 1,
    text: `O Sacrament most holy, O Sacrament divine,\nAll praise and all thanksgiving be every moment Thine.\n\nLord Jesus Christ, You gave us the Eucharist\nas the memorial of Your suffering and death.\nMay our worship of this sacrament of Your Body and Blood\nhelp us to experience the salvation You won for us\nand the peace of the kingdom,\nwhere You live with the Father and the Holy Spirit,\none God, forever and ever.\nAmen.`,
  },
  // Saints & intercession
  {
    id: 'prayer_for_the_dead',
    title: 'Prayer for the Faithful Departed',
    description: 'A prayer for those who have gone before us',
    category: 'saints',
    estimatedMinutes: 1,
    text: `Eternal rest grant unto them, O Lord,\nand let perpetual light shine upon them.\nMay the souls of the faithful departed,\nthrough the mercy of God,\nrest in peace.\nAmen.\n\nMay their souls and the souls of all the faithful departed,\nthrough the mercy of God,\nrest in peace.\nAmen.`,
  },
  {
    id: 'peace_prayer_st_francis',
    title: 'Peace Prayer of St. Francis',
    description: 'Make me an instrument of Your peace — a beloved prayer of self-giving love',
    category: 'saints',
    estimatedMinutes: 2,
    text: `Lord, make me an instrument of Your peace.\nWhere there is hatred, let me sow love;\nwhere there is injury, pardon;\nwhere there is doubt, faith;\nwhere there is despair, hope;\nwhere there is darkness, light;\nand where there is sadness, joy.\n\nO Divine Master, grant that I may not so much seek\nto be consoled as to console;\nto be understood as to understand;\nto be loved as to love.\nFor it is in giving that we receive;\nit is in pardoning that we are pardoned;\nand it is in dying that we are born to eternal life.\nAmen.`,
  },
  {
    id: 'prayer_st_therese',
    title: 'Prayer of St. Thérèse of Lisieux',
    description: 'A tender prayer of trust in God\'s love and the Little Way',
    category: 'saints',
    estimatedMinutes: 1,
    text: `O my God, I offer Thee all my actions of this day\nfor the intentions and for the glory of the Sacred Heart of Jesus.\nI desire to sanctify every beat of my heart,\nmy every thought, my simplest works,\nby uniting them to Its infinite merits;\nand I wish to make reparation for my sins\nby casting them into the furnace of Its Merciful Love.\n\nO my God, I ask of Thee for myself\nand for those whom I hold dear,\nthe grace to fulfill perfectly Thy holy will,\nto accept for love of Thee\nthe joys and sorrows of this passing life,\nso that we may one day be united together in heaven\nfor all eternity.\nAmen.`,
  },
  {
    id: 'st_patrick_breastplate',
    title: 'St. Patrick\'s Breastplate',
    description: 'Christ with me, Christ before me — a prayer of protection by Ireland\'s patron',
    category: 'saints',
    estimatedMinutes: 2,
    text: `Christ with me, Christ before me, Christ behind me,\nChrist in me, Christ beneath me, Christ above me,\nChrist on my right, Christ on my left,\nChrist when I lie down, Christ when I sit down, Christ when I arise,\nChrist in the heart of every man who thinks of me,\nChrist in the mouth of everyone who speaks of me,\nChrist in every eye that sees me,\nChrist in every ear that hears me.\n\nI bind unto myself today\nthe strong Name of the Trinity,\nby invocation of the same,\nthe Three in One and One in Three.\nOf whom all nature hath creation,\neternal Father, Spirit, Word:\npraise to the Lord of my salvation,\nsalvation is of Christ the Lord.\nAmen.`,
  },
  {
    id: 'prayer_st_anthony',
    title: 'Prayer to St. Anthony of Padua',
    description: 'Invoking the finder of lost things and patron of the lost',
    category: 'saints',
    estimatedMinutes: 1,
    text: `St. Anthony, perfect imitator of Jesus,\nwho received from God the special power\nof restoring lost things,\ngrant that I may find what I have lost.\n\nAt least restore to me peace and tranquility of mind,\nthe loss of which has afflicted me\neven more than my material loss.\n\nTo this favor I ask another of you:\nthat I may always remain in possession\nof the true good that is God.\nLet me rather lose all things\nthan lose God, my supreme good.\nLet me never suffer the loss of my greatest treasure,\neternal life with God.\nAmen.`,
  },
  {
    id: 'padre_pio_after_communion',
    title: 'St. Padre Pio\'s Prayer After Communion',
    description: 'Stay with me, Lord — a beloved prayer of intimate union with Jesus',
    category: 'saints',
    estimatedMinutes: 2,
    text: `Stay with me, Lord, for it is necessary to have You present\nso that I do not forget You.\nYou know how easily I abandon You.\n\nStay with me, Lord, because I am weak\nand I need Your strength,\nthat I may not fall so often.\n\nStay with me, Lord, for You are my life,\nand without You, I am without fervor.\n\nStay with me, Lord, for You are my light,\nand without You, I am in darkness.\n\nStay with me, Lord, to show me Your will.\nStay with me, Lord, so that I hear Your voice and follow You.\nStay with me, Lord, for I desire to love You very much,\nand always be in Your company.\n\nStay with me, Lord, if You wish me to be faithful to You.\nStay with me, Lord, for as poor as my soul is,\nI want it to be a place of consolation for You,\na nest of love.\nAmen.`,
  },
  // Daily life
  {
    id: 'prayer_before_meals',
    title: 'Prayer Before Meals',
    description: 'Grace before eating',
    category: 'daily_life',
    estimatedMinutes: 1,
    text: `Bless us, O Lord,\nand these Thy gifts,\nwhich we are about to receive\nfrom Thy bounty,\nthrough Christ our Lord.\nAmen.`,
  },
  {
    id: 'prayer_after_meals',
    title: 'Prayer After Meals',
    description: 'Thanksgiving after eating',
    category: 'daily_life',
    estimatedMinutes: 1,
    text: `We give Thee thanks, Almighty God,\nfor all Thy benefits,\nwho livest and reignest\nworld without end.\nAmen.\n\nMay the souls of the faithful departed,\nthrough the mercy of God,\nrest in peace.\nAmen.`,
  },
  {
    id: 'prayer_discernment',
    title: 'Prayer for Discernment',
    description: 'Seeking God\'s will in decisions',
    category: 'daily_life',
    estimatedMinutes: 1,
    text: `Lord, grant me the grace to know Your will,\nthe courage to follow it,\nand the patience to wait for Your timing.\nOpen my eyes to see Your hand at work.\nQuiet my heart so I may hear Your voice.\nRemove all fear and doubt,\nand replace them with trust in Your providence.\nMay Your Holy Spirit guide my every step.\nThrough Christ our Lord.\nAmen.`,
  },
  {
    id: 'prayer_strength',
    title: 'Prayer for Strength in Suffering',
    description: 'Finding courage and grace in times of trial',
    category: 'daily_life',
    estimatedMinutes: 1,
    text: `Lord Jesus Christ,\nYou bore the weight of the cross for my sake.\nGrant me the strength to carry my own crosses\nwith faith, patience, and love.\nWhen I am weary, be my rest.\nWhen I am afraid, be my courage.\nWhen I am alone, be my companion.\nUnite my sufferings with Yours\nfor the salvation of souls.\nAmen.`,
  },
  {
    id: 'prayer_family',
    title: 'Prayer for Spouse and Family',
    description: 'Entrusting your loved ones to God\'s care',
    category: 'daily_life',
    estimatedMinutes: 1,
    text: `Lord God, bless my family.\nProtect us from harm and keep us in Your grace.\nGrant us patience, kindness, and forgiveness toward one another.\nStrengthen the bonds of love between us.\nHelp us to grow in faith together\nand to always seek Your will in our home.\nMay our family be a witness to Your love in the world.\nThrough Christ our Lord.\nAmen.`,
  },
  // Novena
  {
    id: 'novena_framework',
    title: 'Novena Prayer Framework',
    description: 'A nine-day prayer structure for any intention',
    category: 'novena',
    estimatedMinutes: 3,
    text: `In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nOpening Prayer:\nDear God, I come before You with confidence,\nknowing that You hear the prayers of Your children.\nI begin this novena with faith in Your goodness\nand trust in Your will.\n\n[State your intention here silently or aloud.]\n\nPrayer for the Day:\nLord, I unite my prayer with the prayers of all the saints\nwho intercede for us before Your throne.\nGrant me the grace I need this day\nto grow in holiness and trust.\n\nOur Father...\nHail Mary...\nGlory Be...\n\nClosing Prayer:\nO God, who in Your infinite mercy\nhear the prayers of Your people,\ngrant that what I ask in faith\nmay be given according to Your holy will.\nThrough Christ our Lord.\nAmen.`,
  },
  // Psalm-based reflective prayer
  {
    id: 'psalm_23',
    title: 'Psalm 23 — The Lord is My Shepherd',
    description: 'A beloved psalm of trust and comfort',
    category: 'daily_life',
    estimatedMinutes: 2,
    text: `The Lord is my shepherd; I shall not want.\nHe maketh me to lie down in green pastures:\nHe leadeth me beside the still waters.\nHe restoreth my soul:\nHe leadeth me in the paths of righteousness for His name's sake.\nYea, though I walk through the valley of the shadow of death,\nI will fear no evil: for Thou art with me;\nThy rod and Thy staff they comfort me.\nThou preparest a table before me in the presence of mine enemies:\nThou anointest my head with oil; my cup runneth over.\nSurely goodness and mercy shall follow me all the days of my life:\nand I will dwell in the house of the Lord forever.`,
  },
];

export const PRAYERS: Prayer[] = PRAYERS_RAW.map(p => ({
  ...p,
  lines: splitLines(p.text),
}));

export function getPrayersByCategory(category: string): Prayer[] {
  return PRAYERS.filter(p => p.category === category);
}

export function getPrayerById(id: string): Prayer | undefined {
  return PRAYERS.find(p => p.id === id);
}

export const PRESET_ROUTINES = [
  { name: 'Morning Routine', description: 'Start your day with God', prayerIds: ['sign_of_cross', 'morning_offering', 'our_father', 'guardian_angel'], emoji: '🌅' },
  { name: 'Before Bed', description: 'End your day in peace', prayerIds: ['sign_of_cross', 'evening_prayer', 'act_of_contrition', 'guardian_angel'], emoji: '🌙' },
  { name: 'Before Confession', description: 'Prepare your heart', prayerIds: ['come_holy_spirit', 'examination_prayer', 'act_of_contrition'], emoji: '🕊️' },
  { name: 'Peace & Anxiety', description: 'Find rest in God', prayerIds: ['come_holy_spirit', 'psalm_23', 'prayer_strength', 'anima_christi'], emoji: '☮️' },
  { name: 'For Family', description: 'Pray for your loved ones', prayerIds: ['our_father', 'prayer_family', 'guardian_angel', 'prayer_for_the_dead'], emoji: '👨‍👩‍👧‍👦' },
  { name: 'Lent / Advent', description: 'Seasonal devotion', prayerIds: ['sign_of_cross', 'act_of_contrition', 'anima_christi', 'prayer_strength', 'st_michael_prayer'], emoji: '⛪' },
];
