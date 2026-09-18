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

/** Just the clock time — used where the date is already obvious ("today"). */
function formatTimeOnly(iso: string, lang: EmailLang) {
  const locale = lang === 'hu' ? 'hu-HU' : lang === 'ro' ? 'ro-RO' : 'en-GB'
  try {
    return new Date(iso).toLocaleString(locale, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

/**
 * A quiet copy to whoever runs Contai. Never translated, never pretty —
 * this is an operations alert, not customer copy.
 *
 * Silently does nothing if CONTAI_ADMIN_EMAIL is unset, so removing the
 * environment variable is how you turn these off.
 */
async function notifyAdmin(subject: string, lines: string[], ctaPath: string) {
  const to = process.env.CONTAI_ADMIN_EMAIL
  if (!to) return

  await sendEmail({
    to,
    subject: `[Contai] ${subject}`,
    heading: subject,
    body: lines.join('<br>'),
    ctaLabel: 'Open in Contai',
    ctaPath,
    footer: 'Internal notification. Remove CONTAI_ADMIN_EMAIL to stop these.',
  })
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
 *
 * Also sends the admin copy, since a payment is the event most likely
 * to need a human watching in the early days.
 */
export async function notifyBuyerOfReservation(reservationId: string) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, agreed_price, reservation_fee, currency, artworks(title, artist_name, artist_id, city)')
    .eq('id', reservationId)
    .single()

  const artwork: any = (res as any)?.artworks
  if (!res || !artwork) return

  const buyer = await recipient(res.buyer_id)
  const artistName = artwork.artist_name || ''
  const title = artwork.title || ''

  if (buyer) {
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

  // --- admin copy ---
  const artist = artwork.artist_id ? await recipient(artwork.artist_id) : null
  const cur = res.currency || ''
  const price = res.agreed_price != null ? `${res.agreed_price} ${cur}` : 'unknown'
  const fee = res.reservation_fee != null ? `${res.reservation_fee} ${cur}` : 'unknown'

  await notifyAdmin(
    `Paid: ${title}`,
    [
      `<strong>${title}</strong>${artistName ? ` — ${artistName}` : ''}`,
      `Price: ${price} · Fee paid: ${fee}`,
      `Artist: ${artist?.name || '—'} (${artist?.email || 'no email'})`,
      `Buyer: ${buyer?.name || '—'} (${buyer?.email || 'no email'})`,
      artwork.city ? `Pickup city: ${artwork.city}` : '',
      '',
      'They now have 48 hours to arrange and complete the handover.',
    ].filter(Boolean),
    `/handoff/${res.id}`
  )
}

/**
 * A reservation reached the end of its window without a handover.
 * Both sides are told: the buyer that a refund is coming, the artist
 * that the work is back on sale. An admin copy goes out too, because
 * the refund itself still has to be issued by hand in Stripe.
 */
export async function notifyReservationExpired(reservationId: string) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, reservation_fee, currency, stripe_payment_intent_id, artworks(title, artist_id)')
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

  // --- admin copy: this one needs action, not just awareness ---
  const cur = res.currency || ''
  const fee = res.reservation_fee != null ? `${res.reservation_fee} ${cur}` : 'unknown'

  await notifyAdmin(
    `EXPIRED — refund needed: ${title}`,
    [
      `<strong>${title}</strong> expired without a handover.`,
      `Artist: ${artist?.name || '—'} (${artist?.email || 'no email'})`,
      `Buyer: ${buyer?.name || '—'} (${buyer?.email || 'no email'})`,
      '',
      `<strong>Refund ${fee} in Stripe.</strong>`,
      res.stripe_payment_intent_id
        ? `Payment intent: ${res.stripe_payment_intent_id}`
        : 'No payment intent on file — check Stripe manually.',
      '',
      'The buyer has been told a refund is on its way. Mark the reservation as refunded once it is done.',
    ].filter(Boolean),
    `/admin/handovers`
  )
}

/**
 * Touchpoint 2 — a day has passed and no time has been agreed.
 *
 * The nudge goes to whichever side has not moved; the other is told they
 * have been reminded, so nobody is left wondering whether their message
 * disappeared into nothing. Returns true if anything was sent.
 */
export async function notifyMeetingNudge(reservationId: string) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, meeting_at, meeting_proposed_by, artworks(title, artist_id)')
    .eq('id', reservationId)
    .single()

  const artwork: any = (res as any)?.artworks
  if (!res || !artwork?.artist_id) return false

  const title = artwork.title || ''

  // Nobody has proposed: both sides are waiting on each other, so both
  // get nudged. Otherwise the person who has not answered gets the nudge.
  const nobodyProposed = !res.meeting_at
  const waitingOn = nobodyProposed
    ? null
    : (res.meeting_proposed_by === res.buyer_id ? artwork.artist_id : res.buyer_id)

  const nudgeCopy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
    hu: {
      subject: `${title} — egyeztessetek időpontot`,
      heading: 'Még nincs időpont',
      body: `Egy napja megvan a foglalás a(z) <strong>${title}</strong> műre, de még nem született időpont a találkozóra.<br><br>A foglalás 48 órán át él, úgyhogy érdemes most javasolni egyet — egy perc az egész, és a másik fél már csak megerősíti.`,
      cta: 'Időpont javaslása',
    },
    en: {
      subject: `${title} — you still need a time`,
      heading: 'No time agreed yet',
      body: `The reservation for <strong>${title}</strong> is a day old and no meeting time has been set yet.<br><br>Reservations last 48 hours, so it is worth proposing one now — it takes a moment, and the other person only has to confirm.`,
      cta: 'Propose a time',
    },
    ro: {
      subject: `${title} — mai lipsește o oră`,
      heading: 'Încă nu e stabilită o oră',
      body: `Rezervarea pentru <strong>${title}</strong> are o zi și încă nu s-a stabilit o oră de întâlnire.<br><br>Rezervările durează 48 de ore, așa că merită să propui una acum — durează un moment, iar cealaltă persoană doar confirmă.`,
      cta: 'Propune o oră',
    },
  }

  const informedCopy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
    hu: {
      subject: `${title} — emlékeztettük a másik felet`,
      heading: 'Szóltunk nekik',
      body: `Javasoltál egy időpontot a(z) <strong>${title}</strong> átadására, de még nem érkezett rá válasz.<br><br>Most emlékeztettük a másik felet. Nem kell tenned semmit — szólunk, amint megerősítik.`,
      cta: 'A foglalás megnyitása',
    },
    en: {
      subject: `${title} — we have reminded them`,
      heading: 'We have nudged them',
      body: `You proposed a time for <strong>${title}</strong> and it has not been answered yet.<br><br>We have just reminded the other person. There is nothing for you to do — we will let you know as soon as they confirm.`,
      cta: 'Open your reservation',
    },
    ro: {
      subject: `${title} — i-am reamintit`,
      heading: 'Le-am reamintit',
      body: `Ai propus o oră pentru <strong>${title}</strong> și încă nu ai primit răspuns.<br><br>Tocmai i-am reamintit celeilalte persoane. Nu trebuie să faci nimic — te anunțăm imediat ce confirmă.`,
      cta: 'Deschide rezervarea',
    },
  }

  let sent = false
  const reservationId_ = res.id

  async function send(profileId: string, copy: typeof nudgeCopy) {
    const person = await recipient(profileId)
    if (!person) return
    const c = copy[person.lang]
    await sendEmail({
      to: person.email,
      subject: c.subject,
      heading: c.heading,
      body: c.body,
      ctaLabel: c.cta,
      ctaPath: `/handoff/${reservationId_}`,
      footer: FOOTER[person.lang],
    })
    sent = true
  }

  if (nobodyProposed) {
    await send(res.buyer_id, nudgeCopy)
    await send(artwork.artist_id, nudgeCopy)
  } else if (waitingOn && res.meeting_proposed_by) {
    await send(waitingOn, nudgeCopy)
    await send(res.meeting_proposed_by, informedCopy)
  }

  return sent
}

/**
 * Touchpoint 3 — the morning of the handover.
 *
 * The buyer gets the address and the code; the artist gets the time and
 * a reminder that someone is coming. Deliberately short: this is read
 * on a phone, probably while getting ready to leave.
 */
export async function notifyHandoverToday(reservationId: string) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, meeting_at, handoff_code, artworks(id, title, artist_name, artist_id, pickup_area)')
    .eq('id', reservationId)
    .single()

  const artwork: any = (res as any)?.artworks
  if (!res || !artwork?.artist_id || !res.meeting_at) return false

  const title = artwork.title || ''

  const { data: addressRow } = await admin
    .from('artwork_addresses')
    .select('pickup_address')
    .eq('artwork_id', artwork.id)
    .single()

  const address = addressRow?.pickup_address || artwork.pickup_area || ''
  const code = res.handoff_code || ''

  // --- the buyer: where, when, and the code ---
  const buyer = await recipient(res.buyer_id)
  if (buyer) {
    const time = formatTimeOnly(res.meeting_at, buyer.lang)
    const copy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
      hu: {
        subject: `Ma átveheted: ${title}`,
        heading: 'Ma van a nagy nap',
        body: `Ma <strong>${time}</strong> órakor veszed át a(z) <strong>${title}</strong> című művet${artwork.artist_name ? ` — ${artwork.artist_name} alkotását` : ''}.<br><br>Cím: <strong>${address}</strong>${code ? `<br>Átadási kód: <strong>${code}</strong>` : ''}<br><br>A hátralévő összeget a helyszínen fizeted. Ha valami közbejön, szólj a művésznek időben.`,
        cta: 'Az átadás megnyitása',
      },
      en: {
        subject: `Today: collecting ${title}`,
        heading: 'Today is the day',
        body: `You are collecting <strong>${title}</strong>${artwork.artist_name ? ` by ${artwork.artist_name}` : ''} at <strong>${time}</strong> today.<br><br>Address: <strong>${address}</strong>${code ? `<br>Handover code: <strong>${code}</strong>` : ''}<br><br>You pay the remaining balance there. If something comes up, let the artist know in good time.`,
        cta: 'Open your handover',
      },
      ro: {
        subject: `Azi: ridici ${title}`,
        heading: 'Azi este ziua',
        body: `Astăzi la <strong>${time}</strong> ridici lucrarea <strong>${title}</strong>${artwork.artist_name ? ` de ${artwork.artist_name}` : ''}.<br><br>Adresa: <strong>${address}</strong>${code ? `<br>Cod de predare: <strong>${code}</strong>` : ''}<br><br>Restul sumei se plătește la fața locului. Dacă apare ceva, anunță artistul din timp.`,
        cta: 'Deschide predarea',
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

  // --- the artist: someone is coming ---
  const artist = await recipient(artwork.artist_id)
  if (artist) {
    const time = formatTimeOnly(res.meeting_at, artist.lang)
    const buyerName = buyer?.name || ''
    const copy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
      hu: {
        subject: `Ma adod át: ${title}`,
        heading: 'Ma van az átadás',
        body: `Ma <strong>${time}</strong> órakor érkezik ${buyerName || 'a vásárló'} a(z) <strong>${title}</strong> című műért.${code ? `<br><br>Átadási kód: <strong>${code}</strong> — ezt mondja majd a vásárló.` : ''}<br><br>A hátralévő összeget a helyszínen kapod meg.`,
        cta: 'Az átadás megnyitása',
      },
      en: {
        subject: `Today: handing over ${title}`,
        heading: 'Your handover is today',
        body: `${buyerName || 'The collector'} is coming for <strong>${title}</strong> at <strong>${time}</strong> today.${code ? `<br><br>Handover code: <strong>${code}</strong> — they will tell you this.` : ''}<br><br>You receive the remaining balance in person.`,
        cta: 'Open your handover',
      },
      ro: {
        subject: `Azi: predai ${title}`,
        heading: 'Predarea este astăzi',
        body: `${buyerName || 'Colecționarul'} vine pentru <strong>${title}</strong> astăzi la <strong>${time}</strong>.${code ? `<br><br>Cod de predare: <strong>${code}</strong> — ți-l va spune.` : ''}<br><br>Restul sumei îl primești personal.`,
        cta: 'Deschide predarea',
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

  return true
}

/**
 * Touchpoint 4 — the work is home.
 *
 * Sent the day after a completed handover, when the piece is on a wall
 * rather than in a car. No asks, no links to buy more: the point is that
 * the moment is marked.
 */
export async function notifyWelcomeHome(reservationId: string) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, artworks(title, artist_name, year)')
    .eq('id', reservationId)
    .single()

  const artwork: any = (res as any)?.artworks
  if (!res || !artwork) return false

  const buyer = await recipient(res.buyer_id)
  if (!buyer) return false

  const title = artwork.title || ''
  const artistName = artwork.artist_name || ''

  const copy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
    hu: {
      subject: `${title} hazaért`,
      heading: 'Hazaért',
      body: `A(z) <strong>${title}</strong>${artistName ? ` — ${artistName} munkája` : ''} mostantól nálad van.<br><br>Valaki megfestette, te pedig elmentél érte és személyesen vetted át a kezéből. Nem sok mű kerül így falra.<br><br>Reméljük, sokáig öröm lesz ránézni.`,
      cta: 'A vásárlásaim',
    },
    en: {
      subject: `${title} is home`,
      heading: 'It\'s home',
      body: `<strong>${title}</strong>${artistName ? ` by ${artistName}` : ''} is yours now.<br><br>Someone made it, and you went and collected it from their hands. Not many works arrive on a wall that way.<br><br>We hope it keeps being good to look at.`,
      cta: 'My orders',
    },
    ro: {
      subject: `${title} a ajuns acasă`,
      heading: 'A ajuns acasă',
      body: `<strong>${title}</strong>${artistName ? ` de ${artistName}` : ''} este acum a ta.<br><br>Cineva a făcut-o, iar tu ai mers și ai luat-o din mâinile lui. Nu multe lucrări ajung pe un perete așa.<br><br>Sperăm să îți facă bine de fiecare dată când o privești.`,
      cta: 'Comenzile mele',
    },
  }

  const c = copy[buyer.lang]
  await sendEmail({
    to: buyer.email,
    subject: c.subject,
    heading: c.heading,
    body: c.body,
    ctaLabel: c.cta,
    ctaPath: '/me/orders',
    footer: FOOTER[buyer.lang],
  })

  return true
}

/**
 * Touchpoint 5 — thirty days on.
 *
 * Written as a real question, not a survey. If it reads as marketing it
 * has failed, so there is no offer in it and nothing to click except a
 * reply.
 */
export async function notifyThirtyDayCheckIn(reservationId: string) {
  const admin = createAdminClient()

  const { data: res } = await admin
    .from('reservations')
    .select('id, buyer_id, artworks(title, artist_name)')
    .eq('id', reservationId)
    .single()

  const artwork: any = (res as any)?.artworks
  if (!res || !artwork) return false

  const buyer = await recipient(res.buyer_id)
  if (!buyer) return false

  const title = artwork.title || ''
  const artistName = artwork.artist_name || ''
  const firstName = (buyer.name || '').split(' ')[0]

  const copy: Record<EmailLang, { subject: string; heading: string; body: string; cta: string }> = {
    hu: {
      subject: `Hogy van a(z) ${title}?`,
      heading: 'Egy hónap telt el',
      body: `${firstName ? firstName + ', e' : 'E'}gy hónapja vitted haza a(z) <strong>${title}</strong> című művet${artistName ? ` — ${artistName} alkotását` : ''}.<br><br>Kíváncsiak vagyunk: hová került? Olyan lett, amilyennek gondoltad? Néha egy mű egészen mást csinál a falon, mint amit a képernyőn ígért.<br><br>Ha van kedved, válaszolj erre a levélre. Elolvassuk — és ha a művésznek is átadhatjuk, annak külön örülne.`,
      cta: 'A vásárlásaim',
    },
    en: {
      subject: `How is ${title}?`,
      heading: 'A month on',
      body: `${firstName ? firstName + ', i' : 'I'}t has been a month since you brought <strong>${title}</strong>${artistName ? ` by ${artistName}` : ''} home.<br><br>We are curious: where did it end up? Is it what you thought it would be? A work sometimes does something quite different on a wall than it promised on a screen.<br><br>If you feel like it, just reply to this email. We read them — and if you are happy for us to pass it on to the artist, they would be glad of it.`,
      cta: 'My orders',
    },
    ro: {
      subject: `Ce mai face ${title}?`,
      heading: 'A trecut o lună',
      body: `${firstName ? firstName + ', a' : 'A'} trecut o lună de când ai dus acasă <strong>${title}</strong>${artistName ? ` de ${artistName}` : ''}.<br><br>Suntem curioși: unde a ajuns? Este așa cum te așteptai? O lucrare face uneori cu totul altceva pe perete decât promitea pe ecran.<br><br>Dacă ai chef, răspunde pur și simplu la acest email. Le citim — iar dacă ești de acord să îi transmitem artistului, s-ar bucura.`,
      cta: 'Comenzile mele',
    },
  }

  const c = copy[buyer.lang]
  await sendEmail({
    to: buyer.email,
    subject: c.subject,
    heading: c.heading,
    body: c.body,
    ctaLabel: c.cta,
    ctaPath: '/me/orders',
    footer: FOOTER[buyer.lang],
  })

  return true
}