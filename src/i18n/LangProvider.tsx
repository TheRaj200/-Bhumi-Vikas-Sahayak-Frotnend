import { useEffect, useState, type ReactNode } from 'react'
import type { Lang } from '../api/types'
import { LangContext } from './LangContext'

interface LangProviderProps {
  children: ReactNode
}

export function LangProvider({ children }: LangProviderProps) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}
