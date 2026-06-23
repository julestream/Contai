import { Lang } from './dictionaries'

type Step = { title: string; body: string }
type HowDoc = { title: string; intro: string; steps: Step[]; closing: string }

export const howitworks: Record<Lang, HowDoc> = {
  hu: {
    title: 'Hogyan működik a foglalás',
    intro: 'A Contain egyszerű és biztonságos műalkotást vásárolni. Így működik, lépésről lépésre.',
    steps: [
      { title: 'Fedezd fel és foglald le', body: 'Böngéssz a műalkotások között, és amikor megtalálod, ami megszólít, foglald le egy kis foglalási díjjal — az ár 8%-ával. Ez biztosítja neked az alkotást.' },
      { title: 'Fenntartjuk neked', body: 'A foglalás után a műalkotás a tiéd lesz lefoglalva, így senki más nem viheti el, amíg egyeztetsz a művésszel.' },
      { title: 'Találkozz a művésszel', body: 'Személyesen találkozol a művésszel egy közösen egyeztetett helyen és időben, hogy a saját szemeddel lásd az alkotást.' },
      { title: 'Nézd meg és fizesd ki a többit', body: 'A helyszínen megvizsgálod a művet, és ha minden rendben, kifizeted a fennmaradó összeget közvetlenül a művésznek.' },
      { title: 'Vidd haza', body: 'Az alkotás a tiéd — vidd haza, és élvezd. A foglalási díjadat a Contai Garancia védi, ha bármi balul sülne el.' },
    ],
    closing: 'A teljes folyamatot a Contai Garancia kíséri: ha a művész nem jelenik meg, vagy az alkotás lényegesen eltér a leírástól, teljes egészében visszatérítjük a foglalási díjadat.',
  },
  en: {
    title: 'How reservations work',
    intro: 'Buying art on Contai is simple and secure. Here\'s how it works, step by step.',
    steps: [
      { title: 'Discover and reserve', body: 'Browse the artworks, and when you find the one that speaks to you, reserve it with a small reservation fee — 8% of the price. This secures the piece for you.' },
      { title: 'We hold it for you', body: 'Once reserved, the artwork is held for you, so no one else can take it while you arrange to meet the artist.' },
      { title: 'Meet the artist', body: 'You meet the artist in person, at a time and place you both agree on, to see the artwork with your own eyes.' },
      { title: 'Inspect and pay the rest', body: 'You inspect the piece in person, and if all is well, you pay the remaining amount directly to the artist.' },
      { title: 'Take it home', body: 'The artwork is yours — take it home and enjoy it. Your reservation fee is protected by the Contai Guarantee if anything goes wrong.' },
    ],
    closing: 'The whole process is backed by the Contai Guarantee: if the artist doesn\'t show up, or the artwork is materially different from its description, we refund your reservation fee in full.',
  },
  ro: {
    title: 'Cum funcționează rezervările',
    intro: 'Cumpărarea de artă pe Contai este simplă și sigură. Iată cum funcționează, pas cu pas.',
    steps: [
      { title: 'Descoperă și rezervă', body: 'Răsfoiește lucrările, iar când o găsești pe cea care îți vorbește, rezerv-o cu o mică taxă de rezervare — 8% din preț. Aceasta îți asigură lucrarea.' },
      { title: 'O păstrăm pentru tine', body: 'Odată rezervată, lucrarea este păstrată pentru tine, astfel încât nimeni altcineva să nu o poată lua cât timp stabilești întâlnirea cu artistul.' },
      { title: 'Întâlnește artistul', body: 'Te întâlnești personal cu artistul, la un moment și loc agreate de comun acord, pentru a vedea lucrarea cu ochii tăi.' },
      { title: 'Inspectează și plătește restul', body: 'Inspectezi lucrarea personal, iar dacă totul este în regulă, plătești suma rămasă direct artistului.' },
      { title: 'Ia-o acasă', body: 'Lucrarea este a ta — ia-o acasă și bucură-te de ea. Taxa ta de rezervare este protejată de Garanția Contai dacă ceva nu merge bine.' },
    ],
    closing: 'Întregul proces este susținut de Garanția Contai: dacă artistul nu se prezintă sau lucrarea diferă semnificativ de descriere, îți rambursăm integral taxa de rezervare.',
  },
}

export function getHowItWorks(lang: Lang): HowDoc {
  return howitworks[lang] || howitworks.hu
}