'use client'
import { useCurrency } from '@/currency/CurrencyProvider'

export default function Price({ huf, style }: { huf: number | null | undefined; style?: React.CSSProperties }) {
  const { format } = useCurrency()
  return <span style={style}>{format(huf)}</span>
}