import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { IntlProvider } from 'use-intl'
import { useConfig } from '@/hooks/use-config'
import en from '../../messages/en.json'
import hu from '../../messages/hu.json'

const MESSAGES = { en, hu }
type Locale = keyof typeof MESSAGES

const STORAGE_KEY = 'knyh-language'

const isLocale = (value: unknown): value is Locale => value === 'en' || value === 'hu'

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    /* storage unavailable */
  }
  return 'en'
}

/**
 * The site language is part of the site config. The last known language is cached
 * in localStorage so the first paint already uses it.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const { data: config } = useConfig()
  // Only used until the config has loaded
  const [cached] = useState<Locale>(readStoredLocale)
  const locale = isLocale(config?.language) ? config.language : cached

  useEffect(() => {
    if (!isLocale(config?.language)) return
    try {
      localStorage.setItem(STORAGE_KEY, config.language)
    } catch {
      /* storage unavailable */
    }
  }, [config?.language])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const timeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    } catch {
      return 'UTC'
    }
  }, [])

  return (
    <IntlProvider locale={locale} messages={MESSAGES[locale]} timeZone={timeZone}>
      {children}
    </IntlProvider>
  )
}
