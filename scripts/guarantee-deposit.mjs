// Makes the reservation fee a genuine deposit rather than a refundable hold.
//
// The old Guarantee refunded the fee when 'you and the artist cannot agree
// on a time or place to meet' — a clause entirely within the buyer's
// control, so any buyer who cooled off could simply stop agreeing. That sat
// oddly beside the 'not covered' list, which already said the fee is kept if
// the buyer cancels without reason. The two contradicted each other.
//
// Now: the buyer is protected when the ARTIST fails, and committed when they
// themselves walk away. Genuine deadlock is still refunded, but framed as
// the artist not arranging the handover within the window.
//
// LEGAL: consumer terms. Have this reviewed before publicising it.
//
//   node scripts/guarantee-deposit.mjs

import fs from 'node:fs/promises'

const FILE = 'src/i18n/dictionaries.ts'

const edits = [
  // ── HU ─────────────────────────────────────────────────────
  {
    label: 'hu — guarantee.intro',
    from: `      intro: 'Amikor lefoglalsz egy alkotást a Contain, egy kisebb foglalási díjat fizetsz (az ár 8%-át), amivel lefoglalod a műalkotást. A fennmaradó összeget közvetlenül a művésznek fizeted, amikor személyesen találkoztok. A Contai Garancia ezt a foglalási díjat védi, így a foglalás kockázatmentes.',`,
    to: `      intro: 'Amikor lefoglalsz egy alkotást a Contain, foglalót fizetsz — az ár 8%-át. Ezzel a mű lekerül a piactérről, és a művész félreteszi neked. A fennmaradó összeget közvetlenül a művésznek fizeted, amikor személyesen találkoztok. A foglaló azt jelenti, hogy komolyan gondolod a vásárlást; a Contai Garancia pedig azt, hogy ha a művész oldalán borul valami, visszakapod.',`,
  },
  {
    label: 'hu — guarantee.refunds',
    from: `      refunds: [
        'A művész nem jelenik meg a megbeszélt találkozón',
        'A műalkotás lényegesen eltér attól, ahogyan le volt írva vagy le volt fényképezve',
        'A művész lemondja a foglalást, vagy már nem tudja eladni az alkotást',
        'Te és a művész nem tudtok megegyezni a találkozó időpontjában vagy helyében',
      ],`,
    to: `      refunds: [
        'A művész nem jelenik meg a megbeszélt találkozón',
        'A műalkotás lényegesen eltér attól, ahogyan le volt írva vagy le volt fényképezve',
        'A művész lemondja a foglalást, vagy már nem tudja eladni az alkotást',
        'A művész nem válaszol, vagy nem tud átadási időpontot egyeztetni a 48 órás ablakon belül',
      ],`,
  },
  {
    label: 'hu — guarantee.notCovered',
    from: `      notCovered: [
        'Meggondolásra, miután személyesen megvizsgáltad és elfogadtad a műalkotást',
        'Az állapottal vagy az eredetiséggel kapcsolatos vitákra, miután elfogadtad és átvetted az alkotást',
        'A foglalási díjra, ha te nem jelensz meg egy találkozón, amelyen a művész megjelent, vagy indok nélkül lemondod',
      ],`,
    to: `      notCovered: [
        'Ha meggondolod magad, és nem szeretnéd megvásárolni a művet — a foglaló ilyenkor a művészé marad',
        'Ha nem jelensz meg egy találkozón, amelyen a művész megjelent',
        'Meggondolásra, miután személyesen megvizsgáltad és elfogadtad a műalkotást',
        'Az állapottal vagy az eredetiséggel kapcsolatos vitákra, miután elfogadtad és átvetted az alkotást',
      ],`,
  },

  // ── EN ─────────────────────────────────────────────────────
  {
    label: 'en — guarantee.intro',
    from: `      intro: 'When you reserve a piece on Contai, you pay a small reservation fee (8% of the price) to hold the artwork. The rest you pay the artist directly when you meet in person. The Contai Guarantee protects that reservation fee, so reserving is risk-free.',`,
    to: `      intro: 'When you reserve a piece on Contai, you pay a deposit — 8% of the price. The work comes off the marketplace and the artist sets it aside for you. The rest you pay the artist directly when you meet in person. The deposit is what makes your intention to buy real; the Contai Guarantee is what protects you if the artist is the one who lets you down.',`,
  },
  {
    label: 'en — guarantee.refunds',
    from: `      refunds: [
        'The artist doesn\\'t show up to the agreed meeting',
        'The artwork is materially different from how it was described or pictured',
        'The artist cancels the reservation or can no longer sell the piece',
        'You and the artist cannot agree on a time or place to meet',
      ],`,
    to: `      refunds: [
        'The artist doesn\\'t show up to the agreed meeting',
        'The artwork is materially different from how it was described or pictured',
        'The artist cancels the reservation or can no longer sell the piece',
        'The artist does not respond, or cannot arrange a handover within the 48-hour window',
      ],`,
  },
  {
    label: 'en — guarantee.notCovered',
    from: `      notCovered: [
        'Changes of mind after you have inspected and accepted the artwork in person',
        'Disputes about condition or authenticity after you have accepted and collected the piece',
        'The reservation fee if you do not show up to a meeting the artist attended, or cancel without reason',
      ],`,
    to: `      notCovered: [
        'Changing your mind and deciding not to buy — the deposit then stays with the artist',
        'Not turning up to a meeting the artist attended',
        'Changes of mind after you have inspected and accepted the artwork in person',
        'Disputes about condition or authenticity after you have accepted and collected the piece',
      ],`,
  },

  // ── RO ─────────────────────────────────────────────────────
  {
    label: 'ro — guarantee.intro',
    from: `      intro: 'Când rezervi o lucrare pe Contai, plătești o mică taxă de rezervare (8% din preț) pentru a păstra opera de artă. Restul îl plătești direct artistului când vă întâlniți personal. Garanția Contai protejează această taxă de rezervare, astfel încât rezervarea să fie fără riscuri.',`,
    to: `      intro: 'Când rezervi o lucrare pe Contai, plătești un avans — 8% din preț. Lucrarea este retrasă de pe piață, iar artistul o pune deoparte pentru tine. Restul îl plătești direct artistului când vă întâlniți personal. Avansul arată că intenția ta de cumpărare este serioasă; Garanția Contai te protejează dacă artistul este cel care nu se ține de cuvânt.',`,
  },
  {
    label: 'ro — guarantee.refunds',
    from: `      refunds: [
        'Artistul nu se prezintă la întâlnirea stabilită',
        'Opera de artă diferă semnificativ de modul în care a fost descrisă sau fotografiată',
        'Artistul anulează rezervarea sau nu mai poate vinde lucrarea',
        'Tu și artistul nu vă puteți pune de acord asupra orei sau locului întâlnirii',
      ],`,
    to: `      refunds: [
        'Artistul nu se prezintă la întâlnirea stabilită',
        'Opera de artă diferă semnificativ de modul în care a fost descrisă sau fotografiată',
        'Artistul anulează rezervarea sau nu mai poate vinde lucrarea',
        'Artistul nu răspunde sau nu poate stabili predarea în intervalul de 48 de ore',
      ],`,
  },
  {
    label: 'ro — guarantee.notCovered',
    from: `      notCovered: [
        'Răzgândirea după ce ai inspectat și acceptat opera personal',
        'Dispute privind starea sau autenticitatea după ce ai acceptat și ridicat lucrarea',
        'Taxa de rezervare dacă nu te prezinți la o întâlnire la care artistul a participat, sau anulezi fără motiv',
      ],`,
    to: `      notCovered: [
        'Dacă te răzgândești și nu mai vrei să cumperi lucrarea — avansul rămâne atunci la artist',
        'Dacă nu te prezinți la o întâlnire la care artistul a participat',
        'Răzgândirea după ce ai inspectat și acceptat opera personal',
        'Dispute privind starea sau autenticitatea după ce ai acceptat și ridicat lucrarea',
      ],`,
  },

  // ── reserve page: what the buyer is committing to ──────────
  {
    label: 'hu — reserve.commitment',
    from: `      invoicingTitle: 'Két külön fizetés',`,
    to: `      commitmentTitle: 'Ez foglaló, nem előjegyzés',
      commitmentNote: 'A 8% foglaló azt jelenti, hogy meg szeretnéd venni a művet. A mű lekerül a piactérről, és a művész félreteszi neked. Ha a művész oldalán borul valami — nem jelenik meg, lemondja, vagy a mű nem olyan, mint a képeken —, a foglalót visszakapod. Ha te gondolod meg magad, a foglaló a művészé marad.',
      invoicingTitle: 'Két külön fizetés',`,
  },
  {
    label: 'en — reserve.commitment',
    from: `      invoicingTitle: 'Two separate payments',`,
    to: `      commitmentTitle: 'This is a deposit, not a wishlist',
      commitmentNote: 'The 8% deposit means you intend to buy the work. It comes off the marketplace and the artist sets it aside for you. If the artist lets you down — doesn\\'t turn up, cancels, or the work isn\\'t as pictured — you get the deposit back. If you change your mind, it stays with the artist.',
      invoicingTitle: 'Two separate payments',`,
  },
  {
    label: 'ro — reserve.commitment',
    from: `      invoicingTitle: 'Două plăți separate',`,
    to: `      commitmentTitle: 'Acesta este un avans, nu o listă de dorințe',
      commitmentNote: 'Avansul de 8% înseamnă că intenționezi să cumperi lucrarea. Ea este retrasă de pe piață, iar artistul o pune deoparte pentru tine. Dacă artistul nu se ține de cuvânt — nu se prezintă, anulează sau lucrarea nu arată ca în fotografii — primești avansul înapoi. Dacă te răzgândești, avansul rămâne la artist.',
      invoicingTitle: 'Două plăți separate',`,
  },
]

const original = await fs.readFile(FILE, 'utf8')
const pending = edits.filter(e => !original.includes(e.to))

if (pending.length === 0) {
  console.log('All copy already present. Nothing to do.')
  process.exit(0)
}

let ok = true
for (const edit of pending) {
  const count = original.split(edit.from).length - 1
  if (count === 1) console.log(`  ok       ${edit.label}`)
  else { console.log(`  FAILED   ${edit.label} — found ${count} matches, expected 1`); ok = false }
}

if (!ok) {
  console.log('\nNo changes written. The file is untouched.')
  process.exit(1)
}

let updated = original
for (const edit of pending) updated = updated.replace(edit.from, edit.to)

await fs.writeFile(`${FILE}.guarantee.backup`, original)
await fs.writeFile(FILE, updated)
console.log(`\nApplied ${pending.length} edits.`)