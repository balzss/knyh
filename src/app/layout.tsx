import type { Metadata } from 'next'
import { getLocale, getMessages } from 'next-intl/server'
import Providers from '@/providers'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { basePath } from '@/lib/utils'
import './globals.css'

export const metadata: Metadata = {
  title: 'KONYHA',
  description: 'Recipe Manager',
  icons: {
    icon: `${basePath}/cooking-pot.png`,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Providers i18n={{ locale, messages }}>
          <ServiceWorkerRegistration />
          {children}
        </Providers>
      </body>
    </html>
  )
}
