import { Lang } from './dictionaries'

type FaqItem = { q: string; a: string }
type BadgeItem = { name: string; color: string; desc: string }

type InfoSet = {
  help: { title: string; faq: FaqItem[] }
  badges: { title: string; intro: string; items: BadgeItem[] }
}

const BADGE_COLORS = ['#3a5a44', '#9c5a3c', '#6b4a6b']

export const infopages: Record<Lang, InfoSet> = {
  hu: {
    help: {
      title: 'Súgóközpont',
      faq: [
        { q: 'Hogyan működik a foglalás?', a: 'Amikor megtalálsz egy alkotást, amit szeretsz, lefoglalod egy 8%-os foglalási díj kifizetésével. Ez fenntartja neked a művet. Ezután személyesen találkozol a művésszel, megnézed az alkotást, kifizeted a fennmaradó összeget, és átveszed.' },
        { q: 'Mi a foglalási díj?', a: 'A foglalási díj az alkotás árának 8%-a. Biztosítja neked a művet, és a Contai Garancia védi.' },
        { q: 'Biztonságban van a foglalási díjam?', a: 'Igen. A Contai Garancia teljes visszatérítést ad a foglalási díjadra, ha a művész nem jelenik meg, az alkotás lényegesen eltér a leírástól, vagy a vásárlás rajtad kívül álló okból nem teljesülhet.' },
        { q: 'Hogyan fizetem ki a többi részt?', a: 'A fennmaradó összeget közvetlenül a művésznek fizeted, amikor személyesen találkoztok az alkotás átvételekor.' },
        { q: 'Tehetek ajánlatot a kért ár alatt?', a: 'Igen. Az alkotás oldalán ajánlatot tehetsz, a művész pedig elfogadhatja, elutasíthatja vagy módosíthatja azt. Elfogadás esetén a megegyezett áron foglalsz.' },
        { q: 'Hogyan lehetek művész a Contain?', a: 'Regisztrálj, válaszd a művész szerepet, töltsd ki a profilodat és végezd el az ellenőrzést. Az ellenőrzés után feltöltheted a munkáidat.' },
        { q: 'Még mindig segítségre van szükséged?', a: 'Írj nekünk bármikor a hello@contaigallery.com címre, és hamarosan válaszolunk.' },
      ],
    },
    badges: {
      title: 'Jelvények',
      intro: 'A jelvények segítenek a vevőknek felismerni a megbízható és kiemelkedő művészeket a Contain. Íme, mit jelent mindegyik.',
      items: [
        { name: 'Ellenőrzött művész', color: BADGE_COLORS[0], desc: 'Automatikusan jár, amikor egy művész elvégzi a személyazonosság-ellenőrzést. Megerősíti, hogy a munka mögött álló személy az, akinek mondja magát.' },
        { name: 'Elismert művész', color: BADGE_COLORS[1], desc: 'A Contai csapata ítéli oda olyan művészeknek, akiknek következetes a teljesítményük és jelentős munkásságuk van a platformon.' },
        { name: 'Kurátori választás', color: BADGE_COLORS[2], desc: 'A Contai csapata által választott különleges elismerés olyan művészeknek, akiknek a munkája minőségével és eredetiségével kiemelkedik.' },
      ],
    },
  },
  en: {
    help: {
      title: 'Help centre',
      faq: [
        { q: 'How does reserving an artwork work?', a: 'When you find a piece you love, you reserve it by paying an 8% reservation fee. This holds the artwork for you. You then meet the artist in person to see the piece, pay the remaining amount directly, and collect it.' },
        { q: 'What is the reservation fee?', a: 'The reservation fee is 8% of the artwork price. It secures the piece for you and is protected by the Contai Guarantee.' },
        { q: 'Is my reservation fee safe?', a: 'Yes. The Contai Guarantee gives you a full refund of your reservation fee if the artist does not show up, the artwork is materially different from its description, or the sale cannot be completed for reasons that are not your fault.' },
        { q: 'How do I pay the rest of the price?', a: 'You pay the remaining amount directly to the artist when you meet in person to collect the artwork.' },
        { q: 'Can I make an offer below the asking price?', a: 'Yes. On an artwork page you can make an offer, and the artist can accept, decline, or counter it. If accepted, you reserve at the agreed price.' },
        { q: 'How do I become an artist on Contai?', a: 'Sign up and choose the artist role, then complete your profile and verification. Once verified, you can upload your work.' },
        { q: 'Still need help?', a: 'Contact us any time at hello@contaigallery.com and we will get back to you.' },
      ],
    },
    badges: {
      title: 'Badges',
      intro: 'Badges help buyers recognise trusted and notable artists on Contai. Here\'s what each one means.',
      items: [
        { name: 'Verified Artist', color: BADGE_COLORS[0], desc: 'Awarded automatically when an artist completes identity verification. It confirms the person behind the work is who they say they are.' },
        { name: 'Established Artist', color: BADGE_COLORS[1], desc: 'Awarded by the Contai team to artists with a consistent track record and a body of work on the platform.' },
        { name: 'Curator Pick', color: BADGE_COLORS[2], desc: 'A special recognition chosen by the Contai team for artists whose work stands out for its quality and originality.' },
      ],
    },
  },
  ro: {
    help: {
      title: 'Centru de ajutor',
      faq: [
        { q: 'Cum funcționează rezervarea unei lucrări?', a: 'Când găsești o lucrare care îți place, o rezervi plătind o taxă de rezervare de 8%. Aceasta păstrează lucrarea pentru tine. Apoi te întâlnești personal cu artistul pentru a vedea lucrarea, plătești suma rămasă direct și o ridici.' },
        { q: 'Ce este taxa de rezervare?', a: 'Taxa de rezervare este 8% din prețul lucrării. Îți asigură lucrarea și este protejată de Garanția Contai.' },
        { q: 'Este în siguranță taxa mea de rezervare?', a: 'Da. Garanția Contai îți oferă o rambursare completă a taxei de rezervare dacă artistul nu se prezintă, lucrarea diferă semnificativ de descriere, sau vânzarea nu poate fi finalizată din motive care nu țin de tine.' },
        { q: 'Cum plătesc restul prețului?', a: 'Plătești suma rămasă direct artistului când vă întâlniți personal pentru a ridica lucrarea.' },
        { q: 'Pot face o ofertă sub prețul cerut?', a: 'Da. Pe pagina unei lucrări poți face o ofertă, iar artistul o poate accepta, refuza sau contraoferta. Dacă este acceptată, rezervi la prețul convenit.' },
        { q: 'Cum devin artist pe Contai?', a: 'Înregistrează-te și alege rolul de artist, apoi completează-ți profilul și verificarea. După verificare, îți poți încărca lucrările.' },
        { q: 'Mai ai nevoie de ajutor?', a: 'Contactează-ne oricând la hello@contaigallery.com și îți vom răspunde.' },
      ],
    },
    badges: {
      title: 'Insigne',
      intro: 'Insignele îi ajută pe cumpărători să recunoască artiștii de încredere și remarcabili de pe Contai. Iată ce înseamnă fiecare.',
      items: [
        { name: 'Artist verificat', color: BADGE_COLORS[0], desc: 'Acordată automat când un artist finalizează verificarea identității. Confirmă că persoana din spatele lucrării este cine spune că este.' },
        { name: 'Artist consacrat', color: BADGE_COLORS[1], desc: 'Acordată de echipa Contai artiștilor cu un istoric constant și o operă semnificativă pe platformă.' },
        { name: 'Alegerea curatorului', color: BADGE_COLORS[2], desc: 'O recunoaștere specială aleasă de echipa Contai pentru artiștii a căror operă se remarcă prin calitate și originalitate.' },
      ],
    },
  },
}

export function getInfo(lang: Lang) {
  return infopages[lang] || infopages.hu
}