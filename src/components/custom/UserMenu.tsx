'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type UserMenuProps = {
  hideSidebarToggleMobile?: boolean
}

export function UserMenu({ hideSidebarToggleMobile }: UserMenuProps) {
  const t = useTranslations('TopBar')
  const [isUserPopupOpen, setIsUserPopupOpen] = useState<boolean>(false)

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
            <AvatarImage src="" alt="SB" />
            <AvatarFallback>SB</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-2 flex w-80 flex-col gap-3 font-bold">
        <span>{t('loggedInAs', { username: 'Balazs' })}</span>
        <Button asChild>
          <Link href="/login">
            <LogOut /> {t('signOut')}
          </Link>
        </Button>
      </PopoverContent>
    </Popover>
  )
}

