'use client'
import { useCurrency, Currency } from '@/currency/CurrencyProvider'

export default function Price({
  huf,
  amount,
  currency,
  style,
}: {
  huf?: number | null
  amount?: number | null
  currency?: Currency | string | null
  style?: React.CSSProperties
}) {
  const { format, formatFrom } = useCurrency()

  if (amount != null && currency) {
    return <span style={style}>{formatFrom(amount, currency as Currency)}</span>
  }
  return <span style={style}>{format(huf)}</span>
}