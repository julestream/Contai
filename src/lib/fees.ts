export type FeeCurrency = 'HUF' | 'EUR' | 'RON'

// Minimum reservation fee per currency. Roughly equivalent values,
// all comfortably above Stripe's minimum charge amounts.
export const MIN_FEE: Record<FeeCurrency, number> = { HUF: 500, EUR: 2, RON: 10 }

export const FEE_RATE = 0.08

export function normaliseCurrency(currency: string | null | undefined): FeeCurrency {
  if (currency === 'EUR' || currency === 'RON' || currency === 'HUF') return currency
  return 'HUF'
}

/** The 8% reservation fee, floored at the per-currency minimum. */
export function reservationFee(amount: number | null | undefined, currency: string | null | undefined): number {
  if (!amount || amount <= 0) return 0
  const cur = normaliseCurrency(currency)
  return Math.max(MIN_FEE[cur], Math.round(amount * FEE_RATE))
}