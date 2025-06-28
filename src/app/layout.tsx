import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { SidebarProvider } from '@/components/ui/sidebar'

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
        <Suspense>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>{children}</SidebarProvider>
            <Toaster toastOptions={{ style: { padding: '0.5rem 1rem' } }} />
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  )
}
