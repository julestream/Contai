'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Currency = 'HUF' | 'EUR' | 'RON'

// Rates are expressed as "1 HUF = x", so HUF is always 1.
const FALLBACK: Record<Currency, number> = { HUF: 1, EUR: 0.0025, RON: 0.0125 }
const CACHE_KEY = 'contai_rates'
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

type Ctx = {
  currency: Currency
  setCurrency: (c: Currency) => void
  /** Format a HUF amount into the viewer's currency. */
  format: (huf: number | null | undefined) => string
  /** Format an amount held in any currency into the viewer's currency. */
  formatFrom: (amount: number | null | undefined, from: Currency) => string
  /** Format an amount in its own currency, with no conversion. */
  formatIn: (amount: number | null | undefined, cur: Currency) => string
  /** Convert any amount into HUF — used for the approximate filter column. */
  toHuf: (amount: number | null | undefined, from: Currency) => number
}

const CurrencyContext = createContext<Ctx | null>(null)

function normalise(c: string | null | undefined): Currency {
  if (c === 'EUR' || c === 'RON' || c === 'HUF') return c
  return 'HUF'
}

function render(amount: number, cur: Currency, approx: boolean): string {
  const n = amount.toLocaleString(undefined, { maximumFractionDigits: 0 })
  const prefix = approx ? '≈ ' : ''
  if (cur === 'EUR') return `${prefix}€${n}`
  if (cur === 'RON') return `${prefix}${n} lei`
  return `${prefix}${n} Ft`
}

export function CurrencyProvider({
  children,
  initialCurrency,
}: {
  children: React.ReactNode
  initialCurrency?: Currency
}) {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency || 'HUF')
  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const cached = JSON.parse(raw)
        if (cached && Date.now() - cached.at < CACHE_TTL && cached.rates) {
          setRates({ HUF: 1, EUR: cached.rates.EUR, RON: cached.rates.RON })
          return
        }
      }
    } catch {}
    fetch('https://api.frankfurter.app/latest?from=HUF&to=EUR,RON')
      .then(r => r.json())
      .then(d => {
        if (d && d.rates && d.rates.EUR && d.rates.RON) {
          setRates({ HUF: 1, EUR: d.rates.EUR, RON: d.rates.RON })
          try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rates: d.rates })) } catch {}
        }
      })
      .catch(() => { /* keep fallback rates */ })
  }, [])

  function setCurrency(c: Currency) {
    setCurrencyState(c)
    document.cookie = `contai_currency=${c}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  function rate(c: Currency): number {
    return rates[c] || FALLBACK[c]
  }

  function toHuf(amount: number | null | undefined, from: Currency): number {
    if (amount == null || isNaN(amount as number)) return 0
    return Math.round(amount / rate(normalise(from)))
  }

  function formatIn(amount: number | null | undefined, cur: Currency): string {
    if (amount == null || isNaN(amount as number)) return ''
    return render(Math.round(amount), normalise(cur), false)
  }

  function formatFrom(amount: number | null | undefined, from: Currency): string {
    if (amount == null || isNaN(amount as number)) return ''
    const src = normalise(from)
    // Same currency as the viewer's — exact, no approximation marker.
    if (src === currency) return render(Math.round(amount), currency, false)
    const inHuf = amount / rate(src)
    return render(inHuf * rate(currency), currency, true)
  }

  function format(huf: number | null | undefined): string {
    return formatFrom(huf, 'HUF')
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, formatFrom, formatIn, toHuf }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): Ctx {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    const plain = (n: number | null | undefined) => (n == null ? '' : `${Math.round(n).toLocaleString()} Ft`)
    return {
      currency: 'HUF',
      setCurrency: () => {},
      format: plain,
      formatFrom: plain,
      formatIn: plain,
      toHuf: (amount) => (amount == null ? 0 : Math.round(amount)),
    }
  }
  return ctx
}