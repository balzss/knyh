import { useState } from 'react'
import Link from 'next/link'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { IconButton } from '@/components/custom'

type TopBarProps = {
  onSidebarToggle: () => void
  customTopbarContent: React.ReactNode
  hideSidebarToggleMobile?: boolean
}

export function TopBar({
  onSidebarToggle = () => {},
  customTopbarContent = <></>,
  hideSidebarToggleMobile = false,
}: TopBarProps) {
  const [isUserPopupOpen, setIsUserPopupOpen] = useState<boolean>(false)

  const handleUserPopupOpen = (shouldOpen: boolean) => {
    setIsUserPopupOpen(shouldOpen)
  }

  return (
    <nav className="fixed top-0 right-0 w-full z-50 flex items-center p-2 border-b bg-background gap-2">
      <IconButton
        className={hideSidebarToggleMobile ? 'hidden sm:flex' : ''}
        icon={<Menu />}
        tooltip="Toggle Sidebar"
        iconSize="normal"
        onClick={onSidebarToggle}
      />

      <Link
        className="hidden sm:flex text-2xl font-bold focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md w-48 mr-1 items-center justify-center"
        href="/"
      >
        KONYHA
      </Link>

      <div className="flex-1 max-h-10 overflow-hidden items-center">{customTopbarContent}</div>

      <Popover open={isUserPopupOpen} onOpenChange={handleUserPopupOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="ml-auto mr-1 cursor-pointer rounded-full">
            <Avatar>
              <AvatarImage src="" alt="SB" />
              <AvatarFallback>SB</AvatarFallback>
            </Avatar>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 mx-2 flex flex-col gap-3 font-bold">
          <span>Logged in as Balazs</span>
          <Button className="font-bold">
            <LogOut /> Sign Out
          </Button>
        </PopoverContent>
      </Popover>
    </nav>
  )
}
