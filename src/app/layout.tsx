import type { Metadata } from 'next'
import Providers from '@/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'KONYHA',
  description: 'Recipe Manager',
  icons: {
    icon: '/knyh/cooking-pot.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
