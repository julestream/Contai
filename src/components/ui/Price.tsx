'use client'
import { useCurrency, Currency } from '@/currency/CurrencyProvider'

export default function Price({
  huf,
  amount,
  currency,
  native = false,
  style,
}: {
  huf?: number | null
  amount?: number | null
  currency?: Currency | string | null
  /** Show the amount in its own currency, without converting to the viewer's. */
  native?: boolean
  style?: React.CSSProperties
}) {
  const { format, formatFrom, formatIn } = useCurrency()

  if (amount != null && currency) {
    const text = native
      ? formatIn(amount, currency as Currency)
      : formatFrom(amount, currency as Currency)
    return <span style={style}>{text}</span>
  }
  return <span style={style}>{format(huf)}</span>
}