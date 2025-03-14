import { useState } from 'react'
import Link from 'next/link'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { IconButton } from '@/components/IconButton'

type TopBarProps = {
  onSidebarToggle: () => void
  customTopbarContent: React.ReactNode
}

export function TopBar({
  onSidebarToggle = () => {},
  customTopbarContent = <></>,
}: TopBarProps) {
  const [isUserPopupOpen, setIsUserPopupOpen] = useState<boolean>(false)

  const handleUserPopupOpen = (shouldOpen: boolean) => {
    setIsUserPopupOpen(shouldOpen)
  }

  return (
    <nav className="fixed top-0 right-0 w-full z-50 flex items-center p-2 border-b bg-background gap-2">
      <IconButton
        icon={<Menu />}
        tooltip="Toggle Sidebar"
        size="normal"
        onClick={onSidebarToggle}
      />

      <Link
        className="hidden sm:block text-2xl font-bold mx-12 focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md"
        href="/"
      >
        KONYHA
      </Link>

      {customTopbarContent}

      <Popover open={isUserPopupOpen} onOpenChange={handleUserPopupOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto mr-1 cursor-pointer rounded-full"
          >
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
