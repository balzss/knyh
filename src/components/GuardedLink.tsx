'use client'

import React from 'react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { useNavigationGuard } from '@/providers/NavigationGuardProvider'

interface GuardedLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
}

export function GuardedLink({ href, children, className, ...props }: GuardedLinkProps) {
  const router = useRouter()
  const { setNavigationGuard } = useNavigationGuard()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()

    // Get the current navigation guard
    const guard = (setNavigationGuard as any).__currentGuard

    if (guard && guard.shouldBlock()) {
      const { confirm } = await import('@/hooks/use-confirm-dialog')
      const confirmDialog = confirm()
      const shouldLeave = await confirmDialog.confirm(guard.message)

      if (shouldLeave) {
        router.push(href.toString())
      }
    } else {
      router.push(href.toString())
    }
  }

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  )
}
