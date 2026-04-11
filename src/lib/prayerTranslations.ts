// Translated prayer texts for all supported languages
// Each prayer has: title, description, text (with \n for line breaks)

import { LanguageCode } from '@/lib/i18n/types';

export interface PrayerTranslation {
  title: string;
  description: string;
  text: string;
}

type PrayerTranslationMap = Record<string, PrayerTranslation>;

const es: PrayerTranslationMap = {
  sign_of_cross: {
    title: 'La Señal de la Cruz',
    description: 'La oración y gesto católico más fundamental',
    text: `En el nombre del Padre,\ny del Hijo,\ny del Espíritu Santo.\nAmén.`,
  },
  our_father: {
    title: 'Padre Nuestro',
    description: 'La oración del Señor enseñada por Jesús mismo',
    text: `Padre nuestro, que estás en el cielo,\nsantificado sea tu Nombre;\nvenga a nosotros tu reino;\nhágase tu voluntad\nen la tierra como en el cielo.\nDanos hoy nuestro pan de cada día;\nperdona nuestras ofensas,\ncomo también nosotros perdonamos a los que nos ofenden;\nno nos dejes caer en la tentación,\ny líbranos del mal.\nAmén.`,
  },
  hail_mary: {
    title: 'Ave María',
    description: 'La oración más querida a la Santísima Madre',
    text: `Dios te salve, María, llena eres de gracia,\nel Señor es contigo.\nBendita tú eres entre todas las mujeres,\ny bendito es el fruto de tu vientre, Jesús.\nSanta María, Madre de Dios,\nruega por nosotros, pecadores,\nahora y en la hora de nuestra muerte.\nAmén.`,
  },
  glory_be: {
    title: 'Gloria',
    description: 'Una breve doxología que alaba a la Santísima Trinidad',
    text: `Gloria al Padre,\ny al Hijo,\ny al Espíritu Santo,\ncomo era en el principio,\nahora y siempre,\npor los siglos de los siglos.\nAmén.`,
  },
  apostles_creed: {
    title: 'Credo de los Apóstoles',
    description: 'Un resumen de la fe de los apóstoles',
    text: `Creo en Dios, Padre todopoderoso,\nCreador del cielo y de la tierra,\ny en Jesucristo, su único Hijo, nuestro Señor,\nque fue concebido por obra y gracia del Espíritu Santo,\nnació de santa María Virgen,\npadeció bajo el poder de Poncio Pilato,\nfue crucificado, muerto y sepultado,\ndescendió a los infiernos,\nal tercer día resucitó de entre los muertos,\nsubió a los cielos\ny está sentado a la derecha de Dios, Padre todopoderoso.\nDesde allí ha de venir a juzgar a vivos y muertos.\nCreo en el Espíritu Santo,\nla santa Iglesia católica,\nla comunión de los santos,\nel perdón de los pecados,\nla resurrección de la carne\ny la vida eterna.\nAmén.`,
  },
  nicene_creed: {
    title: 'Credo Niceno',
    description: 'El credo que se profesa en cada Misa dominical',
    text: `Creo en un solo Dios,\nPadre todopoderoso,\nCreador del cielo y de la tierra,\nde todo lo visible y lo invisible.\nCreo en un solo Señor, Jesucristo,\nHijo único de Dios,\nnacido del Padre antes de todos los siglos.\nDios de Dios, Luz de Luz,\nDios verdadero de Dios verdadero,\nengendrado, no creado, de la misma naturaleza del Padre,\npor quien todo fue hecho;\nque por nosotros, los hombres,\ny por nuestra salvación bajó del cielo,\ny por obra del Espíritu Santo\nse encarnó de María, la Virgen, y se hizo hombre;\ny por nuestra causa fue crucificado\nen tiempos de Poncio Pilato;\npadeció y fue sepultado,\ny resucitó al tercer día, según las Escrituras,\ny subió al cielo, y está sentado a la derecha del Padre;\ny de nuevo vendrá con gloria\npara juzgar a vivos y muertos,\ny su reino no tendrá fin.\nCreo en el Espíritu Santo, Señor y dador de vida,\nque procede del Padre y del Hijo,\nque con el Padre y el Hijo recibe una misma adoración y gloria,\ny que habló por los profetas.\nCreo en la Iglesia, que es una, santa, católica y apostólica.\nConfieso que hay un solo bautismo para el perdón de los pecados\ny espero la resurrección de los muertos\ny la vida del mundo futuro.\nAmén.`,
  },
  guardian_angel: {
    title: 'Oración al Ángel de la Guarda',
    description: 'Invocando la protección de tu ángel de la guarda',
    text: `Ángel de Dios,\nmi querido guardián,\na quien el amor de Dios\nme ha encomendado aquí,\nilumíname, guárdame,\nrígeme y gobiérname\nen este día.\nAmén.`,
  },
  hail_holy_queen: {
    title: 'Salve Regina',
    description: 'Una hermosa oración de alabanza a Nuestra Señora',
    text: `Dios te salve, Reina y Madre de misericordia,\nvida, dulzura y esperanza nuestra.\nDios te salve.\nA ti llamamos los desterrados hijos de Eva;\na ti suspiramos, gimiendo y llorando,\nen este valle de lágrimas.\nEa, pues, Señora, abogada nuestra,\nvuelve a nosotros esos tus ojos misericordiosos;\ny después de este destierro muéstranos a Jesús,\nfruto bendito de tu vientre.\n¡Oh clemente, oh piadosa,\noh dulce Virgen María!\nRuega por nosotros, Santa Madre de Dios,\npara que seamos dignos de alcanzar las promesas de Cristo.\nAmén.`,
  },
  memorare: {
    title: 'Acordaos',
    description: 'Una poderosa oración de confianza en la intercesión de María',
    text: `Acordaos, oh piadosísima Virgen María,\nque jamás se ha oído decir\nque ninguno de los que han acudido a tu protección,\nimplorado tu asistencia o reclamado tu socorro,\nhaya sido desamparado.\nAnimado con esta confianza,\na ti también acudo, oh Madre, Virgen de las vírgenes;\na ti vengo,\nante ti me presento, pecador arrepentido.\nOh Madre del Verbo encarnado,\nno desprecies mis súplicas,\nsino escúchalas y acógelas benignamente.\nAmén.`,
  },
  angelus: {
    title: 'El Ángelus',
    description: 'Devoción que conmemora la Encarnación, rezada tres veces al día',
    text: `V. El Ángel del Señor anunció a María,\nR. Y concibió por obra del Espíritu Santo.\nDios te salve, María...\n\nV. He aquí la esclava del Señor,\nR. Hágase en mí según tu palabra.\nDios te salve, María...\n\nV. Y el Verbo se hizo carne,\nR. Y habitó entre nosotros.\nDios te salve, María...\n\nV. Ruega por nosotros, Santa Madre de Dios,\nR. Para que seamos dignos de las promesas de Cristo.\n\nOremos:\nInfunde, Señor, tu gracia en nuestras almas,\npara que los que hemos conocido\nla Encarnación de tu Hijo Jesucristo\npor el anuncio del Ángel,\nseamos llevados, por su Pasión y su Cruz,\na la gloria de la Resurrección.\nPor el mismo Jesucristo, nuestro Señor.\nAmén.`,
  },
  anima_christi: {
    title: 'Alma de Cristo',
    description: 'Alma de Cristo, santifícame — una oración de íntima unión',
    text: `Alma de Cristo, santifícame.\nCuerpo de Cristo, sálvame.\nSangre de Cristo, embriágame.\nAgua del costado de Cristo, lávame.\nPasión de Cristo, confórtame.\nOh buen Jesús, óyeme.\nDentro de tus llagas, escóndeme.\nNo permitas que me aparte de ti.\nDel maligno enemigo, defiéndeme.\nEn la hora de mi muerte, llámame\ny mándame ir a ti,\npara que con tus Santos te alabe\npor los siglos de los siglos.\nAmén.`,
  },
  come_holy_spirit: {
    title: 'Ven, Espíritu Santo',
    description: 'Invocación del Espíritu Santo para guía y gracia',
    text: `Ven, Espíritu Santo, llena los corazones de tus fieles\ny enciende en ellos el fuego de tu amor.\nEnvía tu Espíritu y serán creados.\nY renovarás la faz de la tierra.\n\nOh Dios, que has instruido\nlos corazones de tus fieles con la luz del Espíritu Santo,\nconcédenos que sintamos rectamente\ncon el mismo Espíritu\ny gocemos siempre de su divino consuelo.\nPor Cristo nuestro Señor.\nAmén.`,
  },
  prayer_st_joseph: {
    title: 'Oración a San José',
    description: 'Buscando la intercesión del patrono de la Iglesia universal',
    text: `Oh San José,\ncuya protección es tan grande, tan fuerte, tan pronta\nante el trono de Dios,\npongo en ti todos mis intereses y deseos.\nOh San José, asísteme con tu poderosa intercesión\ny obtén para mí de tu Hijo divino\ntodas las bendiciones espirituales por Jesucristo, nuestro Señor;\nde modo que, habiendo experimentado aquí abajo tu poder celestial,\npueda ofrecer mi agradecimiento y homenaje\nal más amoroso de los Padres.\nOh San José, nunca me canso de contemplarte\ncon Jesús dormido en tus brazos.\nNo me atrevo a acercarme mientras Él reposa junto a tu corazón.\nEstréchaLo en mi nombre y besa su dulce cabeza por mí,\ny pídele que devuelva el beso cuando yo exhale mi último suspiro.\nSan José, patrono de las almas que parten, ruega por nosotros.\nAmén.`,
  },
  st_michael_prayer: {
    title: 'Oración a San Miguel',
    description: 'La gran oración de protección contra el mal',
    text: `San Miguel Arcángel,\ndefiéndenos en la batalla.\nSé nuestro amparo contra la perversidad y asechanzas del demonio.\nReprímale Dios, pedimos suplicantes,\ny tú, Príncipe de la milicia celestial,\narroja al infierno, con el divino poder,\na Satanás y a los otros espíritus malignos\nque andan dispersos por el mundo\npara la perdición de las almas.\nAmén.`,
  },
  fatima_prayer: {
    title: 'Oración de Fátima',
    description: 'La oración pedida por Nuestra Señora de Fátima',
    text: `Oh Jesús mío,\nperdona nuestros pecados,\nlíbranos del fuego del infierno,\nlleva al cielo a todas las almas,\nespecialmente a las más necesitadas de tu misericordia.\nAmén.`,
  },
  divine_mercy_chaplet_opening: {
    title: 'Coronilla de la Divina Misericordia',
    description: 'La coronilla dada a Santa Faustina — oraciones de confianza y misericordia',
    text: `Expiraste, Jesús, pero la fuente de vida brotó para las almas,\ny el océano de misericordia se abrió para el mundo entero.\nOh Fuente de Vida, insondable Divina Misericordia,\nenvuelve al mundo entero y derrrámate sobre nosotros.\n\nOh Sangre y Agua, que brotaste del Corazón de Jesús\ncomo fuente de Misericordia para nosotros, ¡en Ti confío!\n\nPadre Nuestro...\nDios te salve, María...\nCredo de los Apóstoles...\n\nEn las cuentas grandes:\nPadre Eterno, te ofrezco el Cuerpo y la Sangre,\nel Alma y la Divinidad de tu amadísimo Hijo,\nnuestro Señor Jesucristo,\ncomo propiciación por nuestros pecados y los del mundo entero.\n\nEn las cuentas pequeñas:\nPor su dolorosa Pasión,\nten misericordia de nosotros y del mundo entero.\n\nAl final (3 veces):\nSanto Dios, Santo Fuerte, Santo Inmortal,\nten piedad de nosotros y del mundo entero.`,
  },
  act_of_contrition: {
    title: 'Acto de Contrición',
    description: 'La oración de arrepentimiento dicha durante la confesión',
    text: `Dios mío,\nme arrepiento de todo corazón de haberte ofendido,\ny detesto todos mis pecados\nporque temo la pérdida del cielo\ny las penas del infierno;\npero sobre todo porque te ofenden a ti, Dios mío,\nque eres todo bondad y digno de todo mi amor.\nPropongo firmemente,\ncon la ayuda de tu gracia,\nconfesar mis pecados,\ncumplir la penitencia\ny enmendar mi vida.\nAmén.`,
  },
  examination_prayer: {
    title: 'Oración antes del Examen de Conciencia',
    description: 'Una oración para invitar al Espíritu Santo antes de examinar la conciencia',
    text: `Ven, Espíritu Santo,\nilumina mi mente para que conozca claramente mis pecados.\nMueve mi corazón para que me arrepienta sinceramente de ellos,\nfirmemente resuelto a no cometerlos más,\ny totalmente decidido a evitar las ocasiones de pecado.\nOh Bienaventurada Virgen María, Madre de Dios,\nruega por mí.\nSan José, ruega por mí.\nÁngel de mi guarda, ruega por mí.\nAmén.`,
  },
  morning_offering: {
    title: 'Ofrecimiento de la Mañana',
    description: 'Dedica todo tu día a Dios',
    text: `Oh Jesús, por el Corazón Inmaculado de María,\nte ofrezco mis oraciones, obras, alegrías y sufrimientos de este día\nen unión con el Santo Sacrificio de la Misa en todo el mundo.\nTe los ofrezco por todas las intenciones de tu Sagrado Corazón:\nla salvación de las almas, la reparación por el pecado\ny la reunión de todos los cristianos.\nTe los ofrezco por las intenciones de nuestros obispos\ny de todos los Apóstoles de la Oración,\ny en particular por las recomendadas por nuestro Santo Padre este mes.\nAmén.`,
  },
  evening_prayer: {
    title: 'Oración de la Noche',
    description: 'Una oración de gratitud y entrega al final del día',
    text: `Vela, oh Señor, con aquellos que velan,\no vigilan, o lloran esta noche,\ny encarga a tus ángeles y santos que cuiden de los que duermen.\nAtiende a tus enfermos, oh Señor Jesús.\nDa descanso a tus fatigados.\nBendice a tus moribundos.\nConsuela a tus afligidos.\nCompadécete de tus atribulados.\nProtege a tus gozosos.\nY todo por amor a ti.\nAmén.\n\nVisita, te suplicamos, oh Señor, esta morada,\ny aleja de ella todas las asechanzas del enemigo;\nque tus santos ángeles habiten en ella para conservarnos en paz;\ny que tu bendición sea sobre todos los que en ella moran.\nPor Jesucristo nuestro Señor.\nAmén.`,
  },
  anima_christi_eucharistic: {
    title: 'Oración ante el Santísimo Sacramento',
    description: 'Una oración de adoración en presencia de la Eucaristía',
    text: `Oh Sacramento santísimo, oh Sacramento divino,\ntoda alabanza y acción de gracias sean en cada momento para ti.\n\nSeñor Jesucristo, nos diste la Eucaristía\ncomo memorial de tu sufrimiento y muerte.\nQue nuestra adoración de este sacramento de tu Cuerpo y Sangre\nnos ayude a experimentar la salvación que nos ganaste\ny la paz del reino,\ndonde vives con el Padre y el Espíritu Santo,\nun solo Dios, por los siglos de los siglos.\nAmén.`,
  },
  prayer_for_the_dead: {
    title: 'Oración por los Fieles Difuntos',
    description: 'Una oración por los que nos han precedido',
    text: `Dales, Señor, el descanso eterno,\ny brille para ellos la luz perpetua.\nQue las almas de los fieles difuntos,\npor la misericordia de Dios,\ndescansen en paz.\nAmén.\n\nQue sus almas y las almas de todos los fieles difuntos,\npor la misericordia de Dios,\ndescansen en paz.\nAmén.`,
  },
  prayer_before_meals: {
    title: 'Oración antes de comer',
    description: 'Bendición antes de la comida',
    text: `Bendícenos, Señor,\ny bendice estos alimentos\nque por tu bondad\nvamos a recibir.\nPor Cristo nuestro Señor.\nAmén.`,
  },
  prayer_after_meals: {
    title: 'Oración después de comer',
    description: 'Acción de gracias después de la comida',
    text: `Te damos gracias, Dios todopoderoso,\npor todos tus beneficios,\ntú que vives y reinas\npor los siglos de los siglos.\nAmén.\n\nQue las almas de los fieles difuntos,\npor la misericordia de Dios,\ndescansen en paz.\nAmén.`,
  },
  prayer_discernment: {
    title: 'Oración por el Discernimiento',
    description: 'Buscando la voluntad de Dios en las decisiones',
    text: `Señor, concédeme la gracia de conocer tu voluntad,\nel valor para seguirla\ny la paciencia para esperar tu tiempo.\nAbre mis ojos para ver tu mano obrando.\nAquieta mi corazón para que pueda oír tu voz.\nRetira todo miedo y duda,\ny reemplázalos con confianza en tu providencia.\nQue tu Espíritu Santo guíe cada uno de mis pasos.\nPor Cristo nuestro Señor.\nAmén.`,
  },
  prayer_strength: {
    title: 'Oración por la Fortaleza en el Sufrimiento',
    description: 'Encontrar valor y gracia en tiempos de prueba',
    text: `Señor Jesucristo,\ntú soportaste el peso de la cruz por mí.\nConcédeme la fortaleza para llevar mis propias cruces\ncon fe, paciencia y amor.\nCuando esté cansado, sé mi descanso.\nCuando tenga miedo, sé mi valor.\nCuando esté solo, sé mi compañero.\nUne mis sufrimientos a los tuyos\npor la salvación de las almas.\nAmén.`,
  },
  prayer_family: {
    title: 'Oración por el Esposo y la Familia',
    description: 'Encomendando a tus seres queridos al cuidado de Dios',
    text: `Señor Dios, bendice a mi familia.\nProtégenos del mal y manténnos en tu gracia.\nConcédenos paciencia, bondad y perdón entre nosotros.\nFortalece los lazos de amor entre nosotros.\nAyúdanos a crecer juntos en la fe\ny a buscar siempre tu voluntad en nuestro hogar.\nQue nuestra familia sea testigo de tu amor en el mundo.\nPor Cristo nuestro Señor.\nAmén.`,
  },
  novena_framework: {
    title: 'Estructura de Novena',
    description: 'Una estructura de oración de nueve días para cualquier intención',
    text: `En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.\n\nOración de apertura:\nDios mío, vengo ante ti con confianza,\nsabiendo que escuchas las oraciones de tus hijos.\nComienzo esta novena con fe en tu bondad\ny confianza en tu voluntad.\n\n[Expresa aquí tu intención en silencio o en voz alta.]\n\nOración del día:\nSeñor, uno mi oración con las oraciones de todos los santos\nque interceden por nosotros ante tu trono.\nConcédeme la gracia que necesito este día\npara crecer en santidad y confianza.\n\nPadre Nuestro...\nDios te salve, María...\nGloria...\n\nOración final:\nOh Dios, que en tu infinita misericordia\nescuchas las oraciones de tu pueblo,\nconcede que lo que pido con fe\nme sea dado según tu santa voluntad.\nPor Cristo nuestro Señor.\nAmén.`,
  },
  psalm_23: {
    title: 'Salmo 23 — El Señor es mi Pastor',
    description: 'Un salmo amado de confianza y consuelo',
    text: `El Señor es mi pastor; nada me faltará.\nEn verdes praderas me hace recostar;\nme conduce hacia fuentes tranquilas.\nÉl restaura mi alma;\nme guía por sendas de justicia por amor de su nombre.\nAunque camine por el valle de la sombra de la muerte,\nno temeré mal alguno, porque tú estás conmigo;\ntu vara y tu cayado me infunden aliento.\nPreparas ante mí una mesa frente a mis enemigos;\nunges mi cabeza con aceite; mi copa rebosa.\nCiertamente, el bien y la misericordia me seguirán todos los días de mi vida,\ny habitaré en la casa del Señor por siempre.`,
  },
};

const it: PrayerTranslationMap = {
  sign_of_cross: {
    title: 'Il Segno della Croce',
    description: 'La preghiera e il gesto cattolico più fondamentale',
    text: `Nel nome del Padre,\ne del Figlio,\ne dello Spirito Santo.\nAmen.`,
  },
  our_father: {
    title: 'Padre Nostro',
    description: 'La preghiera del Signore insegnata da Gesù stesso',
    text: `Padre nostro, che sei nei cieli,\nsia santificato il tuo nome,\nvenga il tuo regno,\nsia fatta la tua volontà,\ncome in cielo così in terra.\nDacci oggi il nostro pane quotidiano,\ne rimetti a noi i nostri debiti\ncome anche noi li rimettiamo ai nostri debitori,\ne non abbandonarci alla tentazione,\nma liberaci dal male.\nAmen.`,
  },
  hail_mary: {
    title: 'Ave Maria',
    description: 'La preghiera più amata alla Beata Madre',
    text: `Ave, o Maria, piena di grazia,\nil Signore è con te.\nTu sei benedetta fra le donne\ne benedetto è il frutto del tuo seno, Gesù.\nSanta Maria, Madre di Dio,\nprega per noi peccatori,\nadesso e nell'ora della nostra morte.\nAmen.`,
  },
  glory_be: {
    title: 'Gloria al Padre',
    description: 'Una breve dossologia che loda la Santissima Trinità',
    text: `Gloria al Padre,\nal Figlio\ne allo Spirito Santo.\nCome era nel principio,\nora e sempre,\nnei secoli dei secoli.\nAmen.`,
  },
  apostles_creed: {
    title: 'Credo Apostolico',
    description: 'Un riassunto della fede degli apostoli',
    text: `Io credo in Dio, Padre onnipotente,\nCreatore del cielo e della terra.\nE in Gesù Cristo, suo unico Figlio, nostro Signore,\nil quale fu concepito di Spirito Santo,\nnacque da Maria Vergine,\npatì sotto Ponzio Pilato,\nfu crocifisso, morì e fu sepolto;\ndiscese agli inferi;\nil terzo giorno risuscitò da morte;\nsalì al cielo,\nsiede alla destra di Dio Padre onnipotente:\ndi là verrà a giudicare i vivi e i morti.\nCredo nello Spirito Santo,\nla santa Chiesa cattolica,\nla comunione dei santi,\nla remissione dei peccati,\nla risurrezione della carne,\nla vita eterna.\nAmen.`,
  },
  nicene_creed: {
    title: 'Credo Niceno',
    description: 'Il credo professato in ogni Messa domenicale',
    text: `Credo in un solo Dio,\nPadre onnipotente,\ncreatore del cielo e della terra,\ndi tutte le cose visibili e invisibili.\nCredo in un solo Signore, Gesù Cristo,\nunigenito Figlio di Dio,\nnato dal Padre prima di tutti i secoli.\nDio da Dio, Luce da Luce,\nDio vero da Dio vero,\ngenerato, non creato, della stessa sostanza del Padre;\nper mezzo di lui tutte le cose sono state create.\nPer noi uomini e per la nostra salvezza\ndiscese dal cielo,\ne per opera dello Spirito Santo\nsi è incarnato nel seno della Vergine Maria\ne si è fatto uomo.\nFu crocifisso per noi sotto Ponzio Pilato,\nmorì e fu sepolto.\nIl terzo giorno è risuscitato, secondo le Scritture,\nè salito al cielo, siede alla destra del Padre.\nE di nuovo verrà, nella gloria,\nper giudicare i vivi e i morti,\ne il suo regno non avrà fine.\nCredo nello Spirito Santo, che è Signore e dà la vita,\ne procede dal Padre e dal Figlio.\nCon il Padre e il Figlio è adorato e glorificato,\ne ha parlato per mezzo dei profeti.\nCredo la Chiesa, una, santa, cattolica e apostolica.\nProfesso un solo battesimo per il perdono dei peccati.\nAspetto la risurrezione dei morti\ne la vita del mondo che verrà.\nAmen.`,
  },
  guardian_angel: {
    title: 'Preghiera all\'Angelo Custode',
    description: 'Invocare la protezione del tuo angelo custode',
    text: `Angelo di Dio,\nche sei il mio custode,\nillumina, custodisci,\nreggi e governa me,\nche ti fui affidato\ndalla pietà celeste.\nAmen.`,
  },
  hail_holy_queen: {
    title: 'Salve Regina',
    description: 'Una bella preghiera di lode a Nostra Signora',
    text: `Salve, Regina, Madre di misericordia,\nvita, dolcezza e speranza nostra, salve.\nA te ricorriamo, esuli figli di Eva;\na te sospiriamo, gementi e piangenti\nin questa valle di lacrime.\nOrsù dunque, avvocata nostra,\nrivolgi a noi gli occhi tuoi misericordiosi.\nE mostraci, dopo questo esilio, Gesù,\nil frutto benedetto del tuo seno.\nO clemente, o pia,\no dolce Vergine Maria.\nPrega per noi, Santa Madre di Dio,\nperché siamo resi degni delle promesse di Cristo.\nAmen.`,
  },
  memorare: {
    title: 'Memorare',
    description: 'Una potente preghiera di fiducia nell\'intercessione di Maria',
    text: `Ricordati, o piissima Vergine Maria,\nche non si è mai udito al mondo\nche alcuno sia ricorso alla tua protezione,\nimplorato il tuo aiuto, chiesto il tuo patrocinio,\ne sia stato abbandonato.\nAnimato da tale confidenza,\na te ricorro, o Madre, Vergine delle vergini;\na te vengo,\ne, peccatore contrito, innanzi a te mi prostro.\nNon volere, o Madre del Verbo,\ndisprezzare le mie preghiere,\nma ascoltale propizia ed esaudiscile.\nAmen.`,
  },
  angelus: {
    title: 'L\'Angelus',
    description: 'Una devozione che commemora l\'Incarnazione, recitata tre volte al giorno',
    text: `V. L'Angelo del Signore portò l'annuncio a Maria,\nR. Ed ella concepì per opera dello Spirito Santo.\nAve Maria...\n\nV. Ecco l'ancella del Signore,\nR. Si faccia in me secondo la tua parola.\nAve Maria...\n\nV. E il Verbo si fece carne,\nR. E venne ad abitare in mezzo a noi.\nAve Maria...\n\nV. Prega per noi, Santa Madre di Dio,\nR. Perché siamo resi degni delle promesse di Cristo.\n\nPreghiamo:\nInfondi nel nostro spirito la tua grazia, o Padre;\ntu, che nell'annuncio dell'Angelo\nci hai rivelato l'incarnazione del tuo Figlio,\nper la sua passione e la sua croce\nguidaci alla gloria della risurrezione.\nPer Cristo nostro Signore.\nAmen.`,
  },
  anima_christi: {
    title: 'Anima Christi',
    description: 'Anima di Cristo, santificami — una preghiera di intima unione',
    text: `Anima di Cristo, santificami.\nCorpo di Cristo, salvami.\nSangue di Cristo, inebriami.\nAcqua del costato di Cristo, lavami.\nPassione di Cristo, fortificami.\nO buon Gesù, esaudiscimi.\nDentro le tue piaghe, nascondimi.\nNon permettere che io mi separi da te.\nDal nemico maligno, difendimi.\nNell'ora della mia morte, chiamami\ne comandami di venire a te,\nperché con i tuoi Santi ti lodi\nnei secoli dei secoli.\nAmen.`,
  },
  come_holy_spirit: {
    title: 'Vieni, Spirito Santo',
    description: 'Invocazione dello Spirito Santo per guida e grazia',
    text: `Vieni, Spirito Santo, riempi i cuori dei tuoi fedeli\ne accendi in essi il fuoco del tuo amore.\nManda il tuo Spirito, e saranno creati.\nE rinnoverai la faccia della terra.\n\nO Dio, che nella luce dello Spirito Santo\nhai istruito i cuori dei fedeli,\nconcedi che per mezzo dello stesso Spirito\npossiamo avere il gusto del bene\ne godere sempre della sua consolazione.\nPer Cristo nostro Signore.\nAmen.`,
  },
  prayer_st_joseph: {
    title: 'Preghiera a San Giuseppe',
    description: 'Cercare l\'intercessione del patrono della Chiesa universale',
    text: `O San Giuseppe,\nla cui protezione è così grande, così forte, così pronta\ndinanzi al trono di Dio,\naffido a te tutti i miei interessi e desideri.\nO San Giuseppe, assistimi con la tua potente intercessione\ne ottienimi dal tuo divino Figlio\ntutte le benedizioni spirituali per Gesù Cristo, nostro Signore;\ncosì che, avendo sperimentato quaggiù il tuo potere celeste,\npossa offrire il mio ringraziamento e omaggio\nal più amorevole dei Padri.\nO San Giuseppe, non mi stanco di contemplarti\ncon Gesù addormentato tra le tue braccia.\nNon oso avvicinarmi mentre Egli riposa vicino al tuo cuore.\nStringilo a nome mio e bacia il suo dolce capo per me,\ne chiedigli di ricambiare il bacio quando esalerò l'ultimo respiro.\nSan Giuseppe, patrono delle anime morenti, prega per noi.\nAmen.`,
  },
  st_michael_prayer: {
    title: 'Preghiera a San Michele',
    description: 'La grande preghiera di protezione contro il male',
    text: `San Michele Arcangelo,\ndifendici nella battaglia.\nSii tu nostro sostegno contro la perfidia e le insidie del diavolo.\nChe Dio eserciti il suo dominio su di lui, te ne preghiamo supplichevoli.\nE tu, o Principe della milizia celeste,\ncon la potenza divina,\nricaccia nell'inferno Satana\ne gli altri spiriti maligni\nche vagano per il mondo\na perdizione delle anime.\nAmen.`,
  },
  fatima_prayer: {
    title: 'Preghiera di Fatima',
    description: 'La preghiera richiesta dalla Madonna di Fatima',
    text: `O Gesù mio,\nperdona le nostre colpe,\npreservaci dal fuoco dell'inferno,\nporta in cielo tutte le anime,\nspecialmente le più bisognose della tua misericordia.\nAmen.`,
  },
  divine_mercy_chaplet_opening: {
    title: 'Coroncina della Divina Misericordia',
    description: 'La coroncina data a Santa Faustina — preghiere di fiducia e misericordia',
    text: `Sei spirato, Gesù, ma la sorgente di vita è sgorgata per le anime,\ne l'oceano di misericordia si è aperto per il mondo intero.\nO Sorgente di Vita, insondabile Divina Misericordia,\navvolgi il mondo intero e riversati su di noi.\n\nO Sangue e Acqua, che sei sgorgato dal Cuore di Gesù\ncome sorgente di Misericordia per noi, confido in Te!\n\nPadre Nostro...\nAve Maria...\nCredo Apostolico...\n\nSui grani grandi:\nPadre Eterno, Ti offro il Corpo e il Sangue,\nl'Anima e la Divinità del tuo dilettissimo Figlio,\nnostro Signore Gesù Cristo,\nin espiazione dei nostri peccati e di quelli del mondo intero.\n\nSui grani piccoli:\nPer la sua dolorosa Passione,\nabbi misericordia di noi e del mondo intero.\n\nFinale (3 volte):\nSanto Dio, Santo Forte, Santo Immortale,\nabbi pietà di noi e del mondo intero.`,
  },
  act_of_contrition: {
    title: 'Atto di Dolore',
    description: 'La preghiera di pentimento detta durante la confessione',
    text: `Mio Dio,\nmi pento e mi dolgo con tutto il cuore dei miei peccati,\nperché peccando ho meritato i tuoi castighi,\ne molto più perché ho offeso te,\ninfinitamente buono e degno di essere amato sopra ogni cosa.\nPropongo con il tuo santo aiuto\ndi non offenderti mai più\ne di fuggire le occasioni prossime di peccato.\nSignore, misericordia, perdonami.\nAmen.`,
  },
  examination_prayer: {
    title: 'Preghiera prima dell\'Esame di Coscienza',
    description: 'Una preghiera per invocare lo Spirito Santo prima di esaminare la coscienza',
    text: `Vieni, Spirito Santo,\nillumina la mia mente perché conosca chiaramente i miei peccati.\nMuovi il mio cuore perché me ne penta sinceramente,\nfermamente risoluto a non commetterli più,\ne pienamente determinato a evitare le occasioni di peccato.\nO Beata Vergine Maria, Madre di Dio,\nprega per me.\nSan Giuseppe, prega per me.\nAngelo mio custode, prega per me.\nAmen.`,
  },
  morning_offering: {
    title: 'Offerta del Mattino',
    description: 'Dedicare l\'intera giornata a Dio',
    text: `O Gesù, per il Cuore Immacolato di Maria,\nti offro le preghiere, le opere, le gioie e le sofferenze di questa giornata\nin unione con il Santo Sacrificio della Messa in tutto il mondo.\nTe le offro per tutte le intenzioni del tuo Sacro Cuore:\nla salvezza delle anime, la riparazione per il peccato\ne la riunione di tutti i cristiani.\nTe le offro per le intenzioni dei nostri vescovi\ne di tutti gli Apostoli della Preghiera,\ne in particolare per quelle raccomandate dal nostro Santo Padre questo mese.\nAmen.`,
  },
  evening_prayer: {
    title: 'Preghiera della Sera',
    description: 'Una preghiera di gratitudine e abbandono alla fine della giornata',
    text: `Veglia, o Signore, con coloro che vegliano,\no vigilano, o piangono stanotte,\ne affida ai tuoi angeli e santi la custodia di quelli che dormono.\nCura i tuoi malati, o Signore Gesù.\nDa riposo ai tuoi stanchi.\nBenedici i tuoi morenti.\nConsola i tuoi sofferenti.\nAbbi pietà dei tuoi afflitti.\nProteggi i tuoi gioiosi.\nE tutto per il tuo amore.\nAmen.\n\nVisita, ti preghiamo, o Signore, questa dimora,\ne allontana da essa tutte le insidie del nemico;\ni tuoi santi angeli vi dimorino per custodirci nella pace;\ne la tua benedizione sia su tutti coloro che vi abitano.\nPer Cristo nostro Signore.\nAmen.`,
  },
  anima_christi_eucharistic: {
    title: 'Preghiera davanti al Santissimo Sacramento',
    description: 'Una preghiera di adorazione in presenza dell\'Eucaristia',
    text: `O Sacramento santissimo, o Sacramento divino,\nogni lode e ogni ringraziamento sia in ogni momento a te.\n\nSignore Gesù Cristo, ci hai dato l'Eucaristia\ncome memoriale della tua sofferenza e morte.\nChe la nostra adorazione di questo sacramento del tuo Corpo e Sangue\nci aiuti a sperimentare la salvezza che ci hai ottenuto\ne la pace del regno,\ndove tu vivi con il Padre e lo Spirito Santo,\nun solo Dio, nei secoli dei secoli.\nAmen.`,
  },
  prayer_for_the_dead: {
    title: 'Preghiera per i Fedeli Defunti',
    description: 'Una preghiera per coloro che ci hanno preceduto',
    text: `L'eterno riposo dona loro, o Signore,\ne splenda ad essi la luce perpetua.\nLe anime dei fedeli defunti,\nper la misericordia di Dio,\nriposino in pace.\nAmen.\n\nLe loro anime e le anime di tutti i fedeli defunti,\nper la misericordia di Dio,\nriposino in pace.\nAmen.`,
  },
  prayer_before_meals: {
    title: 'Preghiera prima dei Pasti',
    description: 'Benedizione prima di mangiare',
    text: `Benedici, Signore,\nnoi e questi doni\nche stiamo per ricevere\ndalla tua bontà.\nPer Cristo nostro Signore.\nAmen.`,
  },
  prayer_after_meals: {
    title: 'Preghiera dopo i Pasti',
    description: 'Ringraziamento dopo aver mangiato',
    text: `Ti ringraziamo, Dio onnipotente,\nper tutti i tuoi benefici,\ntu che vivi e regni\nnei secoli dei secoli.\nAmen.\n\nLe anime dei fedeli defunti,\nper la misericordia di Dio,\nriposino in pace.\nAmen.`,
  },
  prayer_discernment: {
    title: 'Preghiera per il Discernimento',
    description: 'Cercare la volontà di Dio nelle decisioni',
    text: `Signore, concedimi la grazia di conoscere la tua volontà,\nil coraggio di seguirla\ne la pazienza di attendere i tuoi tempi.\nApri i miei occhi per vedere la tua mano all'opera.\nQuieta il mio cuore affinché possa udire la tua voce.\nRimuovi ogni paura e dubbio,\ne sostituiscili con la fiducia nella tua provvidenza.\nChe il tuo Spirito Santo guidi ogni mio passo.\nPer Cristo nostro Signore.\nAmen.`,
  },
  prayer_strength: {
    title: 'Preghiera per la Forza nella Sofferenza',
    description: 'Trovare coraggio e grazia nei tempi di prova',
    text: `Signore Gesù Cristo,\ntu hai portato il peso della croce per me.\nConcedimi la forza di portare le mie croci\ncon fede, pazienza e amore.\nQuando sono stanco, sii il mio riposo.\nQuando ho paura, sii il mio coraggio.\nQuando sono solo, sii il mio compagno.\nUnisci le mie sofferenze alle tue\nper la salvezza delle anime.\nAmen.`,
  },
  prayer_family: {
    title: 'Preghiera per il Coniuge e la Famiglia',
    description: 'Affidare i propri cari alle cure di Dio',
    text: `Signore Dio, benedici la mia famiglia.\nProteggici dal male e conservaci nella tua grazia.\nConcedici pazienza, bontà e perdono gli uni verso gli altri.\nRafforza i vincoli d'amore tra noi.\nAiutaci a crescere insieme nella fede\ne a cercare sempre la tua volontà nella nostra casa.\nChe la nostra famiglia sia testimonianza del tuo amore nel mondo.\nPer Cristo nostro Signore.\nAmen.`,
  },
  novena_framework: {
    title: 'Struttura della Novena',
    description: 'Una struttura di preghiera di nove giorni per qualsiasi intenzione',
    text: `Nel nome del Padre, del Figlio e dello Spirito Santo. Amen.\n\nPreghiera di apertura:\nDio mio, vengo davanti a te con fiducia,\nsapendo che ascolti le preghiere dei tuoi figli.\nInizio questa novena con fede nella tua bontà\ne fiducia nella tua volontà.\n\n[Esprimi qui la tua intenzione in silenzio o ad alta voce.]\n\nPreghiera del giorno:\nSignore, unisco la mia preghiera alle preghiere di tutti i santi\nche intercedono per noi davanti al tuo trono.\nConcedimi la grazia di cui ho bisogno oggi\nper crescere in santità e fiducia.\n\nPadre Nostro...\nAve Maria...\nGloria al Padre...\n\nPreghiera finale:\nO Dio, che nella tua infinita misericordia\nascolti le preghiere del tuo popolo,\nconcedi che ciò che chiedo con fede\nmi sia dato secondo la tua santa volontà.\nPer Cristo nostro Signore.\nAmen.`,
  },
  psalm_23: {
    title: 'Salmo 23 — Il Signore è il mio Pastore',
    description: 'Un salmo amato di fiducia e conforto',
    text: `Il Signore è il mio pastore: non manco di nulla.\nSu pascoli erbosi mi fa riposare,\nad acque tranquille mi conduce.\nRinfranca l'anima mia,\nmi guida per il giusto cammino a motivo del suo nome.\nAnche se vado per una valle oscura,\nnon temo alcun male, perché tu sei con me.\nIl tuo bastone e il tuo vincastro mi danno sicurezza.\nDavanti a me tu prepari una mensa sotto gli occhi dei miei nemici.\nMi ungi il capo con olio; il mio calice trabocca.\nSì, bontà e fedeltà mi saranno compagne tutti i giorni della mia vita,\ne abiterò nella casa del Signore per lunghissimi anni.`,
  },
};

const pt: PrayerTranslationMap = {
  sign_of_cross: {
    title: 'Sinal da Cruz',
    description: 'A oração e gesto católico mais fundamental',
    text: `Em nome do Pai,\ne do Filho,\ne do Espírito Santo.\nAmém.`,
  },
  our_father: {
    title: 'Pai Nosso',
    description: 'A oração do Senhor ensinada pelo próprio Jesus',
    text: `Pai nosso, que estais no céu,\nsantificado seja o vosso nome;\nvenha a nós o vosso reino;\nseja feita a vossa vontade,\nassim na terra como no céu.\nO pão nosso de cada dia nos dai hoje;\nperdoai-nos as nossas ofensas,\nassim como nós perdoamos a quem nos tem ofendido;\ne não nos deixeis cair em tentação,\nmas livrai-nos do mal.\nAmém.`,
  },
  hail_mary: {
    title: 'Ave Maria',
    description: 'A oração mais amada à Mãe Santíssima',
    text: `Ave Maria, cheia de graça,\no Senhor é convosco.\nBendita sois vós entre as mulheres,\ne bendito é o fruto do vosso ventre, Jesus.\nSanta Maria, Mãe de Deus,\nrogai por nós, pecadores,\nagora e na hora da nossa morte.\nAmém.`,
  },
  glory_be: {
    title: 'Glória ao Pai',
    description: 'Uma breve doxologia louvando a Santíssima Trindade',
    text: `Glória ao Pai,\nao Filho\ne ao Espírito Santo.\nComo era no princípio,\nagora e sempre.\nAmém.`,
  },
  apostles_creed: {
    title: 'Credo dos Apóstolos',
    description: 'Um resumo da fé dos apóstolos',
    text: `Creio em Deus Pai todo-poderoso,\nCriador do céu e da terra.\nE em Jesus Cristo, seu único Filho, nosso Senhor,\nque foi concebido pelo poder do Espírito Santo,\nnasceu da Virgem Maria,\npadeceu sob Pôncio Pilatos,\nfoi crucificado, morto e sepultado,\ndesceu à mansão dos mortos,\nressuscitou ao terceiro dia,\nsubiu aos céus,\nestá sentado à direita de Deus Pai todo-poderoso,\nde onde há de vir a julgar os vivos e os mortos.\nCreio no Espírito Santo,\nna santa Igreja católica,\nna comunhão dos santos,\nna remissão dos pecados,\nna ressurreição da carne,\nna vida eterna.\nAmém.`,
  },
  nicene_creed: {
    title: 'Credo Niceno',
    description: 'O credo professado em toda Missa dominical',
    text: `Creio em um só Deus,\nPai todo-poderoso,\nCriador do céu e da terra,\nde todas as coisas visíveis e invisíveis.\nCreio em um só Senhor, Jesus Cristo,\nFilho Unigénito de Deus,\nnascido do Pai antes de todos os séculos.\nDeus de Deus, Luz da Luz,\nDeus verdadeiro de Deus verdadeiro,\ngerado, não criado, consubstancial ao Pai;\npor ele todas as coisas foram feitas.\nE por nós, homens,\ne para nossa salvação, desceu dos céus,\ne se encarnou pelo Espírito Santo,\nno seio da Virgem Maria,\ne se fez homem.\nTambém por nós foi crucificado sob Pôncio Pilatos;\npadeceu e foi sepultado.\nRessuscitou ao terceiro dia, conforme as Escrituras,\ne subiu aos céus, onde está sentado à direita do Pai.\nE de novo há de vir, em sua glória,\npara julgar os vivos e os mortos;\ne o seu reino não terá fim.\nCreio no Espírito Santo, Senhor que dá a vida,\ne procede do Pai e do Filho;\ne com o Pai e o Filho é adorado e glorificado;\nele que falou pelos profetas.\nCreio na Igreja, una, santa, católica e apostólica.\nProfesso um só batismo para remissão dos pecados.\nE espero a ressurreição dos mortos\ne a vida do mundo que há de vir.\nAmém.`,
  },
  guardian_angel: {
    title: 'Oração ao Anjo da Guarda',
    description: 'Invocando a proteção do seu anjo da guarda',
    text: `Santo Anjo do Senhor,\nmeu zeloso guardador,\nse a ti me confiou\na piedade divina,\nsempre me rege,\nme guarda, me governa\ne me ilumina.\nAmém.`,
  },
  hail_holy_queen: {
    title: 'Salve Rainha',
    description: 'Uma bela oração de louvor a Nossa Senhora',
    text: `Salve, Rainha, Mãe de misericórdia,\nvida, doçura e esperança nossa, salve!\nA vós bradamos, os degredados filhos de Eva;\na vós suspiramos, gemendo e chorando\nneste vale de lágrimas.\nEia, pois, advogada nossa,\nesses vossos olhos misericordiosos a nós volvei;\ne depois deste desterro nos mostrai Jesus,\nbenedito fruto do vosso ventre.\nÓ clemente, ó piedosa,\nó doce sempre Virgem Maria.\nRogai por nós, Santa Mãe de Deus,\npara que sejamos dignos das promessas de Cristo.\nAmém.`,
  },
  memorare: {
    title: 'Lembrai-vos',
    description: 'Uma poderosa oração de confiança na intercessão de Maria',
    text: `Lembrai-vos, ó piíssima Virgem Maria,\nque jamais se ouviu dizer\nque algum daqueles que recorreu à vossa proteção,\nimplorou a vossa assistência ou reclamou o vosso socorro,\nfosse por vós desamparado.\nAnimado eu com igual confiança,\na vós, Virgem entre as virgens e Mãe, recorro;\nde vós me valho,\ne, gemendo sob o peso dos meus pecados, me prostro a vossos pés.\nNão desprezeis as minhas súplicas,\nó Mãe do Verbo encarnado,\nmas dignai-vos de as ouvir e acolher benignamente.\nAmém.`,
  },
  angelus: {
    title: 'O Ângelus',
    description: 'Devoção que comemora a Encarnação, rezada três vezes ao dia',
    text: `V. O Anjo do Senhor anunciou a Maria,\nR. E ela concebeu do Espírito Santo.\nAve Maria...\n\nV. Eis aqui a serva do Senhor,\nR. Faça-se em mim segundo a vossa palavra.\nAve Maria...\n\nV. E o Verbo se fez carne,\nR. E habitou entre nós.\nAve Maria...\n\nV. Rogai por nós, Santa Mãe de Deus,\nR. Para que sejamos dignos das promessas de Cristo.\n\nOremos:\nDerramai, Senhor, a vossa graça em nossas almas,\npara que nós, que pela anunciação do Anjo\nconhecemos a Encarnação de Cristo, vosso Filho,\npela sua Paixão e Cruz\nsejamos levados à glória da Ressurreição.\nPelo mesmo Cristo, nosso Senhor.\nAmém.`,
  },
  anima_christi: {
    title: 'Alma de Cristo',
    description: 'Alma de Cristo, santificai-me — uma oração de íntima união',
    text: `Alma de Cristo, santificai-me.\nCorpo de Cristo, salvai-me.\nSangue de Cristo, inebriai-me.\nÁgua do lado de Cristo, lavai-me.\nPaixão de Cristo, confortai-me.\nÓ bom Jesus, ouvi-me.\nDentro das vossas chagas, escondei-me.\nNão permitais que eu me separe de vós.\nDo inimigo maligno, defendei-me.\nNa hora da minha morte, chamai-me\ne mandai-me ir para vós,\npara que com os vossos Santos vos louve\npelos séculos dos séculos.\nAmém.`,
  },
  come_holy_spirit: {
    title: 'Vinde, Espírito Santo',
    description: 'Invocação do Espírito Santo para orientação e graça',
    text: `Vinde, Espírito Santo, enchei os corações dos vossos fiéis\ne acendei neles o fogo do vosso amor.\nEnviai o vosso Espírito, e tudo será criado.\nE renovareis a face da terra.\n\nÓ Deus, que pela luz do Espírito Santo\ninstruístes os corações dos fiéis,\nconcedei-nos que pelo mesmo Espírito\nsintamos o que é reto\ne gozemos sempre das suas consolações.\nPor Cristo nosso Senhor.\nAmém.`,
  },
  prayer_st_joseph: {
    title: 'Oração a São José',
    description: 'Buscando a intercessão do padroeiro da Igreja universal',
    text: `Ó São José,\ncuja proteção é tão grande, tão forte, tão pronta\ndiante do trono de Deus,\ncoloco em vós todos os meus interesses e desejos.\nÓ São José, assisti-me pela vossa poderosa intercessão\ne obtende para mim de vosso divino Filho\ntodas as bênçãos espirituais por Jesus Cristo, nosso Senhor;\nde modo que, tendo experimentado aqui na terra o vosso poder celestial,\npossa oferecer o meu agradecimento e homenagem\nao mais amoroso dos Pais.\nÓ São José, nunca me canso de vos contemplar\ncom Jesus adormecido em vossos braços.\nNão ouso aproximar-me enquanto Ele repousa junto ao vosso coração.\nApertai-O em meu nome e beijai a sua doce cabeça por mim,\ne pedi-Lhe que retribua o beijo quando eu exhalar o meu último suspiro.\nSão José, padroeiro das almas que partem, rogai por nós.\nAmém.`,
  },
  st_michael_prayer: {
    title: 'Oração a São Miguel',
    description: 'A grande oração de proteção contra o mal',
    text: `São Miguel Arcanjo,\ndefendei-nos no combate.\nSede nosso refúgio contra a maldade e as ciladas do demônio.\nInstantemente vos pedimos que Deus sobre ele impere.\nE vós, Príncipe da milícia celeste,\npelo divino poder,\nprecipitai no inferno Satanás\ne os outros espíritos malignos\nque andam pelo mundo\npara perder as almas.\nAmém.`,
  },
  fatima_prayer: {
    title: 'Oração de Fátima',
    description: 'A oração pedida por Nossa Senhora de Fátima',
    text: `Ó meu Jesus,\nperdoai-nos, livrai-nos do fogo do inferno,\nlevai as almas todas para o céu,\nprincipalmente as que mais precisarem\nda vossa misericórdia.\nAmém.`,
  },
  divine_mercy_chaplet_opening: {
    title: 'Terço da Divina Misericórdia',
    description: 'O terço dado a Santa Faustina — orações de confiança e misericórdia',
    text: `Expirastes, Jesus, mas a fonte da vida jorrrou para as almas,\ne o oceano da misericórdia se abriu para o mundo inteiro.\nÓ Fonte de Vida, insondável Divina Misericórdia,\nenvolvei o mundo inteiro e derramai-vos sobre nós.\n\nÓ Sangue e Água, que jorrastes do Coração de Jesus\ncomo fonte de Misericórdia para nós, eu confio em Vós!\n\nPai Nosso...\nAve Maria...\nCreio em Deus Pai...\n\nNas contas grandes:\nPai Eterno, eu Vos ofereço o Corpo e o Sangue,\na Alma e a Divindade do vosso diletíssimo Filho,\nnosso Senhor Jesus Cristo,\nem expiação dos nossos pecados e dos do mundo inteiro.\n\nNas contas pequenas:\nPela sua dolorosa Paixão,\ntende misericórdia de nós e do mundo inteiro.\n\nFinal (3 vezes):\nDeus Santo, Deus Forte, Deus Imortal,\ntende piedade de nós e do mundo inteiro.`,
  },
  act_of_contrition: {
    title: 'Ato de Contrição',
    description: 'A oração de arrependimento dita durante a confissão',
    text: `Meu Deus,\neu me arrependo de todo coração de vos ter ofendido,\ne detesto todos os meus pecados\nporque temo a perda do céu\ne as penas do inferno;\nmas sobretudo porque vos ofendem a vós, meu Deus,\nque sois infinitamente bom e digno de todo o meu amor.\nProponho firmemente,\ncom a ajuda da vossa graça,\nconfessar os meus pecados,\ncumprir a penitência\ne emendar a minha vida.\nAmém.`,
  },
  examination_prayer: {
    title: 'Oração antes do Exame de Consciência',
    description: 'Uma oração para invocar o Espírito Santo antes de examinar a consciência',
    text: `Vinde, Espírito Santo,\niluminai a minha mente para que conheça claramente os meus pecados.\nMovei o meu coração para que me arrependa sinceramente deles,\nfirmemente resolvido a não os cometer mais,\ne inteiramente determinado a evitar as ocasiões de pecado.\nÓ Bem-aventurada Virgem Maria, Mãe de Deus,\nrogai por mim.\nSão José, rogai por mim.\nAnjo da minha guarda, rogai por mim.\nAmém.`,
  },
  morning_offering: {
    title: 'Oferecimento da Manhã',
    description: 'Dedicar todo o seu dia a Deus',
    text: `Ó Jesus, pelo Imaculado Coração de Maria,\neu vos ofereço as minhas orações, obras, alegrias e sofrimentos deste dia\nem união com o Santo Sacrifício da Missa em todo o mundo.\nOfereço-os por todas as intenções do vosso Sagrado Coração:\na salvação das almas, a reparação pelo pecado\ne a reunião de todos os cristãos.\nOfereço-os pelas intenções dos nossos bispos\ne de todos os Apóstolos da Oração,\ne em particular pelas recomendadas pelo nosso Santo Padre este mês.\nAmém.`,
  },
  evening_prayer: {
    title: 'Oração da Noite',
    description: 'Uma oração de gratidão e entrega ao final do dia',
    text: `Velai, ó Senhor, com aqueles que velam,\nou vigiam, ou choram esta noite,\ne encarregai os vossos anjos e santos de guardar os que dormem.\nCuidai dos vossos doentes, ó Senhor Jesus.\nDai descanso aos vossos cansados.\nAbençoai os vossos moribundos.\nConsolai os vossos sofredores.\nCompadecei-vos dos vossos aflitos.\nProtegei os vossos alegres.\nE tudo pelo vosso amor.\nAmém.\n\nVisitai, vos suplicamos, ó Senhor, esta morada,\ne afastai dela todas as ciladas do inimigo;\nque os vossos santos anjos nela habitem para nos conservar em paz;\ne que a vossa bênção seja sobre todos os que nela moram.\nPor Jesus Cristo nosso Senhor.\nAmém.`,
  },
  anima_christi_eucharistic: {
    title: 'Oração diante do Santíssimo Sacramento',
    description: 'Uma oração de adoração na presença da Eucaristia',
    text: `Ó Sacramento santíssimo, ó Sacramento divino,\ntodo louvor e toda ação de graças vos sejam dados a cada momento.\n\nSenhor Jesus Cristo, nos destes a Eucaristia\ncomo memorial do vosso sofrimento e morte.\nQue a nossa adoração deste sacramento do vosso Corpo e Sangue\nnos ajude a experimentar a salvação que nos conquistastes\ne a paz do reino,\nonde viveis com o Pai e o Espírito Santo,\num só Deus, pelos séculos dos séculos.\nAmém.`,
  },
  prayer_for_the_dead: {
    title: 'Oração pelos Fiéis Defuntos',
    description: 'Uma oração por aqueles que nos precederam',
    text: `Dai-lhes, Senhor, o eterno descanso,\ne brilhe para eles a luz perpétua.\nAs almas dos fiéis defuntos,\npela misericórdia de Deus,\ndescansem em paz.\nAmém.\n\nAs suas almas e as almas de todos os fiéis defuntos,\npela misericórdia de Deus,\ndescansem em paz.\nAmém.`,
  },
  prayer_before_meals: {
    title: 'Oração antes das Refeições',
    description: 'Bênção antes de comer',
    text: `Abençoai-nos, Senhor,\ne a estes dons\nque vamos receber\nda vossa bondade.\nPor Cristo nosso Senhor.\nAmém.`,
  },
  prayer_after_meals: {
    title: 'Oração depois das Refeições',
    description: 'Ação de graças depois de comer',
    text: `Graças vos damos, Deus todo-poderoso,\npor todos os vossos benefícios,\nvós que viveis e reinais\npelos séculos dos séculos.\nAmém.\n\nAs almas dos fiéis defuntos,\npela misericórdia de Deus,\ndescansem em paz.\nAmém.`,
  },
  prayer_discernment: {
    title: 'Oração pelo Discernimento',
    description: 'Buscando a vontade de Deus nas decisões',
    text: `Senhor, concedei-me a graça de conhecer a vossa vontade,\na coragem de segui-la\ne a paciência de esperar o vosso tempo.\nAbri os meus olhos para ver a vossa mão agindo.\nAquietai o meu coração para que eu possa ouvir a vossa voz.\nRetirai todo medo e dúvida,\ne substituí-os pela confiança na vossa providência.\nQue o vosso Espírito Santo guie cada um dos meus passos.\nPor Cristo nosso Senhor.\nAmém.`,
  },
  prayer_strength: {
    title: 'Oração pela Fortaleza no Sofrimento',
    description: 'Encontrar coragem e graça nos tempos de provação',
    text: `Senhor Jesus Cristo,\nvós suportastes o peso da cruz por mim.\nConcedei-me a fortaleza para carregar as minhas próprias cruzes\ncom fé, paciência e amor.\nQuando eu estiver cansado, sede o meu descanso.\nQuando eu tiver medo, sede a minha coragem.\nQuando eu estiver só, sede o meu companheiro.\nUni os meus sofrimentos aos vossos\npela salvação das almas.\nAmém.`,
  },
  prayer_family: {
    title: 'Oração pelo Cônjuge e pela Família',
    description: 'Encomendando os seus entes queridos ao cuidado de Deus',
    text: `Senhor Deus, abençoai a minha família.\nProtegei-nos do mal e conservai-nos na vossa graça.\nConcedei-nos paciência, bondade e perdão uns para com os outros.\nFortalecei os laços de amor entre nós.\nAjudai-nos a crescer juntos na fé\ne a buscar sempre a vossa vontade na nossa casa.\nQue a nossa família seja testemunha do vosso amor no mundo.\nPor Cristo nosso Senhor.\nAmém.`,
  },
  novena_framework: {
    title: 'Estrutura da Novena',
    description: 'Uma estrutura de oração de nove dias para qualquer intenção',
    text: `Em nome do Pai, do Filho e do Espírito Santo. Amém.\n\nOração de abertura:\nMeu Deus, venho diante de vós com confiança,\nsabendo que ouvis as orações dos vossos filhos.\nComeço esta novena com fé na vossa bondade\ne confiança na vossa vontade.\n\n[Expresse aqui a sua intenção em silêncio ou em voz alta.]\n\nOração do dia:\nSenhor, uno a minha oração às orações de todos os santos\nque intercedem por nós diante do vosso trono.\nConcedei-me a graça que preciso neste dia\npara crescer em santidade e confiança.\n\nPai Nosso...\nAve Maria...\nGlória ao Pai...\n\nOração final:\nÓ Deus, que na vossa infinita misericórdia\nouvis as orações do vosso povo,\nconcedei que o que peço com fé\nme seja dado segundo a vossa santa vontade.\nPor Cristo nosso Senhor.\nAmém.`,
  },
  psalm_23: {
    title: 'Salmo 23 — O Senhor é meu Pastor',
    description: 'Um salmo amado de confiança e conforto',
    text: `O Senhor é meu pastor; nada me faltará.\nEm verdes prados ele me faz repousar.\nPara junto das águas de descanso ele me conduz.\nEle restaura a minha alma;\nguia-me pelas veredas da justiça por amor do seu nome.\nAinda que eu ande pelo vale da sombra da morte,\nnão temerei mal algum, porque tu estás comigo;\no teu bordão e o teu cajado me consolam.\nPreparas-me uma mesa na presença dos meus inimigos;\nunges-me a cabeça com óleo; o meu cálice transborda.\nCertamente a bondade e a misericórdia me seguirão todos os dias da minha vida;\ne habitarei na casa do Senhor para sempre.`,
  },
};

const fr: PrayerTranslationMap = {
  sign_of_cross: {
    title: 'Le Signe de la Croix',
    description: 'La prière et le geste catholique le plus fondamental',
    text: `Au nom du Père,\net du Fils,\net du Saint-Esprit.\nAmen.`,
  },
  our_father: {
    title: 'Notre Père',
    description: 'La prière du Seigneur enseignée par Jésus lui-même',
    text: `Notre Père, qui es aux cieux,\nque ton nom soit sanctifié,\nque ton règne vienne,\nque ta volonté soit faite\nsur la terre comme au ciel.\nDonne-nous aujourd'hui notre pain de ce jour.\nPardonne-nous nos offenses,\ncomme nous pardonnons aussi à ceux qui nous ont offensés.\nEt ne nous laisse pas entrer en tentation,\nmais délivre-nous du Mal.\nAmen.`,
  },
  hail_mary: {
    title: 'Je vous salue, Marie',
    description: 'La prière la plus aimée à la Bienheureuse Mère',
    text: `Je vous salue, Marie, pleine de grâce,\nle Seigneur est avec vous.\nVous êtes bénie entre toutes les femmes,\net Jésus, le fruit de vos entrailles, est béni.\nSainte Marie, Mère de Dieu,\npriez pour nous, pauvres pécheurs,\nmaintenant et à l'heure de notre mort.\nAmen.`,
  },
  glory_be: {
    title: 'Gloire au Père',
    description: 'Une courte doxologie louant la Sainte Trinité',
    text: `Gloire au Père,\net au Fils,\net au Saint-Esprit.\nComme il était au commencement,\nmaintenant et toujours,\net dans les siècles des siècles.\nAmen.`,
  },
  apostles_creed: {
    title: 'Le Symbole des Apôtres',
    description: 'Un résumé de la foi des apôtres',
    text: `Je crois en Dieu, le Père tout-puissant,\nCréateur du ciel et de la terre.\nEt en Jésus Christ, son Fils unique, notre Seigneur,\nqui a été conçu du Saint-Esprit,\nest né de la Vierge Marie,\na souffert sous Ponce Pilate,\na été crucifié, est mort et a été enseveli,\nest descendu aux enfers ;\nle troisième jour est ressuscité des morts,\nest monté aux cieux,\nest assis à la droite de Dieu le Père tout-puissant,\nd'où il viendra juger les vivants et les morts.\nJe crois en l'Esprit Saint,\nà la sainte Église catholique,\nà la communion des saints,\nà la rémission des péchés,\nà la résurrection de la chair,\nà la vie éternelle.\nAmen.`,
  },
  nicene_creed: {
    title: 'Le Symbole de Nicée',
    description: 'Le credo professé à chaque messe dominicale',
    text: `Je crois en un seul Dieu,\nle Père tout-puissant,\ncréateur du ciel et de la terre,\nde l'univers visible et invisible.\nJe crois en un seul Seigneur, Jésus Christ,\nle Fils unique de Dieu,\nné du Père avant tous les siècles.\nIl est Dieu, né de Dieu, Lumière, née de la Lumière,\nvrai Dieu, né du vrai Dieu,\nengendré, non pas créé, de même nature que le Père ;\net par lui tout a été fait.\nPour nous les hommes, et pour notre salut,\nil descendit du ciel ;\npar l'Esprit Saint, il a pris chair de la Vierge Marie,\net s'est fait homme.\nCrucifié pour nous sous Ponce Pilate,\nil souffrit sa passion et fut mis au tombeau.\nIl ressuscita le troisième jour, conformément aux Écritures,\net il monta au ciel ; il est assis à la droite du Père.\nIl reviendra dans la gloire,\npour juger les vivants et les morts ;\net son règne n'aura pas de fin.\nJe crois en l'Esprit Saint, qui est Seigneur et qui donne la vie ;\nil procède du Père et du Fils.\nAvec le Père et le Fils, il reçoit même adoration et même gloire ;\nil a parlé par les prophètes.\nJe crois en l'Église, une, sainte, catholique et apostolique.\nJe reconnais un seul baptême pour le pardon des péchés.\nJ'attends la résurrection des morts,\net la vie du monde à venir.\nAmen.`,
  },
  guardian_angel: {
    title: 'Prière à l\'Ange Gardien',
    description: 'Invoquer la protection de votre ange gardien',
    text: `Ange de Dieu,\nmon cher gardien,\nà qui l'amour de Dieu\nm'a confié ici-bas,\néclairez-moi, gardez-moi,\ndirigez-moi et gouvernez-moi\nen ce jour.\nAmen.`,
  },
  hail_holy_queen: {
    title: 'Salve Regina',
    description: 'Une belle prière de louange à Notre Dame',
    text: `Salut, ô Reine, Mère de miséricorde,\nnotre vie, notre douceur et notre espérance, salut !\nEnfants d'Ève, exilés, nous crions vers vous ;\nvers vous nous soupirons, gémissant et pleurant\ndans cette vallée de larmes.\nÔ vous, notre avocate,\ntournez vers nous vos regards miséricordieux.\nEt, après cet exil, montrez-nous Jésus,\nle fruit béni de vos entrailles.\nÔ clémente, ô miséricordieuse,\nô douce Vierge Marie.\nPriez pour nous, sainte Mère de Dieu,\nafin que nous devenions dignes des promesses de Jésus-Christ.\nAmen.`,
  },
  memorare: {
    title: 'Souvenez-vous',
    description: 'Une puissante prière de confiance en l\'intercession de Marie',
    text: `Souvenez-vous, ô très miséricordieuse Vierge Marie,\nqu'on n'a jamais entendu dire\nqu'aucun de ceux qui ont eu recours à votre protection,\nimploré votre assistance ou réclamé votre secours,\nait été abandonné.\nAnimé d'une pareille confiance,\nô Vierge des vierges, ô ma Mère,\nje cours vers vous ;\nà vous je viens, pécheur gémissant, me prosterner à vos pieds.\nÔ Mère du Verbe incarné,\nne dédaignez pas mes prières,\nmais écoutez-les favorablement et daignez les exaucer.\nAmen.`,
  },
  angelus: {
    title: 'L\'Angélus',
    description: 'Une dévotion commémorant l\'Incarnation, priée trois fois par jour',
    text: `V. L'Ange du Seigneur porta l'annonce à Marie,\nR. Et elle conçut du Saint-Esprit.\nJe vous salue, Marie...\n\nV. Voici la servante du Seigneur,\nR. Qu'il me soit fait selon votre parole.\nJe vous salue, Marie...\n\nV. Et le Verbe s'est fait chair,\nR. Et il a habité parmi nous.\nJe vous salue, Marie...\n\nV. Priez pour nous, sainte Mère de Dieu,\nR. Afin que nous devenions dignes des promesses du Christ.\n\nPrions :\nRépandez, Seigneur, votre grâce dans nos âmes,\nafin qu'ayant connu, par le message de l'Ange,\nl'incarnation de votre Fils le Christ,\nnous arrivions, par sa Passion et par sa Croix,\nà la gloire de la Résurrection.\nPar le même Jésus-Christ notre Seigneur.\nAmen.`,
  },
  anima_christi: {
    title: 'Âme du Christ',
    description: 'Âme du Christ, sanctifie-moi — une prière d\'union intime',
    text: `Âme du Christ, sanctifie-moi.\nCorps du Christ, sauve-moi.\nSang du Christ, enivre-moi.\nEau du côté du Christ, lave-moi.\nPassion du Christ, fortifie-moi.\nÔ bon Jésus, exauce-moi.\nDans tes blessures, cache-moi.\nNe permets pas que je sois séparé de toi.\nDe l'ennemi malin, défends-moi.\nÀ l'heure de ma mort, appelle-moi\net ordonne-moi de venir à toi,\nafin qu'avec tes Saints je te loue\ndans les siècles des siècles.\nAmen.`,
  },
  come_holy_spirit: {
    title: 'Viens, Esprit Saint',
    description: 'Invocation de l\'Esprit Saint pour la guidance et la grâce',
    text: `Viens, Esprit Saint, remplis le cœur de tes fidèles\net allume en eux le feu de ton amour.\nEnvoie ton Esprit, et ils seront créés.\nEt tu renouvelleras la face de la terre.\n\nÔ Dieu, qui par la lumière du Saint-Esprit\nas instruit les cœurs des fidèles,\naccorde-nous par le même Esprit\nde goûter ce qui est bien\net de jouir toujours de ses consolations.\nPar le Christ notre Seigneur.\nAmen.`,
  },
  prayer_st_joseph: {
    title: 'Prière à Saint Joseph',
    description: 'Chercher l\'intercession du patron de l\'Église universelle',
    text: `Ô Saint Joseph,\ndont la protection est si grande, si forte, si prompte\ndevant le trône de Dieu,\nje place en vous tous mes intérêts et mes désirs.\nÔ Saint Joseph, assistez-moi par votre puissante intercession\net obtenez pour moi de votre Fils divin\ntoutes les bénédictions spirituelles par Jésus-Christ, notre Seigneur ;\nafin qu'ayant éprouvé ici-bas votre pouvoir céleste,\nje puisse offrir mes actions de grâces et mon hommage\nau plus aimant des Pères.\nÔ Saint Joseph, je ne me lasse de vous contempler\navec Jésus endormi dans vos bras.\nJe n'ose m'approcher tandis qu'il repose près de votre cœur.\nSerrez-le en mon nom et baisez sa douce tête pour moi,\net demandez-lui de me rendre le baiser quand j'exhalerai mon dernier soupir.\nSaint Joseph, patron des âmes qui partent, priez pour nous.\nAmen.`,
  },
  st_michael_prayer: {
    title: 'Prière à Saint Michel',
    description: 'La grande prière de protection contre le mal',
    text: `Saint Michel Archange,\ndéfendez-nous dans le combat.\nSoyez notre protecteur contre la méchanceté et les embûches du démon.\nQue Dieu exerce sur lui son empire, nous vous en supplions.\nEt vous, Prince de la milice céleste,\npar la puissance divine,\nrefoulez en enfer Satan\net les autres esprits mauvais\nqui rôdent dans le monde\npour la perte des âmes.\nAmen.`,
  },
  fatima_prayer: {
    title: 'Prière de Fatima',
    description: 'La prière demandée par Notre-Dame de Fatima',
    text: `Ô mon Jésus,\npardonnez-nous nos péchés,\npréservez-nous du feu de l'enfer,\nconduisez au ciel toutes les âmes,\nsurtout celles qui ont le plus besoin de votre miséricorde.\nAmen.`,
  },
  divine_mercy_chaplet_opening: {
    title: 'Chapelet de la Divine Miséricorde',
    description: 'Le chapelet donné à Sainte Faustine — prières de confiance et de miséricorde',
    text: `Tu as expiré, Jésus, mais la source de vie a jailli pour les âmes,\net l'océan de miséricorde s'est ouvert pour le monde entier.\nÔ Source de Vie, insondable Divine Miséricorde,\nenveloppe le monde entier et déverse-toi sur nous.\n\nÔ Sang et Eau, qui avez jailli du Cœur de Jésus\ncomme source de Miséricorde pour nous, j'ai confiance en Vous !\n\nNotre Père...\nJe vous salue, Marie...\nSymbole des Apôtres...\n\nSur les gros grains :\nPère Éternel, je Vous offre le Corps et le Sang,\nl'Âme et la Divinité de votre Fils bien-aimé,\nnotre Seigneur Jésus-Christ,\nen réparation de nos péchés et de ceux du monde entier.\n\nSur les petits grains :\nPar sa douloureuse Passion,\nayez pitié de nous et du monde entier.\n\nFinal (3 fois) :\nDieu Saint, Dieu Fort, Dieu Immortel,\nayez pitié de nous et du monde entier.`,
  },
  act_of_contrition: {
    title: 'Acte de Contrition',
    description: 'La prière de repentir dite lors de la confession',
    text: `Mon Dieu,\nj'ai un très grand regret de vous avoir offensé,\net je déteste tous mes péchés\nparce que je crains la perte du ciel\net les peines de l'enfer ;\nmais surtout parce qu'ils vous offensent, mon Dieu,\nvous qui êtes infiniment bon et digne de tout mon amour.\nJe prends la ferme résolution,\navec le secours de votre grâce,\nde confesser mes péchés,\nde faire pénitence\net d'amender ma vie.\nAmen.`,
  },
  examination_prayer: {
    title: 'Prière avant l\'Examen de Conscience',
    description: 'Une prière pour invoquer l\'Esprit Saint avant d\'examiner sa conscience',
    text: `Viens, Esprit Saint,\néclaire mon esprit pour que je connaisse clairement mes péchés.\nTouche mon cœur pour que je m'en repente sincèrement,\nfermement résolu à ne plus les commettre,\net pleinement déterminé à éviter les occasions de péché.\nÔ Bienheureuse Vierge Marie, Mère de Dieu,\npriez pour moi.\nSaint Joseph, priez pour moi.\nMon Ange Gardien, priez pour moi.\nAmen.`,
  },
  morning_offering: {
    title: 'Offrande du Matin',
    description: 'Consacrer toute sa journée à Dieu',
    text: `Ô Jésus, par le Cœur Immaculé de Marie,\nje vous offre mes prières, mes actions, mes joies et mes souffrances de ce jour\nen union avec le Saint Sacrifice de la Messe dans le monde entier.\nJe vous les offre pour toutes les intentions de votre Sacré-Cœur :\nle salut des âmes, la réparation des péchés\net la réunion de tous les chrétiens.\nJe vous les offre pour les intentions de nos évêques\net de tous les Apôtres de la Prière,\net en particulier pour celles recommandées par notre Saint-Père ce mois-ci.\nAmen.`,
  },
  evening_prayer: {
    title: 'Prière du Soir',
    description: 'Une prière de gratitude et d\'abandon à la fin de la journée',
    text: `Veillez, ô Seigneur, avec ceux qui veillent,\nou qui pleurent cette nuit,\net chargez vos anges et vos saints de garder ceux qui dorment.\nSoignez vos malades, ô Seigneur Jésus.\nDonnez du repos à vos fatigués.\nBénissez vos mourants.\nConsolez vos souffrants.\nAyez pitié de vos affligés.\nProtégez vos joyeux.\nEt tout cela pour l'amour de vous.\nAmen.\n\nVisitez, nous vous en supplions, Seigneur, cette demeure,\net éloignez d'elle toutes les embûches de l'ennemi ;\nque vos saints anges y demeurent pour nous garder dans la paix ;\net que votre bénédiction soit sur tous ceux qui y habitent.\nPar Jésus-Christ notre Seigneur.\nAmen.`,
  },
  anima_christi_eucharistic: {
    title: 'Prière devant le Saint Sacrement',
    description: 'Une prière d\'adoration en présence de l\'Eucharistie',
    text: `Ô Sacrement très saint, ô Sacrement divin,\nque toute louange et toute action de grâces te soient rendues à chaque instant.\n\nSeigneur Jésus-Christ, tu nous as donné l'Eucharistie\ncomme mémorial de ta souffrance et de ta mort.\nQue notre adoration de ce sacrement de ton Corps et de ton Sang\nnous aide à goûter le salut que tu nous as acquis\net la paix du royaume,\noù tu vis avec le Père et le Saint-Esprit,\nun seul Dieu, pour les siècles des siècles.\nAmen.`,
  },
  prayer_for_the_dead: {
    title: 'Prière pour les Fidèles Défunts',
    description: 'Une prière pour ceux qui nous ont précédés',
    text: `Donnez-leur, Seigneur, le repos éternel,\net que la lumière perpétuelle les illumine.\nQue les âmes des fidèles défunts,\npar la miséricorde de Dieu,\nreposent en paix.\nAmen.\n\nQue leurs âmes et les âmes de tous les fidèles défunts,\npar la miséricorde de Dieu,\nreposent en paix.\nAmen.`,
  },
  prayer_before_meals: {
    title: 'Prière avant les Repas',
    description: 'Bénédicité avant de manger',
    text: `Bénissez-nous, Seigneur,\net bénissez ces dons\nque nous allons recevoir\nde votre bonté.\nPar le Christ notre Seigneur.\nAmen.`,
  },
  prayer_after_meals: {
    title: 'Prière après les Repas',
    description: 'Action de grâce après avoir mangé',
    text: `Nous vous rendons grâces, Dieu tout-puissant,\npour tous vos bienfaits,\nvous qui vivez et régnez\ndans les siècles des siècles.\nAmen.\n\nQue les âmes des fidèles défunts,\npar la miséricorde de Dieu,\nreposent en paix.\nAmen.`,
  },
  prayer_discernment: {
    title: 'Prière pour le Discernement',
    description: 'Chercher la volonté de Dieu dans les décisions',
    text: `Seigneur, accorde-moi la grâce de connaître ta volonté,\nle courage de la suivre\net la patience d'attendre ton moment.\nOuvre mes yeux pour voir ta main à l'œuvre.\nApaise mon cœur pour que je puisse entendre ta voix.\nÔte toute peur et tout doute,\net remplace-les par la confiance en ta providence.\nQue ton Esprit Saint guide chacun de mes pas.\nPar le Christ notre Seigneur.\nAmen.`,
  },
  prayer_strength: {
    title: 'Prière pour la Force dans la Souffrance',
    description: 'Trouver courage et grâce dans les épreuves',
    text: `Seigneur Jésus-Christ,\ntu as porté le poids de la croix pour moi.\nAccorde-moi la force de porter mes propres croix\navec foi, patience et amour.\nQuand je suis fatigué, sois mon repos.\nQuand j'ai peur, sois mon courage.\nQuand je suis seul, sois mon compagnon.\nUnis mes souffrances aux tiennes\npour le salut des âmes.\nAmen.`,
  },
  prayer_family: {
    title: 'Prière pour le Conjoint et la Famille',
    description: 'Confier ses proches aux soins de Dieu',
    text: `Seigneur Dieu, bénis ma famille.\nProtège-nous du mal et garde-nous dans ta grâce.\nAccorde-nous patience, bonté et pardon les uns envers les autres.\nRenforce les liens d'amour entre nous.\nAide-nous à grandir ensemble dans la foi\net à chercher toujours ta volonté dans notre foyer.\nQue notre famille soit un témoignage de ton amour dans le monde.\nPar le Christ notre Seigneur.\nAmen.`,
  },
  novena_framework: {
    title: 'Structure de la Neuvaine',
    description: 'Une structure de prière de neuf jours pour toute intention',
    text: `Au nom du Père, du Fils et du Saint-Esprit. Amen.\n\nPrière d'ouverture :\nMon Dieu, je me présente devant toi avec confiance,\nsachant que tu écoutes les prières de tes enfants.\nJe commence cette neuvaine avec foi en ta bonté\net confiance en ta volonté.\n\n[Exprimez ici votre intention en silence ou à voix haute.]\n\nPrière du jour :\nSeigneur, j'unis ma prière aux prières de tous les saints\nqui intercèdent pour nous devant ton trône.\nAccorde-moi la grâce dont j'ai besoin en ce jour\npour grandir en sainteté et en confiance.\n\nNotre Père...\nJe vous salue, Marie...\nGloire au Père...\n\nPrière finale :\nÔ Dieu, qui dans ta miséricorde infinie\nécoutes les prières de ton peuple,\naccorde que ce que je demande avec foi\nme soit donné selon ta sainte volonté.\nPar le Christ notre Seigneur.\nAmen.`,
  },
  psalm_23: {
    title: 'Psaume 23 — Le Seigneur est mon Berger',
    description: 'Un psaume bien-aimé de confiance et de réconfort',
    text: `Le Seigneur est mon berger : je ne manque de rien.\nSur des prés d'herbe fraîche, il me fait reposer.\nIl me mène vers les eaux tranquilles.\nIl restaure mon âme ;\nil me conduit par le juste chemin, pour l'amour de son nom.\nSi je traverse les ravins de la mort,\nje ne crains aucun mal, car tu es avec moi ;\nton bâton et ta houlette sont là qui me rassurent.\nTu prépares la table pour moi devant mes ennemis ;\ntu répands le parfum sur ma tête, ma coupe est débordante.\nOui, grâce et bonheur m'accompagnent tous les jours de ma vie ;\nj'habiterai la maison du Seigneur pour la durée de mes jours.`,
  },
};

const tl: PrayerTranslationMap = {
  sign_of_cross: {
    title: 'Tanda ng Krus',
    description: 'Ang pinakapangunahing dasal at kilos na Katoliko',
    text: `Sa ngalan ng Ama,\nat ng Anak,\nat ng Espiritu Santo.\nAmen.`,
  },
  our_father: {
    title: 'Ama Namin',
    description: 'Ang panalangin ng Panginoon na itinuro ni Hesus mismo',
    text: `Ama namin, sumasalangit Ka,\nsambahin ang ngalan Mo,\nmapasaamin ang kaharian Mo,\nsundin ang loob Mo,\ndito sa lupa para nang sa langit.\nBigyan Mo kami ngayon ng aming kakanin sa araw-araw,\nat patawarin Mo kami sa aming mga sala,\npara nang pagpapatawad namin sa mga nagkakasala sa amin;\nat huwag Mo kaming ipahintulot sa tukso,\nat iadya Mo kami sa lahat ng masama.\nAmen.`,
  },
  hail_mary: {
    title: 'Aba Ginoong Maria',
    description: 'Ang pinaka-minamahal na dasal sa Mahal na Ina',
    text: `Aba Ginoong Maria, napupuno ka ng grasya,\nang Panginoong Diyos ay sumasaiyo.\nBukod kang pinagpala sa babaeng lahat,\nat pinagpala naman ang iyong Anak na si Hesus.\nSanta Maria, Ina ng Diyos,\nipanalangin mo kaming makasalanan,\nngayon at kung kami'y mamatay.\nAmen.`,
  },
  glory_be: {
    title: 'Luwalhati',
    description: 'Isang maikling doksolohiya na nagpupuri sa Banal na Santatlo',
    text: `Luwalhati sa Ama,\nsa Anak,\nat sa Espiritu Santo.\nKapara noong unang-una,\nngayon at magpakailanman,\nat magpasawalang hanggan.\nAmen.`,
  },
  apostles_creed: {
    title: 'Sumasampalataya Ako',
    description: 'Isang buod ng pananampalataya ng mga apostol',
    text: `Sumasampalataya ako sa Diyos Amang makapangyarihan sa lahat,\nna may gawa ng langit at lupa.\nSumasampalataya ako kay Hesukristo,\niisang Anak ng Diyos, Panginoon nating lahat.\nIsinasakdal sa kanya ng Espiritu Santo,\nipinanganak ni Santa Mariang Birhen.\nNagpakasakit sa panahon ni Ponsyo Pilato,\nipinako sa krus, namatay, inilibing.\nNanaog sa kinaroroonan ng mga yumao.\nnang ikatlong araw nabuhay na mag-uli.\nUmakyat sa langit,\nnakaupo sa kanan ng Diyos Amang makapangyarihan sa lahat.\nDoon magmumula't paririto\nat hahatulan ang nangabubuhay at nangamatay na tao.\nSumasampalataya ako sa Espiritu Santo,\nsa Banal na Simbahang Katolika,\nsa kasamahan ng mga banal,\nsa kapatawaran ng mga kasalanan,\nsa pagkabuhay na mag-uli ng mga namatay na tao,\nat sa buhay na walang hanggan.\nAmen.`,
  },
  nicene_creed: {
    title: 'Kredo ng Nicaea',
    description: 'Ang kredo na sinasabi sa bawat Misang Linggo',
    text: `Sumasampalataya ako sa iisang Diyos,\nAmang makapangyarihan sa lahat,\nna may gawa ng langit at lupa,\nng lahat ng nakikita at di-nakikita.\nSumasampalataya ako sa iisang Panginoong Hesukristo,\nbugtong na Anak ng Diyos.\nIpinanganak ng Ama bago pa ang lahat ng panahon.\nDiyos buhat sa Diyos, Liwanag buhat sa Liwanag,\ntunay na Diyos buhat sa tunay na Diyos,\nisinilang, hindi ginawa, kaisa ng Ama sa pagka-Diyos;\nat sa pamamagitan niya ginawa ang lahat ng bagay.\nDahil sa atin at sa ating kaligtasan\nbumaba siya mula sa langit.\nSa kapangyarihan ng Espiritu Santo,\nnagkatawang-tao siya kay Birheng Maria, at naging tao.\nIpinako sa krus para sa atin sa panahon ni Ponsyo Pilato;\nnamatay at inilibing.\nMuling nabuhay sa ikatlong araw ayon sa Kasulatan.\nUmakyat sa langit, nakaupo sa kanan ng Ama.\nMuling paririto na may kapangyarihan at kadakilaan\nupang hukuman ang mga buhay at mga patay;\nat ang kanyang kaharian ay walang katapusan.\nSumasampalataya ako sa Espiritu Santo, Panginoon at nagbibigay-buhay,\nna nagmumula sa Ama at sa Anak.\nSiya ay sinasamba at niluluwalhati kasama ng Ama at ng Anak,\nna nagsalita sa pamamagitan ng mga propeta.\nSumasampalataya ako sa iisa, banal, katolika, at apostolikang Simbahan.\nInaamin ko ang iisang binyag sa ikapagpapatawad ng mga kasalanan.\nAt hinihintay ko ang muling pagkabuhay ng mga namatay\nat ang buhay sa darating na panahon.\nAmen.`,
  },
  guardian_angel: {
    title: 'Dasal sa Anghel de la Guarda',
    description: 'Pag-invoke ng proteksyon ng iyong anghel de la guarda',
    text: `Anghel ng Diyos,\nmahal kong bantay,\nna ipinagkatiwala sa akin\nng awa ng Diyos,\ntanglawan, ingatan,\npatnubayan at pamahalaan mo ako\nsa araw na ito.\nAmen.`,
  },
  hail_holy_queen: {
    title: 'Aba Po, Santa Mariang Hari',
    description: 'Isang magandang dasal ng papuri sa Ating Ginang',
    text: `Aba po, Santa Mariang Hari,\nIna ng awa,\nkabuhayan, katamisan, at pag-asa namin, aba po.\nSa iyo kami tumatawag,\npinapanaw na mga anak ni Eva.\nSa iyo kami bumubuntong-hininga,\nnananangis at nananambitan\nsa lupaing ito, na libis ng mga luha.\nAya, aming tagapamagitan,\nilingon mo sa amin\nang iyong mga matang maawain.\nAt pagkatapos ng pagpanaw na ito, ipakita mo sa amin si Hesus,\nang pinagpalang bunga ng iyong tiyan.\nO maawain, o maalam,\no matamis na Birheng Maria.\nIpanalangin mo kami, O Banal na Ina ng Diyos,\nnang kami ay maging karapat-dapat sa mga pangako ni Kristo.\nAmen.`,
  },
  memorare: {
    title: 'Alalahanin Mo',
    description: 'Isang makapangyarihang dasal ng tiwala sa pamamagitan ni Maria',
    text: `Alalahanin mo, O pinakamaawain na Birheng Maria,\nna kailanma'y hindi narinig\nna ang sinumang tumakbo sa iyong proteksyon,\nnanghingi ng iyong tulong, o humingi ng iyong pamamagitan,\nay pinabayaan.\nUdyok ng ganitong tiwala,\ntumatakas ako sa iyo, O Birhen ng mga birhen, aking Ina;\nsa iyo ako lumalapit,\nsa harap mo nakatayo, makasalanan at nagsisisi.\nO Ina ng Salitang nagkatawang-tao,\nhuwag mong hamakin ang aking mga kahilingan,\nkundi sa iyong awa, dinggin at sagutin mo ako.\nAmen.`,
  },
  angelus: {
    title: 'Ang Angelus',
    description: 'Debosyon na ginugunita ang Pagkakatawang-tao, dinarasal tatlong beses araw-araw',
    text: `V. Ibinalita ng Anghel ng Panginoon kay Maria,\nR. At naglihi siya sa kapangyarihan ng Espiritu Santo.\nAba Ginoong Maria...\n\nV. Narito ang alipin ng Panginoon,\nR. Mangyari nawa sa akin ayon sa iyong salita.\nAba Ginoong Maria...\n\nV. At ang Salita ay nagkatawang-tao,\nR. At nanahan sa atin.\nAba Ginoong Maria...\n\nV. Ipanalangin mo kami, O Banal na Ina ng Diyos,\nR. Upang kami ay maging karapat-dapat sa mga pangako ni Kristo.\n\nManalangin tayo:\nIbuhos Mo, Panginoon, ang Iyong biyaya sa aming mga puso;\nupang kami na nakaalam ng pagkakatawang-tao ni Kristong Iyong Anak\nsa pamamagitan ng balita ng Anghel,\nsa pamamagitan ng Kanyang Pagpapakasakit at Krus\nay madala sa kaluwalhatian ng Kanyang Muling Pagkabuhay.\nSa pamamagitan din ni Kristong aming Panginoon.\nAmen.`,
  },
  anima_christi: {
    title: 'Kaluluwa ni Kristo',
    description: 'Kaluluwa ni Kristo, pabanalin Mo ako — dasal ng malapit na pakikipag-isa',
    text: `Kaluluwa ni Kristo, pabanalin Mo ako.\nKatawan ni Kristo, iligtas Mo ako.\nDugo ni Kristo, painumin Mo ako.\nTubig mula sa tagiliran ni Kristo, hugasan Mo ako.\nPagpapakasakit ni Kristo, palakasin Mo ako.\nO mabuting Hesus, dinggin Mo ako.\nSa loob ng Iyong mga sugat, itago Mo ako.\nHuwag Mo akong payagang mahiwalay sa Iyo.\nMula sa masamang kaaway, ipagtanggol Mo ako.\nSa oras ng aking kamatayan, tawagin Mo ako\nat iutos Mong lumapit ako sa Iyo,\nupang kasama ng Iyong mga Banal ay purihin kita\nmagpakailanman.\nAmen.`,
  },
  come_holy_spirit: {
    title: 'Halina, Espiritu Santo',
    description: 'Pagtawag sa Espiritu Santo para sa patnubay at biyaya',
    text: `Halina, Espiritu Santo, punuin Mo ang mga puso ng Iyong mga tapat\nat painitin Mo sa kanila ang apoy ng Iyong pag-ibig.\nIsugo Mo ang Iyong Espiritu, at sila'y malilikha.\nAt babaguhin Mo ang mukha ng lupa.\n\nO Diyos, sa pamamagitan ng liwanag ng Espiritu Santo\nItinuro Mo ang mga puso ng mga tapat,\nipagkaloob Mo na sa pamamagitan din ng Espiritu Santo\nmatikman namin ang tama\nat laging tamasahin ang Kanyang kaaliwan.\nSa pamamagitan ni Kristong aming Panginoon.\nAmen.`,
  },
  prayer_st_joseph: {
    title: 'Dasal kay San Jose',
    description: 'Paghingi ng tulong sa patron ng buong Simbahan',
    text: `O San Jose,\nna ang proteksyon ay napakalaki, napakalakas, napakaagap\nsa harap ng trono ng Diyos,\ninilalagay ko sa iyo ang lahat ng aking mga interes at hangarin.\nO San Jose, tulungan mo ako sa iyong makapangyarihang pamamagitan\nat humingi ka para sa akin mula sa iyong Anak na Diyos\nng lahat ng espirituwal na pagpapala sa pamamagitan ni Hesukristo, aming Panginoon;\nupang matapos kong maranasan dito sa lupa ang iyong kapangyarihang makalangit,\nmakapag-alay ako ng pasasalamat at parangal\nsa pinakamahal na Ama.\nO San Jose, hindi ako napapagod na pagmasdan ka\nna kasama si Hesus na natutulog sa iyong mga bisig.\nHindi ako nangangahas lumapit habang Siya'y nagpapahinga sa iyong puso.\nYakapin Mo Siya sa aking pangalan at halikan ang Kanyang ulo para sa akin,\nat hilingin Mong ibalik Niya ang halik kapag huminga na ako ng huli.\nSan Jose, patron ng mga kaluluwa na paalis na, ipanalangin mo kami.\nAmen.`,
  },
  st_michael_prayer: {
    title: 'Dasal kay San Miguel',
    description: 'Ang dakilang dasal ng proteksyon laban sa kasamaan',
    text: `San Miguel Arkanghel,\nipagtanggol mo kami sa labanan.\nMaging aming sanggalang laban sa kasamaan at mga tukso ng demonyo.\nNawa'y sawayin siya ng Diyos, mapakumbaba naming dalangin.\nAt ikaw, O Prinsipe ng hukbong makalangit,\nsa kapangyarihan ng Diyos,\nitapon mo sa impyerno si Satanas\nat ang lahat ng masasamang espiritu\nna nagpapagala-gala sa mundo\nupang ipahamak ang mga kaluluwa.\nAmen.`,
  },
  fatima_prayer: {
    title: 'Dasal ng Fatima',
    description: 'Ang dasal na hiningi ni Birhen ng Fatima',
    text: `O aking Hesus,\npatawarin Mo ang aming mga kasalanan,\niligtas Mo kami sa apoy ng impyerno,\ndalhin Mo sa langit ang lahat ng mga kaluluwa,\nlalo na ang mga higit na nangangailangan ng Iyong awa.\nAmen.`,
  },
  divine_mercy_chaplet_opening: {
    title: 'Koronilya ng Banal na Awa',
    description: 'Ang koronilya na ibinigay kay Santa Faustina — dasal ng tiwala at awa',
    text: `Nalagutan Ka ng hininga, Hesus, ngunit ang bukal ng buhay ay bumukal para sa mga kaluluwa,\nat ang karagatan ng awa ay nabuksan para sa buong mundo.\nO Bukal ng Buhay, di-maarok na Banal na Awa,\nbalutan Mo ang buong mundo at ibuhos Mo ang Iyong sarili sa amin.\n\nO Dugo at Tubig, na bumukal mula sa Puso ni Hesus\nbilang bukal ng Awa para sa amin, nagtitiwala ako sa Iyo!\n\nAma Namin...\nAba Ginoong Maria...\nSumasampalataya Ako...\n\nSa malalaking butil:\nAmang Walang Hanggan, iniaalay ko sa Iyo ang Katawan at Dugo,\nKaluluwa at Pagka-Diyos ng Iyong pinakamamahal na Anak,\nang aming Panginoong Hesukristo,\nbilang kabayaran sa aming mga kasalanan at sa buong mundo.\n\nSa maliliit na butil:\nAlang-alang sa Kanyang masakit na Pagpapakasakit,\nmaawa Ka sa amin at sa buong mundo.\n\nPagtatapos (3 beses):\nBarang Diyos, Banal na Makapangyarihan, Banal na Walang Kamatayan,\nmaawa Ka sa amin at sa buong mundo.`,
  },
  act_of_contrition: {
    title: 'Akto ng Pagsisisi',
    description: 'Ang dasal ng pagsisisi na sinasabi sa kumpisal',
    text: `O aking Diyos,\nngsisisi ako nang buong puso sa pagkakasala ko sa Iyo,\nat kinasusuklaman ko ang lahat kong kasalanan\nsapagkat natatakot akong mawala ang langit\nat ang mga parusa ng impyerno;\nngunit higit sa lahat sapagkat nasaktan ko Kayo, aking Diyos,\nna lubos na mabuti at karapat-dapat sa aking buong pag-ibig.\nMatatag akong nagpapasya,\nsa tulong ng Iyong biyaya,\nna ikumpisal ang aking mga kasalanan,\ngumawa ng penitensya,\nat baguhin ang aking buhay.\nAmen.`,
  },
  examination_prayer: {
    title: 'Dasal bago ang Pagsusuri ng Budhi',
    description: 'Isang dasal upang anyayahan ang Espiritu Santo bago suriin ang budhi',
    text: `Halina, Espiritu Santo,\nliwanagan Mo ang aking isip upang malinaw kong makilala ang aking mga kasalanan.\nGaluwin Mo ang aking puso upang tunay akong magsisi sa mga ito,\nmatatag na nagpapasyang hindi na muling gagawa,\nat buong-loob na iwasan ang mga okasyon ng kasalanan.\nO Mapalad na Birheng Maria, Ina ng Diyos,\nipanalangin mo ako.\nSan Jose, ipanalangin mo ako.\nAnghel de la Guarda ko, ipanalangin mo ako.\nAmen.`,
  },
  morning_offering: {
    title: 'Alay sa Umaga',
    description: 'Ialay ang buong araw mo sa Diyos',
    text: `O Hesus, sa pamamagitan ng Kalinis-linisang Puso ni Maria,\niniaalay ko sa Iyo ang aking mga panalangin, gawa, galak at paghihirap ngayong araw\nkasama ng Banal na Sakripisyo ng Misa sa buong mundo.\nIniaalay ko ang mga ito para sa lahat ng hangarin ng Iyong Sagradong Puso:\nang kaligtasan ng mga kaluluwa, ang kabayaran sa kasalanan\nat ang pagkakaisa ng lahat ng mga Kristiyano.\nIniaalay ko ang mga ito para sa mga hangarin ng aming mga obispo\nat ng lahat ng mga Apostol ng Panalangin,\nat lalo na para sa mga inirerekomenda ng aming Banal na Ama ngayong buwan.\nAmen.`,
  },
  evening_prayer: {
    title: 'Dasal sa Gabi',
    description: 'Isang dasal ng pasasalamat at pagsuko sa katapusan ng araw',
    text: `Magbantay, O Panginoon, kasama ng mga nagbabantay,\no nagpupuyat, o umiiyak ngayong gabi,\nat ipagkatiwala Mo sa Iyong mga anghel at mga banal ang mga natutulog.\nAlagaan Mo ang Iyong mga maysakit, O Panginoong Hesus.\nBigyan Mo ng pahinga ang Iyong mga pagod.\nPagpalain Mo ang Iyong mga namamatay.\nAliwin Mo ang Iyong mga nagdurusa.\nKaawaan Mo ang Iyong mga nagdadalamhati.\nProtektahan Mo ang Iyong mga masasaya.\nAt lahat para sa Iyong pag-ibig.\nAmen.\n\nDalawin Mo, isinusugo namin sa Iyo, O Panginoon, ang tahanan na ito,\nat ilayo Mo rito ang lahat ng panganib mula sa kaaway;\nnawa ang Iyong mga banal na anghel ay manahan dito upang pangalagaan kami sa kapayapaan;\nat ang Iyong pagpapala ay mapasa lahat ng naninirahan dito.\nSa pamamagitan ni Hesukristong aming Panginoon.\nAmen.`,
  },
  anima_christi_eucharistic: {
    title: 'Dasal sa harap ng Banal na Sakramento',
    description: 'Isang dasal ng adorasyon sa presensya ng Eukaristiya',
    text: `O Sakramentong kabanal-banalan, O Sakramentong banal,\nlahat ng papuri at pasasalamat ay sa Iyo sa bawat sandali.\n\nPanginoong Hesukristo, ibinigay Mo sa amin ang Eukaristiya\nbilang alaala ng Iyong paghihirap at kamatayan.\nNawa ang aming pagsamba sa sakramentong ito ng Iyong Katawan at Dugo\nay makatulong sa amin na maranasan ang kaligtasang ipinagtagumpay Mo para sa amin\nat ang kapayapaan ng kaharian,\nkung saan Ka nabubuhay kasama ang Ama at ang Espiritu Santo,\niisang Diyos, magpakailanman.\nAmen.`,
  },
  prayer_for_the_dead: {
    title: 'Dasal para sa mga Yumaong Tapat',
    description: 'Isang dasal para sa mga nauna sa atin',
    text: `Bigyan Mo sila, O Panginoon, ng walang hanggang kapahingahan,\nat pasinagan sila ng walang hanggang liwanag.\nAng mga kaluluwa ng mga tapat na yumao,\nsa pamamagitan ng awa ng Diyos,\nay magpahinga nawa sa kapayapaan.\nAmen.\n\nAng kanilang mga kaluluwa at ang mga kaluluwa ng lahat ng tapat na yumao,\nsa pamamagitan ng awa ng Diyos,\nay magpahinga nawa sa kapayapaan.\nAmen.`,
  },
  prayer_before_meals: {
    title: 'Dasal bago Kumain',
    description: 'Pagpapala bago kumain',
    text: `Pagpalain Mo kami, O Panginoon,\nat ang mga kaloob na ito\nna aming tatanggapin\nmula sa Iyong kagandahang-loob.\nSa pamamagitan ni Kristong aming Panginoon.\nAmen.`,
  },
  prayer_after_meals: {
    title: 'Dasal pagkatapos Kumain',
    description: 'Pasasalamat pagkatapos kumain',
    text: `Nagpapasalamat kami sa Iyo, Diyos na makapangyarihan sa lahat,\nsa lahat ng Iyong biyaya,\nIkaw na nabubuhay at naghahari\nmagpakailanman.\nAmen.\n\nAng mga kaluluwa ng mga tapat na yumao,\nsa pamamagitan ng awa ng Diyos,\nay magpahinga nawa sa kapayapaan.\nAmen.`,
  },
  prayer_discernment: {
    title: 'Dasal para sa Karunungan',
    description: 'Paghahanap ng kalooban ng Diyos sa mga desisyon',
    text: `Panginoon, ipagkaloob Mo sa akin ang biyayang malaman ang Iyong kalooban,\nang tapang na sundin ito,\nat ang pasensya na hintayin ang Iyong panahon.\nBuksan Mo ang aking mga mata upang makita ang Iyong kamay na kumikilos.\nPatahimikin Mo ang aking puso upang marinig ko ang Iyong tinig.\nAlisin Mo ang lahat ng takot at pag-aalinlangan,\nat palitan ang mga ito ng tiwala sa Iyong probidensya.\nNawa ang Iyong Espiritu Santo ang gumabay sa bawat hakbang ko.\nSa pamamagitan ni Kristong aming Panginoon.\nAmen.`,
  },
  prayer_strength: {
    title: 'Dasal para sa Lakas sa Paghihirap',
    description: 'Paghahanap ng tapang at biyaya sa panahon ng pagsubok',
    text: `Panginoong Hesukristo,\npinasan Mo ang bigat ng krus para sa akin.\nIpagkaloob Mo sa akin ang lakas na pasanin ang aking sariling mga krus\nnang may pananampalataya, pasensya, at pag-ibig.\nKapag pagod ako, ikaw ang aking pahinga.\nKapag natatakot ako, ikaw ang aking tapang.\nKapag nag-iisa ako, ikaw ang aking kasama.\nPag-isahin Mo ang aking mga paghihirap sa Iyo\npara sa kaligtasan ng mga kaluluwa.\nAmen.`,
  },
  prayer_family: {
    title: 'Dasal para sa Asawa at Pamilya',
    description: 'Ipinagkakatiwala ang mga mahal sa buhay sa pag-aalaga ng Diyos',
    text: `Panginoong Diyos, pagpalain Mo ang aking pamilya.\nProtektahan Mo kami mula sa kasamaan at panatilihin Mo kami sa Iyong biyaya.\nIpagkaloob Mo sa amin ang pasensya, kabaitan, at pagpapatawad sa isa't isa.\nPatigasin Mo ang mga ugnayan ng pag-ibig sa pagitan namin.\nTulungan Mo kaming lumago nang magkasama sa pananampalataya\nat laging hanapin ang Iyong kalooban sa aming tahanan.\nNawa ang aming pamilya ay maging saksi ng Iyong pag-ibig sa mundo.\nSa pamamagitan ni Kristong aming Panginoon.\nAmen.`,
  },
  novena_framework: {
    title: 'Balangkas ng Nobena',
    description: 'Isang siyam na araw na balangkas ng panalangin para sa anumang intensyon',
    text: `Sa ngalan ng Ama, ng Anak, at ng Espiritu Santo. Amen.\n\nPambungad na Dasal:\nDiyos ko, lumapit ako sa Iyo nang may tiwala,\nnalalaman kong pinakikinggan Mo ang mga dasal ng Iyong mga anak.\nSinimulan ko ang nobenang ito nang may pananampalataya sa Iyong kabutihan\nat tiwala sa Iyong kalooban.\n\n[Sabihin dito ang iyong intensyon nang tahimik o malakas.]\n\nDasal ng Araw:\nPanginoon, pinagsasama ko ang aking dasal sa mga dasal ng lahat ng mga banal\nna namamagitan para sa amin sa harap ng Iyong trono.\nIpagkaloob Mo sa akin ang biyayang kailangan ko ngayong araw\nupang lumago sa kabanalan at tiwala.\n\nAma Namin...\nAba Ginoong Maria...\nLuwalhati...\n\nPangtapos na Dasal:\nO Diyos, na sa Iyong walang hanggang awa\npinakikinggan Mo ang mga dasal ng Iyong bayan,\nipagkaloob Mo na ang hinihingi ko nang may pananampalataya\nay ibigay ayon sa Iyong banal na kalooban.\nSa pamamagitan ni Kristong aming Panginoon.\nAmen.`,
  },
  psalm_23: {
    title: 'Salmo 23 — Ang Panginoon ang aking Pastol',
    description: 'Isang minamahal na salmo ng tiwala at kaaliwan',
    text: `Ang Panginoon ang aking pastol; hindi ako magkukulang.\nSa luntiang pastulan ay pinahihiga niya ako.\nSa tabi ng mga tahimik na tubig ay inaakay niya ako.\nPinapanumbalik niya ang aking kaluluwa;\ninaakay niya ako sa mga landas ng katuwiran alang-alang sa kanyang pangalan.\nBagaman ako'y lumakad sa libis ng lilim ng kamatayan,\nhindi ako matatakot sa kasamaan, sapagkat ikaw ay kasama ko;\nang iyong pamalo at ang iyong tungkod ay umaaliw sa akin.\nNaghahanda ka ng hapag sa harapan ko sa harap ng aking mga kaaway;\npinapahiran mo ng langis ang aking ulo; ang aking saro ay umaapaw.\nTiyak na ang kabutihan at awa ay susunod sa akin sa lahat ng araw ng aking buhay;\nat tatahan ako sa bahay ng Panginoon magpakailanman.`,
  },
};

// Category translations
export interface CategoryTranslation {
  label: string;
  description: string;
}

type CategoryTranslationMap = Record<string, CategoryTranslation>;

const categoryEs: CategoryTranslationMap = {
  essential: { label: 'Oraciones Esenciales', description: 'Oraciones fundamentales que todo católico debe conocer' },
  marian: { label: 'Oraciones Marianas', description: 'Oraciones en honor a la Santísima Virgen María' },
  jesus: { label: 'Oraciones a Jesús', description: 'Oraciones centradas en Cristo' },
  st_joseph: { label: 'Oraciones a San José', description: 'Oraciones al padre adoptivo de Jesús' },
  st_michael: { label: 'Oraciones a San Miguel', description: 'Oraciones de protección y fortaleza espiritual' },
  rosary: { label: 'Oraciones del Rosario', description: 'Oraciones para el Santo Rosario' },
  divine_mercy: { label: 'Divina Misericordia', description: 'Oraciones de la devoción a la Divina Misericordia' },
  confession: { label: 'Confesión y Arrepentimiento', description: 'Oraciones para la reconciliación' },
  morning: { label: 'Oraciones Matutinas', description: 'Comienza tu día en gracia' },
  evening: { label: 'Oraciones Vespertinas', description: 'Termina tu día en paz' },
  eucharistic: { label: 'Oraciones Eucarísticas', description: 'Oraciones de adoración y devoción' },
  saints: { label: 'Santos e Intercesión', description: 'Oraciones por la comunión de los santos' },
  novena: { label: 'Oraciones de Novena', description: 'Estructuras de oración de nueve días' },
  daily_life: { label: 'Oraciones Cotidianas', description: 'Oraciones para las comidas y momentos del día' },
};

const categoryIt: CategoryTranslationMap = {
  essential: { label: 'Preghiere Essenziali', description: 'Preghiere fondamentali che ogni cattolico dovrebbe conoscere' },
  marian: { label: 'Preghiere Mariane', description: 'Preghiere in onore della Beata Vergine Maria' },
  jesus: { label: 'Preghiere a Gesù', description: 'Preghiere incentrate su Cristo' },
  st_joseph: { label: 'Preghiere a San Giuseppe', description: 'Preghiere al padre putativo di Gesù' },
  st_michael: { label: 'Preghiere a San Michele', description: 'Preghiere di protezione e forza spirituale' },
  rosary: { label: 'Preghiere del Rosario', description: 'Preghiere per il Santo Rosario' },
  divine_mercy: { label: 'Divina Misericordia', description: 'Preghiere della devozione alla Divina Misericordia' },
  confession: { label: 'Confessione e Pentimento', description: 'Preghiere per la riconciliazione' },
  morning: { label: 'Preghiere del Mattino', description: 'Inizia la giornata nella grazia' },
  evening: { label: 'Preghiere della Sera', description: 'Termina la giornata in pace' },
  eucharistic: { label: 'Preghiere Eucaristiche', description: 'Preghiere di adorazione e devozione' },
  saints: { label: 'Santi e Intercessione', description: 'Preghiere per la comunione dei santi' },
  novena: { label: 'Preghiere della Novena', description: 'Strutture di preghiera di nove giorni' },
  daily_life: { label: 'Preghiere Quotidiane', description: 'Preghiere per i pasti e i momenti della giornata' },
};

const categoryPt: CategoryTranslationMap = {
  essential: { label: 'Orações Essenciais', description: 'Orações fundamentais que todo católico deve saber' },
  marian: { label: 'Orações Marianas', description: 'Orações em honra da Santíssima Virgem Maria' },
  jesus: { label: 'Orações a Jesus', description: 'Orações centradas em Cristo' },
  st_joseph: { label: 'Orações a São José', description: 'Orações ao pai adotivo de Jesus' },
  st_michael: { label: 'Orações a São Miguel', description: 'Orações de proteção e fortaleza espiritual' },
  rosary: { label: 'Orações do Rosário', description: 'Orações para o Santo Rosário' },
  divine_mercy: { label: 'Divina Misericórdia', description: 'Orações da devoção à Divina Misericórdia' },
  confession: { label: 'Confissão e Arrependimento', description: 'Orações para a reconciliação' },
  morning: { label: 'Orações da Manhã', description: 'Comece o dia na graça' },
  evening: { label: 'Orações da Noite', description: 'Termine o dia em paz' },
  eucharistic: { label: 'Orações Eucarísticas', description: 'Orações de adoração e devoção' },
  saints: { label: 'Santos e Intercessão', description: 'Orações pela comunhão dos santos' },
  novena: { label: 'Orações da Novena', description: 'Estruturas de oração de nove dias' },
  daily_life: { label: 'Orações do Cotidiano', description: 'Orações para refeições e momentos do dia' },
};

const categoryFr: CategoryTranslationMap = {
  essential: { label: 'Prières Essentielles', description: 'Prières fondamentales que tout catholique devrait connaître' },
  marian: { label: 'Prières Mariales', description: 'Prières en l\'honneur de la Bienheureuse Vierge Marie' },
  jesus: { label: 'Prières à Jésus', description: 'Prières centrées sur le Christ' },
  st_joseph: { label: 'Prières à Saint Joseph', description: 'Prières au père adoptif de Jésus' },
  st_michael: { label: 'Prières à Saint Michel', description: 'Prières de protection et de force spirituelle' },
  rosary: { label: 'Prières du Rosaire', description: 'Prières pour le Saint Rosaire' },
  divine_mercy: { label: 'Divine Miséricorde', description: 'Prières de la dévotion à la Divine Miséricorde' },
  confession: { label: 'Confession et Repentir', description: 'Prières pour la réconciliation' },
  morning: { label: 'Prières du Matin', description: 'Commencez votre journée dans la grâce' },
  evening: { label: 'Prières du Soir', description: 'Terminez votre journée en paix' },
  eucharistic: { label: 'Prières Eucharistiques', description: 'Prières d\'adoration et de dévotion' },
  saints: { label: 'Saints et Intercession', description: 'Prières par la communion des saints' },
  novena: { label: 'Prières de Neuvaine', description: 'Cadres de prière de neuf jours' },
  daily_life: { label: 'Prières Quotidiennes', description: 'Prières pour les repas et les moments du quotidien' },
};

const categoryTl: CategoryTranslationMap = {
  essential: { label: 'Mahahalagang Dasal', description: 'Pangunahing dasal na dapat malaman ng bawat Katoliko' },
  marian: { label: 'Mga Dasal kay Maria', description: 'Mga dasal para sa Mahal na Birheng Maria' },
  jesus: { label: 'Mga Dasal kay Hesus', description: 'Mga dasal na nakatuon kay Kristo' },
  st_joseph: { label: 'Mga Dasal kay San Jose', description: 'Mga dasal sa amang-ampunin ni Hesus' },
  st_michael: { label: 'Mga Dasal kay San Miguel', description: 'Mga dasal ng proteksyon at lakas espirituwal' },
  rosary: { label: 'Mga Dasal ng Rosaryo', description: 'Mga dasal para sa Banal na Rosaryo' },
  divine_mercy: { label: 'Banal na Awa', description: 'Mga dasal ng debosyon sa Banal na Awa' },
  confession: { label: 'Kumpisal at Pagsisisi', description: 'Mga dasal para sa pagkakasundo' },
  morning: { label: 'Mga Dasal sa Umaga', description: 'Simulan ang araw sa biyaya' },
  evening: { label: 'Mga Dasal sa Gabi', description: 'Tapusin ang araw sa kapayapaan' },
  eucharistic: { label: 'Mga Dasal sa Eukaristiya', description: 'Mga dasal ng adorasyon at debosyon' },
  saints: { label: 'Mga Santo at Pamamagitan', description: 'Mga dasal sa pamamagitan ng komunyon ng mga banal' },
  novena: { label: 'Mga Dasal ng Nobena', description: 'Siyam na araw na balangkas ng panalangin' },
  daily_life: { label: 'Mga Dasal sa Araw-araw', description: 'Mga dasal para sa pagkain at pang-araw-araw' },
};

const prayerTranslations: Record<string, PrayerTranslationMap> = { es, it, pt, fr, tl };
const categoryTranslations: Record<string, CategoryTranslationMap> = {
  es: categoryEs,
  it: categoryIt,
  pt: categoryPt,
  fr: categoryFr,
  tl: categoryTl,
};

export function getPrayerTranslation(prayerId: string, lang: LanguageCode): PrayerTranslation | null {
  if (lang === 'en') return null;
  return prayerTranslations[lang]?.[prayerId] || null;
}

export function getCategoryTranslation(categoryKey: string, lang: LanguageCode): CategoryTranslation | null {
  if (lang === 'en') return null;
  return categoryTranslations[lang]?.[categoryKey] || null;
}
