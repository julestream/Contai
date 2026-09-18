import { createAdminClient } from '@/lib/supabase/admin'
import {
  notifyMeetingNudge,
  notifyHandoverToday,
  notifyWelcomeHome,
  notifyThirtyDayCheckIn,
} from '@/lib/notify'
import { NextResponse } from 'next/server'

// The collector journey, touchpoints 2 to 5. Touchpoint 1 (just paid) is
// sent immediately by the payment flow, not from here.
//
// Vercel's hobby plan allows one cron run per day, so all four windows are
// checked in a single pass. Each touchpoint writes its own timestamp when
// sent, and every query skips rows already marked — otherwise the same
// person would be nudged again every morning.

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Scheduling is still open in these states.
const SCHEDULING = ['reservation_paid', 'scheduling_in_progress']

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString()
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const counts = { nudged: 0, handoverToday: 0, welcomeHome: 0, checkIn: 0, failed: 0 }

  // ── Touchpoint 2: a day has passed with no time agreed ──────────
  {
    const { data, error } = await admin
      .from('reservations')
      .select('id')
      .in('status', SCHEDULING)
      .is('meeting_confirmed_at', null)
      .is('nudge_sent_at', null)
      .lt('created_at', hoursAgo(24))

    if (error) {
      console.error('[cron/journey] nudge lookup failed:', error.message)
    } else {
      for (const row of data || []) {
        try {
          const sent = await notifyMeetingNudge(row.id)
          // Mark it either way. A reservation whose recipients have no email
          // would otherwise be retried every single morning.
          await admin
            .from('reservations')
            .update({ nudge_sent_at: new Date().toISOString() })
            .eq('id', row.id)
          if (sent) counts.nudged++
        } catch (e: any) {
          console.error(`[cron/journey] nudge ${row.id} failed:`, e?.message)
          counts.failed++
        }
      }
    }
  }

  // ── Touchpoint 3: the handover is today ─────────────────────────
  // "Today" means between this run and the next one, so anything in the
  // next 24 hours. A meeting earlier this morning is skipped rather than
  // reminded about after the fact.
  {
    const now = new Date().toISOString()
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await admin
      .from('reservations')
      .select('id')
      .not('meeting_confirmed_at', 'is', null)
      .is('handover_reminder_sent_at', null)
      .gte('meeting_at', now)
      .lt('meeting_at', in24h)

    if (error) {
      console.error('[cron/journey] handover lookup failed:', error.message)
    } else {
      for (const row of data || []) {
        try {
          const sent = await notifyHandoverToday(row.id)
          await admin
            .from('reservations')
            .update({ handover_reminder_sent_at: new Date().toISOString() })
            .eq('id', row.id)
          if (sent) counts.handoverToday++
        } catch (e: any) {
          console.error(`[cron/journey] handover ${row.id} failed:`, e?.message)
          counts.failed++
        }
      }
    }
  }

  // ── Touchpoint 4: welcome home, the day after collection ────────
  {
    const { data, error } = await admin
      .from('reservations')
      .select('id')
      .eq('status', 'handoff_completed')
      .is('welcome_home_sent_at', null)
      .not('handoff_completed_at', 'is', null)
      .lt('handoff_completed_at', hoursAgo(12))

    if (error) {
      console.error('[cron/journey] welcome lookup failed:', error.message)
    } else {
      for (const row of data || []) {
        try {
          const sent = await notifyWelcomeHome(row.id)
          await admin
            .from('reservations')
            .update({ welcome_home_sent_at: new Date().toISOString() })
            .eq('id', row.id)
          if (sent) counts.welcomeHome++
        } catch (e: any) {
          console.error(`[cron/journey] welcome ${row.id} failed:`, e?.message)
          counts.failed++
        }
      }
    }
  }

  // ── Touchpoint 5: thirty days on ────────────────────────────────
  // Only handovers completed after this feature existed. Sending "how is
  // it living with you?" about a piece collected months ago, on the day
  // the feature launches, would read as marketing rather than interest.
  {
    const FEATURE_LIVE_FROM = '2026-09-18T00:00:00Z'

    const { data, error } = await admin
      .from('reservations')
      .select('id')
      .eq('status', 'handoff_completed')
      .is('checkin_30day_sent_at', null)
      .not('handoff_completed_at', 'is', null)
      .gte('handoff_completed_at', FEATURE_LIVE_FROM)
      .lt('handoff_completed_at', daysAgo(30))

    if (error) {
      console.error('[cron/journey] check-in lookup failed:', error.message)
    } else {
      for (const row of data || []) {
        try {
          const sent = await notifyThirtyDayCheckIn(row.id)
          await admin
            .from('reservations')
            .update({ checkin_30day_sent_at: new Date().toISOString() })
            .eq('id', row.id)
          if (sent) counts.checkIn++
        } catch (e: any) {
          console.error(`[cron/journey] check-in ${row.id} failed:`, e?.message)
          counts.failed++
        }
      }
    }
  }

  console.log('[cron/journey]', JSON.stringify(counts))
  return NextResponse.json({ ok: true, ...counts })
}