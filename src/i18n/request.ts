import fs from 'fs'
import path from 'path'
import { getRequestConfig } from 'next-intl/server'
import { serverDataPath } from '@/lib/utils'
import type { DatabaseSchema } from '@/lib/types'

export default getRequestConfig(async () => {
  const filePath = path.join(process.cwd(), serverDataPath)
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const allData: DatabaseSchema = JSON.parse(fileContent)
  const locale = allData.userConfig.language || 'en'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
