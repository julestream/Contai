import ComingSoon from '@/components/ui/ComingSoon'
import { cookies } from 'next/headers'
import { getDict, DEFAULT_LANG, Lang } from '@/i18n/dictionaries'

export const dynamic = 'force-dynamic'

export default function ArtistsFeaturePage() {
  const lang = (cookies().get('contai_lang')?.value as Lang) || DEFAULT_LANG
  const cs = (getDict(lang) as any).comingSoon
  return <ComingSoon title={cs.artistsTitle} blurb={cs.artistsBlurb} />
}