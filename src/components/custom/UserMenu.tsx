'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useConfig } from '@/hooks/use-config'
import { generateInitials } from '@/lib/utils'
import { isStaticExport, isClientStaticExport } from '@/lib/data-config'

type UserMenuProps = {
  hideSidebarToggleMobile?: boolean
}

export function UserMenu({ hideSidebarToggleMobile }: UserMenuProps) {
  const t = useTranslations('TopBar')
  const [isUserPopupOpen, setIsUserPopupOpen] = useState<boolean>(false)
  const { data: userConfig, isLoading } = useConfig()

  // Check if we're in static export mode
  const isStaticMode = isStaticExport || isClientStaticExport()

  // Generate initials from user name
  const userInitials = userConfig?.name ? generateInitials(userConfig.name) : 'U'
  const userName = userConfig?.name || 'User'

  const handleUserPopupOpen = (shouldOpen: boolean) => {
    setIsUserPopupOpen(shouldOpen)
  }

  return (
    <Popover open={isUserPopupOpen} onOpenChange={handleUserPopupOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`ml-auto mr-1 cursor-pointer rounded-full ${
            hideSidebarToggleMobile ? 'hidden sm:flex' : ''
          }`}
        >
          <Avatar>
            <AvatarImage src="" alt={userInitials} />
            <AvatarFallback>{isLoading ? '...' : userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-2 flex w-80 flex-col gap-3 font-bold">
        <span>{isLoading ? t('loading') : t('loggedInAs', { username: userName })}</span>
        <Button
          asChild={!isStaticMode}
          disabled={isStaticMode}
          variant={isStaticMode ? 'outline' : 'default'}
        >
          <Link href="/login" className="flex gap-2 items-center">
            <LogOut /> {t('signOut')}
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  )
}
