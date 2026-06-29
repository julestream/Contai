'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Currency = 'HUF' | 'EUR' | 'RON'

const FALLBACK: Record<Currency, number> = { HUF: 1, EUR: 0.0025, RON: 0.0125 }
const CACHE_KEY = 'contai_rates'
const CACHE_TTL = 12 * 60 * 60 * 1000 // 12 hours

type Ctx = {
  currency: Currency
  setCurrency: (c: Currency) => void
  format: (huf: number | null | undefined) => string
}

const CurrencyContext = createContext<Ctx | null>(null)

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('HUF')
  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK)

  useEffect(() => {
    const saved = readCookie('contai_currency') as Currency | null
    if (saved === 'HUF' || saved === 'EUR' || saved === 'RON') setCurrencyState(saved)
  }, [])

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

  function format(huf: number | null | undefined): string {
    if (huf == null || isNaN(huf as number)) return ''
    if (currency === 'HUF') return `${Math.round(huf).toLocaleString()} Ft`
    const converted = huf * (rates[currency] || FALLBACK[currency])
    if (currency === 'EUR') return `≈ €${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    return `≈ ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })} lei`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): Ctx {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    return {
      currency: 'HUF',
      setCurrency: () => {},
      format: (huf) => (huf == null ? '' : `${Math.round(huf).toLocaleString()} Ft`),
    }
  }
  return ctx
}