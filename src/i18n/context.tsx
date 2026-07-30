'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { translations, Locale, TranslationKeys } from './translations'

interface I18nContextType {
  locale: Locale
  t: TranslationKeys
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    document.documentElement.lang = newLocale
  }

  const value: I18nContextType = {
    locale,
    t: translations[locale],
    setLocale,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
