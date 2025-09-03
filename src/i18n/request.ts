import { getRequestConfig } from 'next-intl/server'
import { getUserConfig } from '@/lib/database'

export default getRequestConfig(async () => {
  let locale = 'en' // Default fallback

  try {
    const userConfig = await getUserConfig()
    locale = userConfig.language || 'en'
  } catch (error) {
    console.warn('Could not read language from database, using default:', error)
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
