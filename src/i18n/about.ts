import { Lang } from './dictionaries'

type Photo = { src: string; caption: string }
type AboutDoc = {
  tag: string
  title: string
  subtitle: string
  paragraphs: string[]
  photos: Photo[]
  closing: string
}

const PHOTOS = ['/about/mobu-2024.jpg', '/about/mobu-2025.jpg', '/about/inspiraciok.jpg', '/about/event.jpg']

export const about: Record<Lang, AboutDoc> = {
  hu: {
    tag: 'Bemutatkozás',
    title: 'A Contai története',
    subtitle: 'Ahol a művészet hazatalál.',
    paragraphs: [
      'A Contai egy érzésből született, amelyet sokan ismerünk: ott állsz a saját otthonodban, és valami olyat szeretnél a falra, aminek tényleg jelentése van — nem csupán dekorációt, hanem egy alkotást, amely tükrözi, ki vagy.',
      'Alapítónk, Julia, művészek között nőtt fel, egy festőművész lányaként. A művészet sosem volt háttérzaj az életében — a motiváció, a vigasz és az önismeret forrása volt. Évekkel később, amikor a férjével felújították az otthonukat, ugyanabba a falba ütközött, mint annyi műértő: a szép, jelentéssel teli, eredeti művészet elérhetetlennek tűnt, ijesztő galériák és átláthatatlan árak mögé rejtve.',
      'Így 2023-ban, Bukarest és Budapest között, megszületett a Contai Galéria, egy egyszerű meggyőződésre építve: az otthon falán a művészet sokkal több, mint dekoráció. Ha összhangban használjuk azzal, akik vagyunk, segít kifejezni önmagunkat, megalapozottabbnak érezni magunkat, és mélyebben kapcsolódni a terünkhöz.',
      'Azóta a galéria személyesen is életre keltette ezt a víziót — kétszer állítottunk ki a bukaresti MOBU Művészeti Vásáron, 2024-ben és 2025-ben, és számos eseményt rendeztünk, amelyek párbeszédbe hozzák a művészetet a mindennapi élettel. Ezek között az Inspirációk a Térben Budapesten, egy est és panelbeszélgetés a művészet és a belsőépítészet találkozásáról, az ELLE Decoration, vezető építészek és saját galériás művészeink részvételével.',
    ],
    photos: [
      { src: PHOTOS[0], caption: 'MOBU Művészeti Vásár, Bukarest 2024 — első art fair megjelenésünk.' },
      { src: PHOTOS[1], caption: 'MOBU Művészeti Vásár, Bukarest 2025 — második évünk Románia kortárs vásárán.' },
      { src: PHOTOS[2], caption: 'Inspirációk a Térben, Budapest — panelestünk a művészetről és a belsőépítészetről.' },
      { src: PHOTOS[3], caption: 'A művészet életre kel — előadások és beszélgetések galériás eseményeinken.' },
    ],
    closing: 'A Contai — a művészeti piactér, amelyet most a kezedben tartasz — ennek a történetnek a következő lépése. Mindent, amit a galéria képvisel, megnyitottunk. Itt felfedezheted helyi művészek eredeti munkáit, lefoglalhatod az alkotást, amely megszólít, és személyesen találkozhatsz az alkotójával, hogy hazavidd. Nincsenek ijesztő bemutatótermek. Nincs találgatás. Csak a művészet, az emberek, akik alkotják, és az emberek, akik együtt élnek vele — egy kicsit közelebb hozva egymáshoz. Üdvözlünk a Contain. Nagyon örülünk, hogy itt vagy.',
  },
  en: {
    tag: 'About',
    title: 'The Contai story',
    subtitle: 'Where art finds its way home.',
    paragraphs: [
      'Contai began with a feeling many of us know: standing in your own home, wanting something on the walls that actually means something — not just decoration, but a piece that reflects who you are.',
      'Our founder, Julia, grew up among artists, the daughter of a painter. Art was never background noise in her life; it was a source of motivation, comfort, and self-discovery. Years later, renovating her own home with her husband, she ran into the same wall so many art lovers do — beautiful, meaningful, original art felt out of reach, hidden behind intimidating galleries and unclear prices.',
      'So in 2023, Contai Gallery was born across Bucharest and Budapest, built on a simple belief: that art at home is far more powerful than decoration. Used in harmony with who you are, it helps you express yourself, feel more grounded, and connect with your space on a deeper level.',
      'Since then, the gallery has brought that vision to life in person — exhibiting twice at the MOBU Art Fair in Bucharest, in 2024 and 2025, and hosting events that bring art into dialogue with everyday life. Among them, Inspirációk a Térben in Budapest, an evening and panel discussion on the meeting point of art and interior design, with voices from ELLE Decoration, leading architects, and our own gallery artists.',
    ],
    photos: [
      { src: PHOTOS[0], caption: 'MOBU Art Fair, Bucharest 2024 — our first art fair, presenting our artists to a wider audience.' },
      { src: PHOTOS[1], caption: 'MOBU Art Fair, Bucharest 2025 — returning for our second year at Romania\'s contemporary art fair.' },
      { src: PHOTOS[2], caption: 'Inspirációk a Térben, Budapest — our panel evening on art and interior design.' },
      { src: PHOTOS[3], caption: 'Bringing art to life — performances and conversations at our gallery events.' },
    ],
    closing: 'Contai — the art market you\'re holding now — is the next step in that story. We\'ve taken everything the gallery stands for and opened it up. Here, you can discover original work from local artists, reserve the piece that speaks to you, and meet its maker in person to bring it home. No intimidating showrooms. No guesswork. Just art, the people who make it, and the people who\'ll live with it — brought a little closer together. Welcome to Contai. We\'re so glad you\'re here.',
  },
  ro: {
    tag: 'Despre noi',
    title: 'Povestea Contai',
    subtitle: 'Unde arta își găsește drumul spre casă.',
    paragraphs: [
      'Contai a început cu un sentiment pe care mulți dintre noi îl cunoaștem: stând în propria casă, dorind ceva pe pereți care să însemne cu adevărat ceva — nu doar decor, ci o lucrare care reflectă cine ești.',
      'Fondatoarea noastră, Julia, a crescut printre artiști, fiica unei pictorițe. Arta nu a fost niciodată un zgomot de fundal în viața ei; a fost o sursă de motivație, alinare și autocunoaștere. Ani mai târziu, renovându-și propria casă împreună cu soțul ei, s-a lovit de același zid ca mulți iubitori de artă — arta originală, frumoasă și plină de sens părea de neatins, ascunsă în spatele galeriilor intimidante și al prețurilor neclare.',
      'Așa că în 2023, Galeria Contai s-a născut între București și Budapesta, construită pe o convingere simplă: arta acasă este mult mai puternică decât decorul. Folosită în armonie cu cine ești, te ajută să te exprimi, să te simți mai ancorat și să te conectezi cu spațiul tău la un nivel mai profund.',
      'De atunci, galeria a adus această viziune la viață în persoană — expunând de două ori la Târgul de Artă MOBU din București, în 2024 și 2025, și găzduind evenimente care aduc arta în dialog cu viața de zi cu zi. Printre acestea, Inspirációk a Térben la Budapesta, o seară și o discuție de panel despre punctul de întâlnire dintre artă și design interior, cu voci de la ELLE Decoration, arhitecți de seamă și artiștii galeriei noastre.',
    ],
    photos: [
      { src: PHOTOS[0], caption: 'Târgul de Artă MOBU, București 2024 — primul nostru târg de artă, prezentând artiștii noștri unui public mai larg.' },
      { src: PHOTOS[1], caption: 'Târgul de Artă MOBU, București 2025 — revenind pentru al doilea an la târgul de artă contemporană din România.' },
      { src: PHOTOS[2], caption: 'Inspirációk a Térben, Budapesta — seara noastră de panel despre artă și design interior.' },
      { src: PHOTOS[3], caption: 'Aducând arta la viață — spectacole și conversații la evenimentele galeriei noastre.' },
    ],
    closing: 'Contai — piața de artă pe care o ții acum — este următorul pas în această poveste. Am luat tot ceea ce reprezintă galeria și am deschis-o. Aici poți descoperi lucrări originale de la artiști locali, poți rezerva piesa care îți vorbește și te poți întâlni personal cu creatorul ei pentru a o aduce acasă. Fără showroom-uri intimidante. Fără presupuneri. Doar arta, oamenii care o creează și oamenii care vor trăi alături de ea — aduși puțin mai aproape. Bine ai venit la Contai. Ne bucurăm că ești aici.',
  },
}

export function getAbout(lang: Lang): AboutDoc {
  return about[lang] || about.hu
}