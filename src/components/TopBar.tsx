import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'


type TopBarProps = {
  onSidebarToggle: () => void
  customTopbarContent: React.ReactNode
}

export function TopBar({
  onSidebarToggle = () => {},
  customTopbarContent = <></>,
}: TopBarProps) {
  const {
    isMobile,
  } = useSidebar()

  return (
    <nav className="fixed top-0 right-0 w-full z-50 flex items-center p-2 border-b bg-background gap-2">
      <Button variant="ghost" size="icon" onClick={onSidebarToggle}>
        <Menu />
      </Button>

      {!isMobile && (
        <span className="text-2xl font-bold mx-12">
          KONYHA
        </span>
      )}

      {customTopbarContent}

      <Popover>
        <PopoverTrigger asChild>
        <Avatar className="ml-auto mr-1 cursor-pointer">
          <AvatarImage src="" alt="SB" />
          <AvatarFallback>SB</AvatarFallback>
        </Avatar>
        </PopoverTrigger>
        <PopoverContent className="w-80 ">
          Logged in as Balazs
        </PopoverContent>
      </Popover> 
    </nav>
  );
}

