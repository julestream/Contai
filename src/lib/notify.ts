import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, normLang, EmailLang } from '@/lib/email'

const FOOTER: Record<EmailLang, string> = {
  hu: 'Ezt az üzenetet a Contai küldte, mert foglalás történt a fiókodban. A Contai Garancia végig veled van.',
  en: 'Contai sent this because there is activity on your account. The Contai Guarantee is with you the whole way.',
  ro: 'Contai ți-a trimis acest mesaj pentru că există activitate în contul tău. Garanția Contai este cu tine pe tot parcursul.',
}

/** Look up someone's email address and preferred language. */
async function recipient(profileId: string) {
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, preferred_lang')
    .eq('id', profileId)
    .single()

  const { data: authUser } = await admin.auth.admin.getUserById(profileId)
  const email = authUser?.user?.email
  if (!email) return null

  return {
    email,
    name: profile?.full_name || '',
    lang: normLang(profile?.preferred_lang),
  }
}

function formatWhen(iso: string, lang: EmailLang) {
  const locale = lang === 'hu' ? 'hu-HU' : lang === 'ro' ? 'ro-RO' : 'en-GB'
  try {
    return new Date(iso).toLocaleString(locale, {
      weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

/** The artist learns their work has been reserved and paid for. */
export async function notifyArtistOfReservation(reservationId: string) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, artworks(title, artist_id)')
    .eq('id', reservationId)
    .single()

  const artwork: any = (res as any)?.artworks
  if (!res || !artwork?.artist_id) return

  const artist = await recipient(artwork.artist_id)
  if (!artist) return

  const buyer = await recipient(res.buyer_id)
  const buyerName = buyer?.name || ''

  const copy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
    hu: {
      subject: `${artwork.title} — lefoglalva`,
      heading: 'Lefoglalták a művedet',
      body: `${buyerName ? buyerName + ' ' : 'Egy gyűjtő '}lefoglalta a(z) <strong>${artwork.title}</strong> című műved, és kifizette a foglalási díjat. A következő lépés a találkozó időpontjának egyeztetése — javasolhatsz egyet, vagy elfogadhatod az övét. A pontos címed csak akkor kerül megosztásra, amikor mindketten megerősítettétek.`,
      cta: 'Az átadás egyeztetése',
    },
    en: {
      subject: `${artwork.title} has been reserved`,
      heading: 'Your work has been reserved',
      body: `${buyerName || 'A collector'} has reserved <strong>${artwork.title}</strong> and paid the reservation fee. The next step is agreeing a time to meet — you can propose one, or accept theirs. Your exact address is only shared once you have both confirmed.`,
      cta: 'Arrange the handover',
    },
    ro: {
      subject: `${artwork.title} a fost rezervată`,
      heading: 'Lucrarea ta a fost rezervată',
      body: `${buyerName || 'Un colecționar'} a rezervat <strong>${artwork.title}</strong> și a plătit taxa de rezervare. Următorul pas este stabilirea unei ore de întâlnire — poți propune una sau o poți accepta pe a lui. Adresa ta exactă se partajează doar după ce amândoi ați confirmat.`,
      cta: 'Stabilește predarea',
    },
  }

  const c = copy[artist.lang]
  await sendEmail({
    to: artist.email,
    subject: c.subject,
    heading: c.heading,
    body: c.body,
    ctaLabel: c.cta,
    ctaPath: `/handoff/${res.id}`,
    footer: FOOTER[artist.lang],
  })
}

/** Someone proposed or confirmed a meeting time — tell the other person. */
export async function notifyMeeting(
  reservationId: string,
  actorId: string,
  action: 'propose' | 'confirm'
) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, meeting_at, artworks(title, artist_id)')
    .eq('id', reservationId)
    .single()

  const artwork: any = (res as any)?.artworks
  if (!res || !artwork?.artist_id || !res.meeting_at) return

  // Notify whichever side did not perform the action.
  const otherId = actorId === res.buyer_id ? artwork.artist_id : res.buyer_id
  const other = await recipient(otherId)
  if (!other) return

  const actor = await recipient(actorId)
  const actorName = actor?.name || ''
  const when = formatWhen(res.meeting_at, other.lang)

  const proposed: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
    hu: {
      subject: 'Időpontot javasoltak',
      heading: 'Időpontjavaslat érkezett',
      body: `${actorName ? actorName + ' a' : 'A másik fél a'} következő időpontot javasolta a(z) <strong>${artwork.title}</strong> átadására: <strong>${when}</strong>. Ha megfelel, erősítsd meg az alkalmazásban — az átvételi cím azonnal megjelenik, amint mindketten egyetértetek. Ha nem, javasolj másikat.`,
      cta: 'Időpont megtekintése',
    },
    en: {
      subject: 'A meeting time has been proposed',
      heading: 'A time has been proposed',
      body: `${actorName || 'The other person'} suggested <strong>${when}</strong> to hand over <strong>${artwork.title}</strong>. If that works, confirm it in the app — the pickup address appears as soon as you both agree. If it doesn't, propose another.`,
      cta: 'See the proposed time',
    },
    ro: {
      subject: 'S-a propus o oră de întâlnire',
      heading: 'A fost propusă o oră',
      body: `${actorName || 'Cealaltă persoană'} a propus <strong>${when}</strong> pentru predarea lucrării <strong>${artwork.title}</strong>. Dacă îți convine, confirmă în aplicație — adresa de ridicare apare imediat ce sunteți amândoi de acord. Dacă nu, propune altă oră.`,
      cta: 'Vezi ora propusă',
    },
  }

  const confirmed: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
    hu: {
      subject: 'A találkozó megerősítve',
      heading: 'A találkozó megerősítve',
      body: `${actorName ? actorName + ' megerősítette' : 'Megerősítették'} a(z) <strong>${artwork.title}</strong> átadásának időpontját: <strong>${when}</strong>. Az átvételi cím és a megerősítő kód mostantól látható az alkalmazásban.`,
      cta: 'Az átadás megnyitása',
    },
    en: {
      subject: 'Your meeting is confirmed',
      heading: 'Meeting confirmed',
      body: `${actorName || 'The other person'} confirmed <strong>${when}</strong> for <strong>${artwork.title}</strong>. The pickup address and your confirmation code are now visible in the app.`,
      cta: 'Open your handover',
    },
    ro: {
      subject: 'Întâlnirea este confirmată',
      heading: 'Întâlnire confirmată',
      body: `${actorName || 'Cealaltă persoană'} a confirmat <strong>${when}</strong> pentru <strong>${artwork.title}</strong>. Adresa de ridicare și codul de confirmare sunt acum vizibile în aplicație.`,
      cta: 'Deschide predarea',
    },
  }

  const c = (action === 'propose' ? proposed : confirmed)[other.lang]
  await sendEmail({
    to: other.email,
    subject: c.subject,
    heading: c.heading,
    body: c.body,
    ctaLabel: c.cta,
    ctaPath: `/handoff/${res.id}`,
    footer: FOOTER[other.lang],
  })
}

/**
 * The buyer has just paid. This is the moment they are most uncertain —
 * money has left their account and they have nothing in their hands yet.
 * Touchpoint 1 of the collector journey.
 */
export async function notifyBuyerOfReservation(reservationId: string) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, artworks(title, artist_name)')
    .eq('id', reservationId)
    .single()

  const artwork: any = (res as any)?.artworks
  if (!res || !artwork) return

  const buyer = await recipient(res.buyer_id)
  if (!buyer) return

  const artistName = artwork.artist_name || ''
  const title = artwork.title || ''

  const copy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
    hu: {
      subject: `${title} — a tiéd, lefoglalva`,
      heading: 'Megvan. A mű a tiédre vár.',
      body: `Megérkezett a foglalásod a(z) <strong>${title}</strong> című műre${artistName ? ` — ${artistName} alkotása` : ''}. Mostantól senki más nem foglalhatja le.<br><br>A következő lépés a találkozó: te vagy a művész javasol egy időpontot, a másik megerősíti, és csak ezután jelenik meg az átvételi cím. A hátralévő összeget személyesen, az átvételkor fizeted.<br><br>Nem kell most tenned semmit — szólunk, amint a művész jelentkezik.`,
      cta: 'A foglalásom megnyitása',
    },
    en: {
      subject: `${title} is reserved for you`,
      heading: 'It\'s yours. The work is waiting.',
      body: `Your reservation for <strong>${title}</strong>${artistName ? ` by ${artistName}` : ''} has gone through. No one else can reserve it now.<br><br>Next comes the meeting: either you or the artist proposes a time, the other confirms, and only then does the pickup address appear. You pay the remaining balance in person, when you collect the work.<br><br>There is nothing for you to do right now — we will let you know as soon as the artist is in touch.`,
      cta: 'Open your reservation',
    },
    ro: {
      subject: `${title} este rezervată pentru tine`,
      heading: 'Este a ta. Lucrarea te așteaptă.',
      body: `Rezervarea ta pentru <strong>${title}</strong>${artistName ? ` de ${artistName}` : ''} a fost înregistrată. Nimeni altcineva nu o mai poate rezerva.<br><br>Urmează întâlnirea: tu sau artistul propuneți o oră, celălalt confirmă, și abia atunci apare adresa de ridicare. Restul sumei îl plătești personal, la preluarea lucrării.<br><br>Nu trebuie să faci nimic acum — te anunțăm imediat ce artistul ia legătura.`,
      cta: 'Deschide rezervarea',
    },
  }

  const c = copy[buyer.lang]
  await sendEmail({
    to: buyer.email,
    subject: c.subject,
    heading: c.heading,
    body: c.body,
    ctaLabel: c.cta,
    ctaPath: `/handoff/${res.id}`,
    footer: FOOTER[buyer.lang],
  })
}

/**
 * A reservation reached the end of its window without a handover.
 * Both sides are told: the buyer that a refund is coming, the artist
 * that the work is back on sale.
 *
 * The refund itself is issued by hand in Stripe — the wording here
 * deliberately says a refund is on its way, never that it has arrived.
 */
export async function notifyReservationExpired(reservationId: string) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, artworks(title, artist_id)')
    .eq('id', reservationId)
    .single()

  const artwork: any = (res as any)?.artworks
  if (!res || !artwork?.artist_id) return

  const title = artwork.title || ''

  // --- the buyer ---
  const buyer = await recipient(res.buyer_id)
  if (buyer) {
    const copy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
      hu: {
        subject: `${title} — a foglalás lejárt`,
        heading: 'A foglalásod lejárt',
        body: `A(z) <strong>${title}</strong> foglalási ideje letelt anélkül, hogy az átadás megtörtént volna, így a mű újra elérhető.<br><br>A foglalási díjat visszatérítjük — a Contai Garancia része. Néhány munkanapon belül megjelenik a számládon.<br><br>Ha még mindig szeretnéd a művet, keresd meg a Contain — és ha valami félresiklott, írj nekünk, szeretnénk tudni róla.`,
        cta: 'Böngészés a Contain',
      },
      en: {
        subject: `Your reservation for ${title} has expired`,
        heading: 'Your reservation has expired',
        body: `The window for <strong>${title}</strong> passed without a handover, so the work is available again.<br><br>Your reservation fee is being refunded — that is part of the Contai Guarantee. It should reach your account within a few working days.<br><br>If you still want the work, look for it on Contai — and if something went wrong along the way, do write to us. We would like to know.`,
        cta: 'Browse Contai',
      },
      ro: {
        subject: `Rezervarea pentru ${title} a expirat`,
        heading: 'Rezervarea ta a expirat',
        body: `Intervalul pentru <strong>${title}</strong> a trecut fără predare, așa că lucrarea este din nou disponibilă.<br><br>Taxa de rezervare îți este returnată — face parte din Garanția Contai. Ar trebui să ajungă în contul tău în câteva zile lucrătoare.<br><br>Dacă îți dorești în continuare lucrarea, caut-o pe Contai — iar dacă ceva nu a mers bine, scrie-ne. Vrem să știm.`,
        cta: 'Explorează Contai',
      },
    }

    const c = copy[buyer.lang]
    await sendEmail({
      to: buyer.email,
      subject: c.subject,
      heading: c.heading,
      body: c.body,
      ctaLabel: c.cta,
      ctaPath: '/browse',
      footer: FOOTER[buyer.lang],
    })
  }

  // --- the artist ---
  const artist = await recipient(artwork.artist_id)
  if (artist) {
    const copy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
      hu: {
        subject: `${title} — újra elérhető`,
        heading: 'A műved újra elérhető',
        body: `A(z) <strong>${title}</strong> foglalása lejárt anélkül, hogy az átadás megtörtént volna, ezért a mű visszakerült a Contaira, és újra lefoglalható.<br><br>Nem kell tenned semmit. Ha az átadás valójában megtörtént, vagy valami közbejött, szólj nekünk — rendbe tesszük.`,
        cta: 'A műveim',
      },
      en: {
        subject: `${title} is available again`,
        heading: 'Your work is back on Contai',
        body: `The reservation on <strong>${title}</strong> expired without a handover, so the work has returned to Contai and can be reserved again.<br><br>There is nothing you need to do. If the handover actually did happen, or something got in the way, tell us and we will put it right.`,
        cta: 'My works',
      },
      ro: {
        subject: `${title} este din nou disponibilă`,
        heading: 'Lucrarea ta este din nou pe Contai',
        body: `Rezervarea pentru <strong>${title}</strong> a expirat fără predare, așa că lucrarea a revenit pe Contai și poate fi rezervată din nou.<br><br>Nu trebuie să faci nimic. Dacă predarea a avut totuși loc sau a intervenit ceva, spune-ne și rezolvăm.`,
        cta: 'Lucrările mele',
      },
    }

    const c = copy[artist.lang]
    await sendEmail({
      to: artist.email,
      subject: c.subject,
      heading: c.heading,
      body: c.body,
      ctaLabel: c.cta,
      ctaPath: '/dashboard',
      footer: FOOTER[artist.lang],
    })
  }
}