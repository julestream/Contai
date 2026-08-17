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