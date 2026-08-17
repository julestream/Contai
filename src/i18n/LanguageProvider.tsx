'use client'

import { createContext, useContext, useState } from 'react'
import { Lang, DEFAULT_LANG, getDict } from './dictionaries'
import { createClient } from '@/lib/supabase/client'

type LangContext = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (path: string) => any
}

const Ctx = createContext<LangContext | null>(null)

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode
  initialLang?: Lang
}) {
  const [lang, setLangState] = useState<Lang>(initialLang || DEFAULT_LANG)

  function setLang(l: Lang) {
    setLangState(l)
    document.cookie = `contai_lang=${l}; path=/; max-age=31536000`

    // Remember it on the account too, so emails arrive in the right language.
    // Fire and forget — a signed-out visitor simply skips this.
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          supabase.from('profiles').update({ preferred_lang: l }).eq('id', data.user.id).then(() => {})
        }
      })
    } catch {}
  }

  function t(path: string): any {
    const dict = getDict(lang)
    const parts = path.split('.')
    let cur: any = dict
    for (const part of parts) {
      if (cur && typeof cur === 'object' && part in cur) {
        cur = cur[part]
      } else {
        return path
      }
    }
    return cur
  }

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useLang(): LangContext {
  const ctx = useContext(Ctx)
  if (!ctx) {
    // Fallback if used outside provider — returns keys instead of crashing
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      t: (path: string) => path,
    }
  }
  return ctx
}