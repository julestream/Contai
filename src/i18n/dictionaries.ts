export type Lang = 'hu' | 'en' | 'ro'

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
]

export const DEFAULT_LANG: Lang = 'hu'

type Dict = Record<string, any>

export const dictionaries: Record<Lang, Dict> = {
  hu: {
    common: {
      back: 'Vissza',
      viewAll: 'ÖSSZES',
    },
    guarantee: {
      tag: 'Garancia',
      title: 'A Contai Garancia',
      subtitle: 'Foglalj nyugodtan. A foglalási díjad védve van.',
      intro: 'Amikor lefoglalsz egy alkotást a Contain, egy kisebb foglalási díjat fizetsz (az ár 8%-át), amivel lefoglalod a műalkotást. A fennmaradó összeget közvetlenül a művésznek fizeted, amikor személyesen találkoztok. A Contai Garancia ezt a foglalási díjat védi, így a foglalás kockázatmentes.',
      refundTitle: 'A foglalási díjadat teljes egészében visszakapod, ha:',
      refunds: [
        'A művész nem jelenik meg a megbeszélt találkozón',
        'A műalkotás lényegesen eltér attól, ahogyan le volt írva vagy le volt fényképezve',
        'A művész lemondja a foglalást, vagy már nem tudja eladni az alkotást',
        'Te és a művész nem tudtok megegyezni a találkozó időpontjában vagy helyében',
      ],
      refundNote: 'Bármelyik esetben egyszerűen jelezd a problémát az alkalmazáson keresztül, és teljes egészében visszatérítjük a foglalási díjadat — bonyolult folyamat nélkül.',
      howTitle: 'Hogyan működik:',
      how: [
        'Lefoglalsz egy alkotást és kifizeted a 8% díjat. A műalkotást fenntartjuk neked.',
        'Személyesen találkozol a művésszel, megnézed az alkotást, kifizeted a fennmaradó összeget, és átveszed.',
        'Az átvétel előtt személyesen megvizsgálod a műalkotást. Mivel a saját szemeddel látod, mielőtt a többit kifizetnéd, a személyes vásárlás véglegessé válik, amint elfogadod és átveszed az alkotást.',
      ],
      notCoveredTitle: 'Mire nem terjed ki a garancia:',
      notCovered: [
        'Meggondolásra, miután személyesen megvizsgáltad és elfogadtad a műalkotást',
        'Az állapottal vagy az eredetiséggel kapcsolatos vitákra, miután elfogadtad és átvetted az alkotást',
        'A foglalási díjra, ha te nem jelensz meg egy találkozón, amelyen a művész megjelent, vagy indok nélkül lemondod',
      ],
      promiseTitle: 'Az ígéretünk',
      promise: 'A Contai a művészek és a műértők közötti bizalomra épül. A foglalási díj mindkét felet védi — biztosítja neked az alkotást, és tiszteletben tartja a művész idejét. Ha valami balul sül el, mielőtt megkapnád a műalkotásodat, nem veszíted el a pénzedet.',
    },
  },
  en: {
    common: {
      back: 'Back',
      viewAll: 'VIEW ALL',
    },
    guarantee: {
      tag: 'Guarantee',
      title: 'The Contai Guarantee',
      subtitle: 'Reserve with confidence. Your reservation fee is protected.',
      intro: 'When you reserve a piece on Contai, you pay a small reservation fee (8% of the price) to hold the artwork. The rest you pay the artist directly when you meet in person. The Contai Guarantee protects that reservation fee, so reserving is risk-free.',
      refundTitle: 'You get a full refund of your reservation fee if:',
      refunds: [
        'The artist doesn\'t show up to the agreed meeting',
        'The artwork is materially different from how it was described or pictured',
        'The artist cancels the reservation or can no longer sell the piece',
        'You and the artist cannot agree on a time or place to meet',
      ],
      refundNote: 'In any of these cases, just report the issue through the app and we\'ll refund your reservation fee in full — no complicated process.',
      howTitle: 'How it works:',
      how: [
        'You reserve a piece and pay the 8% fee. The artwork is held for you.',
        'You meet the artist in person to see the piece, pay the remaining amount, and collect it.',
        'You inspect the artwork in person before completing the purchase. Because you see it with your own eyes before paying the rest, the in-person sale is final once you accept and take the piece.',
      ],
      notCoveredTitle: 'What the guarantee does not cover:',
      notCovered: [
        'Changes of mind after you have inspected and accepted the artwork in person',
        'Disputes about condition or authenticity after you have accepted and collected the piece',
        'The reservation fee if you do not show up to a meeting the artist attended, or cancel without reason',
      ],
      promiseTitle: 'Our promise',
      promise: 'Contai is built on trust between artists and art lovers. The reservation fee exists to protect both sides — it secures the piece for you and respects the artist\'s time. If something goes wrong before you receive your artwork, you will not lose your money.',
    },
  },
  ro: {
    common: {
      back: 'Înapoi',
      viewAll: 'VEZI TOATE',
    },
    guarantee: {
      tag: 'Garanție',
      title: 'Garanția Contai',
      subtitle: 'Rezervă cu încredere. Taxa ta de rezervare este protejată.',
      intro: 'Când rezervi o lucrare pe Contai, plătești o mică taxă de rezervare (8% din preț) pentru a păstra opera de artă. Restul îl plătești direct artistului când vă întâlniți personal. Garanția Contai protejează această taxă de rezervare, astfel încât rezervarea să fie fără riscuri.',
      refundTitle: 'Primești o rambursare completă a taxei de rezervare dacă:',
      refunds: [
        'Artistul nu se prezintă la întâlnirea stabilită',
        'Opera de artă diferă semnificativ de modul în care a fost descrisă sau fotografiată',
        'Artistul anulează rezervarea sau nu mai poate vinde lucrarea',
        'Tu și artistul nu vă puteți pune de acord asupra orei sau locului întâlnirii',
      ],
      refundNote: 'În oricare dintre aceste cazuri, raportează problema prin aplicație și îți vom rambursa integral taxa de rezervare — fără proceduri complicate.',
      howTitle: 'Cum funcționează:',
      how: [
        'Rezervi o lucrare și plătești taxa de 8%. Opera de artă este păstrată pentru tine.',
        'Te întâlnești personal cu artistul pentru a vedea lucrarea, plătești suma rămasă și o ridici.',
        'Inspectezi opera personal înainte de a finaliza achiziția. Deoarece o vezi cu ochii tăi înainte de a plăti restul, vânzarea personală devine finală odată ce accepți și iei lucrarea.',
      ],
      notCoveredTitle: 'Ce nu acoperă garanția:',
      notCovered: [
        'Răzgândirea după ce ai inspectat și acceptat opera personal',
        'Dispute privind starea sau autenticitatea după ce ai acceptat și ridicat lucrarea',
        'Taxa de rezervare dacă nu te prezinți la o întâlnire la care artistul a participat, sau anulezi fără motiv',
      ],
      promiseTitle: 'Promisiunea noastră',
      promise: 'Contai este construit pe încredere între artiști și iubitorii de artă. Taxa de rezervare există pentru a proteja ambele părți — îți asigură lucrarea și respectă timpul artistului. Dacă ceva nu merge bine înainte să primești opera, nu îți vei pierde banii.',
    },
  },
}

export function getDict(lang: Lang): Dict {
  return dictionaries[lang] || dictionaries[DEFAULT_LANG]
}