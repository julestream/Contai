import { Resend } from 'resend'

const FROM = 'Contai <hello@contai.market>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.contai.market'

export type EmailLang = 'hu' | 'en' | 'ro'

export function normLang(l: string | null | undefined): EmailLang {
  if (l === 'hu' || l === 'en' || l === 'ro') return l
  return 'hu'
}

// Built on demand rather than at module load — the constructor throws when
// the key is absent, which would break the build on any machine without it.
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

function shell({
  heading,
  body,
  ctaLabel,
  ctaPath,
  footer,
}: {
  heading: string
  body: string
  ctaLabel: string
  ctaPath: string
  footer: string
}) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:14px;padding:36px 32px;">
            <tr><td>
              <p style="margin:0 0 28px;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#a49d92;">Contai</p>
              <h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:#1a1a1a;font-weight:500;">${heading}</h1>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#444;font-family:Helvetica,Arial,sans-serif;">${body}</p>
              <a href="${APP_URL}${ctaPath}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:999px;font-size:15px;font-family:Helvetica,Arial,sans-serif;">${ctaLabel}</a>
              <p style="margin:32px 0 0;font-size:12.5px;line-height:1.6;color:#a49d92;font-family:Helvetica,Arial,sans-serif;">${footer}</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export async function sendEmail(opts: {
  to: string
  subject: string
  heading: string
  body: string
  ctaLabel: string
  ctaPath: string
  footer: string
}) {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', opts.to)
    return
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: shell(opts),
    })
  } catch (err: any) {
    // Never let a failed email break the transaction that triggered it.
    console.error('[email] send failed:', err?.message || err)
  }
}