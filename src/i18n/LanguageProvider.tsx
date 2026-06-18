'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Lang, DEFAULT_LANG, getDict, LANGUAGES } from './dictionaries'

type LangContext = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (path: string) => any
}

const Ctx = createContext<LangContext | null>(null)

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG)

  useEffect(() => {
    const saved = readCookie('contai_lang') as Lang | null
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      setLangState(saved)
    }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    document.cookie = `contai_lang=${l}; path=/; max-age=31536000`
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