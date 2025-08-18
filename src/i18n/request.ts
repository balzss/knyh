import fs from 'fs'
import path from 'path'
import { getRequestConfig } from 'next-intl/server'
import { serverDataPath } from '@/lib/utils'
import type { DatabaseSchema } from '@/lib/types'

export default getRequestConfig(async () => {
  // For static exports, use 'en' as default since we can't access localStorage server-side
  // The actual language will be handled client-side after hydration
  const isStaticExport = process.env.NEXT_OUTPUT_MODE === 'export'

  let locale = 'en' // Default fallback

  if (!isStaticExport) {
    // Only read from file in non-static mode
    try {
      const filePath = path.join(process.cwd(), serverDataPath)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const allData: DatabaseSchema = JSON.parse(fileContent)
      locale = allData.userConfig.language || 'en'
    } catch (error) {
      console.warn('Could not read language from data file, using default:', error)
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
