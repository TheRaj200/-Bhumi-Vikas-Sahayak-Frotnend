import { createContext, useContext } from 'react'
import type { Lang } from '../api/types'
import { STRINGS, type StringKey } from './strings'

export interface LangContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const LangContext = createContext<LangContextValue>({ lang: 'en', setLang: () => {} })

/** Current UI language + translator. `pick(en, hi)` chooses between API-provided bilingual fields. */
export function useLang() {
  const { lang, setLang } = useContext(LangContext)
  const t = (key: StringKey) => STRINGS[key][lang]
  const pick = (en: string, hi: string) => (lang === 'hi' ? hi || en : en)
  return { lang, setLang, t, pick }
}
