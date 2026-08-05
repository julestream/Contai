import { Lang, DEFAULT_LANG } from './dictionaries'

export type Letter = 'a' | 'b' | 'c' | 'd' | 'e'

type QuizDoc = {
  questionOf: string
  yourMoodIs: string
  exploreTemplate: string
  takeAgain: string
  questions: { q: string; options: { letter: Letter; text: string }[] }[]
  results: Record<Letter, { moodKey: string; blurb: string }>
}

const QUIZ: Record<Lang, QuizDoc> = {
  hu: {
    questionOf: '{n}. kérdés / {total}',
    yourMoodIs: 'A te művészeti hangulatod',
    exploreTemplate: '{mood} hangulatú művek felfedezése',
    takeAgain: 'Kitöltöm újra',
    questions: [
      {
        q: 'Milyen típusú műalkotás okozza neked a legnagyobb örömöt?',
        options: [
          { letter: 'a', text: 'Élénk és energikus' },
          { letter: 'b', text: 'Derűs és békés' },
          { letter: 'c', text: 'Játékos és szeszélyes' },
          { letter: 'd', text: 'Kifejező és eleven' },
          { letter: 'e', text: 'Világos és színes' },
        ],
      },
      {
        q: 'Amikor egy műalkotást nézel, min gondolkodsz el?',
        options: [
          { letter: 'a', text: 'A természet és a körülöttünk lévő világ szépségén' },
          { letter: 'b', text: 'A műalkotás egyensúlyán és egységén' },
          { letter: 'c', text: 'A benne rejlő titokzatos, rejtélyes elemeken' },
          { letter: 'd', text: 'A tiszta örömön és pozitivitáson, amit sugároz' },
          { letter: 'e', text: 'Az önvizsgálaton és önismereten, amire ösztönöz' },
        ],
      },
      {
        q: 'Mely műalkotásokhoz vonzódsz a leginkább?',
        options: [
          { letter: 'a', text: 'Amelyek inspirálnak és felemelnek' },
          { letter: 'b', text: 'Amelyek harmóniát és egységet teremtenek' },
          { letter: 'c', text: 'Amelyek megkérdőjelezik a társadalmi normákat és vitára ösztönöznek' },
          { letter: 'd', text: 'Amelyek örömöt és boldogságot ébresztenek' },
          { letter: 'e', text: 'Amelyek önreflexióra és befelé figyelésre késztetnek' },
        ],
      },
      {
        q: 'Mi motivál a leginkább, amikor művészetet nézel?',
        options: [
          { letter: 'a', text: 'Az inspiráció, amit felgyújt benned' },
          { letter: 'b', text: 'A harmónia és egyensúly érzete, amit megjelenít' },
          { letter: 'c', text: 'A rejtélyek és rejtett jelentések, amiket hordoz' },
          { letter: 'd', text: 'Az öröm és pozitivitás, amit sugároz' },
          { letter: 'e', text: 'A lendület és elszántság, amit az álmaid követéséhez ad' },
        ],
      },
      {
        q: 'Melyik műalkotás keltené fel leginkább az érdeklődésed?',
        options: [
          { letter: 'a', text: 'Amely megkérdőjelezi a hagyományos elképzeléseket és feszegeti a határokat' },
          { letter: 'b', text: 'Amely harmóniát és egyensúlyt teremt' },
          { letter: 'c', text: 'Amely titkokat rejt és értelmezésre hív' },
          { letter: 'd', text: 'Amely örömöt és játékosságot ébreszt' },
          { letter: 'e', text: 'Amely befelé figyelésre és önismeretre ösztönöz' },
        ],
      },
    ],
    results: {
      a: { moodKey: 'Inspiration', blurb: 'Olyan művészetet keresel, amely gondolatokat gyújt és valami nagyobb felé emel.' },
      b: { moodKey: 'Harmony', blurb: 'Az egyensúly, az egység és a nyugodt teljesség vonz.' },
      c: { moodKey: 'Intrigue', blurb: 'Szereted a rejtélyt, a rejtett jelentést és a művészetet, amely értelmezésre hív.' },
      d: { moodKey: 'Joy', blurb: 'A melegséget, a játékosságot és a tiszta pozitív energiát keresed.' },
      e: { moodKey: 'Self-reflection', blurb: 'Olyan művészethez kötődsz, amely befelé fordítja a tekintetet és felfedezésre indít.' },
    },
  },
  en: {
    questionOf: 'Question {n} of {total}',
    yourMoodIs: 'Your art mood is',
    exploreTemplate: 'Explore {mood} artworks',
    takeAgain: 'Take the quiz again',
    questions: [
      {
        q: 'What type of artwork brings you the most happiness?',
        options: [
          { letter: 'a', text: 'Vibrant and energetic' },
          { letter: 'b', text: 'Serene and peaceful' },
          { letter: 'c', text: 'Playful and whimsical' },
          { letter: 'd', text: 'Expressive and lively' },
          { letter: 'e', text: 'Bright and colourful' },
        ],
      },
      {
        q: 'When you look at an artwork, what do you find yourself contemplating?',
        options: [
          { letter: 'a', text: 'The beauty of nature and the world around us' },
          { letter: 'b', text: 'The balance and unity within the artwork' },
          { letter: 'c', text: 'The enigmatic and mysterious elements it holds' },
          { letter: 'd', text: 'The sheer joy and positivity it radiates' },
          { letter: 'e', text: 'The introspection and self-discovery it encourages' },
        ],
      },
      {
        q: 'Which artworks do you feel most drawn to?',
        options: [
          { letter: 'a', text: 'Artworks that inspire and uplift' },
          { letter: 'b', text: 'Artworks that create a sense of harmony and unity' },
          { letter: 'c', text: 'Artworks that challenge societal norms and provoke discussion' },
          { letter: 'd', text: 'Artworks that evoke joy and happiness' },
          { letter: 'e', text: 'Artworks that encourage self-reflection and introspection' },
        ],
      },
      {
        q: 'What motivates you the most when viewing art?',
        options: [
          { letter: 'a', text: 'The inspiration it ignites within you' },
          { letter: 'b', text: 'The sense of harmony and balance it portrays' },
          { letter: 'c', text: 'The mysteries and hidden meanings it holds' },
          { letter: 'd', text: 'The joy and positivity it radiates' },
          { letter: 'e', text: 'The drive and determination it instills to pursue dreams' },
        ],
      },
      {
        q: 'Which artwork would intrigue you the most?',
        options: [
          { letter: 'a', text: 'Artworks that challenge traditional notions and push boundaries' },
          { letter: 'b', text: 'Artworks that create a sense of harmony and balance' },
          { letter: 'c', text: 'Artworks that hold secrets and invite interpretation' },
          { letter: 'd', text: 'Artworks that evoke a sense of joy and playfulness' },
          { letter: 'e', text: 'Artworks that encourage introspection and self-discovery' },
        ],
      },
    ],
    results: {
      a: { moodKey: 'Inspiration', blurb: 'You seek art that ignites ideas and lifts you toward something greater.' },
      b: { moodKey: 'Harmony', blurb: 'You are drawn to balance, unity, and a sense of calm wholeness.' },
      c: { moodKey: 'Intrigue', blurb: 'You love mystery, hidden meaning, and art that invites interpretation.' },
      d: { moodKey: 'Joy', blurb: 'You search for warmth, playfulness, and pure positive energy.' },
      e: { moodKey: 'Self-reflection', blurb: 'You connect with art that turns the gaze inward and sparks discovery.' },
    },
  },
  ro: {
    questionOf: 'Întrebarea {n} din {total}',
    yourMoodIs: 'Dispoziția ta artistică este',
    exploreTemplate: 'Explorează lucrările {mood}',
    takeAgain: 'Reia testul',
    questions: [
      {
        q: 'Ce tip de lucrare îți aduce cea mai mare bucurie?',
        options: [
          { letter: 'a', text: 'Vibrantă și energică' },
          { letter: 'b', text: 'Senină și liniștită' },
          { letter: 'c', text: 'Jucăușă și fantezistă' },
          { letter: 'd', text: 'Expresivă și plină de viață' },
          { letter: 'e', text: 'Luminoasă și colorată' },
        ],
      },
      {
        q: 'Când privești o lucrare, la ce te gândești?',
        options: [
          { letter: 'a', text: 'La frumusețea naturii și a lumii din jur' },
          { letter: 'b', text: 'La echilibrul și unitatea din interiorul lucrării' },
          { letter: 'c', text: 'La elementele enigmatice și misterioase pe care le conține' },
          { letter: 'd', text: 'La bucuria pură și pozitivitatea pe care o emană' },
          { letter: 'e', text: 'La introspecția și autodescoperirea pe care le încurajează' },
        ],
      },
      {
        q: 'Către ce lucrări te simți cel mai atras?',
        options: [
          { letter: 'a', text: 'Lucrări care inspiră și înalță' },
          { letter: 'b', text: 'Lucrări care creează un sentiment de armonie și unitate' },
          { letter: 'c', text: 'Lucrări care provoacă normele sociale și stârnesc discuții' },
          { letter: 'd', text: 'Lucrări care trezesc bucurie și fericire' },
          { letter: 'e', text: 'Lucrări care încurajează introspecția și reflecția' },
        ],
      },
      {
        q: 'Ce te motivează cel mai mult când privești artă?',
        options: [
          { letter: 'a', text: 'Inspirația pe care o aprinde în tine' },
          { letter: 'b', text: 'Sentimentul de armonie și echilibru pe care îl transmite' },
          { letter: 'c', text: 'Misterele și înțelesurile ascunse pe care le poartă' },
          { letter: 'd', text: 'Bucuria și pozitivitatea pe care le emană' },
          { letter: 'e', text: 'Elanul și determinarea de a-ți urma visurile' },
        ],
      },
      {
        q: 'Ce lucrare te-ar intriga cel mai mult?',
        options: [
          { letter: 'a', text: 'Lucrări care provoacă noțiunile tradiționale și depășesc limitele' },
          { letter: 'b', text: 'Lucrări care creează armonie și echilibru' },
          { letter: 'c', text: 'Lucrări care ascund secrete și invită la interpretare' },
          { letter: 'd', text: 'Lucrări care trezesc bucurie și joc' },
          { letter: 'e', text: 'Lucrări care încurajează introspecția și autodescoperirea' },
        ],
      },
    ],
    results: {
      a: { moodKey: 'Inspiration', blurb: 'Cauți artă care aprinde idei și te înalță spre ceva mai mare.' },
      b: { moodKey: 'Harmony', blurb: 'Ești atras de echilibru, unitate și un sentiment de întregime calmă.' },
      c: { moodKey: 'Intrigue', blurb: 'Îți place misterul, înțelesul ascuns și arta care invită la interpretare.' },
      d: { moodKey: 'Joy', blurb: 'Cauți căldură, joc și energie pozitivă pură.' },
      e: { moodKey: 'Self-reflection', blurb: 'Te conectezi cu arta care întoarce privirea înăuntru și stârnește descoperirea.' },
    },
  },
}

export function getQuiz(lang: Lang): QuizDoc {
  return QUIZ[lang] || QUIZ[DEFAULT_LANG]
}