'use client'

import { type ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { isStaticExport } from '@/lib/data-config'

type AuthGuardProps = {
  children: ReactNode
}

/**
 * Client-side auth guard.
 * - No-op in static export/localStorage mode.
 * - In DB mode, redirects unauthenticated users to /login.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: sessionData, isPending } = useSession()

  const publicPaths = ['/login', '/signup']
  const isPublicPath = pathname ? publicPaths.some((p) => pathname.startsWith(p)) : false

  useEffect(() => {
    // redirect to login page if not in static mode and no session detected
    if (isPending || isStaticExport || isPublicPath) return
    if (!sessionData?.user) {
      router.replace('/login')
    }
  }, [pathname, isPending, sessionData, router, isPublicPath])

  if (isPublicPath || isStaticExport || sessionData?.user) return children

  return null
}
