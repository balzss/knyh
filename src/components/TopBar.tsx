import Link from 'next/link'
import { Menu } from 'lucide-react'
import { IconButton, UserMenu } from '@/components/custom'

type TopBarProps = {
  onSidebarToggle: () => void
  customTopbarContent?: React.ReactNode
  hideSidebarToggleMobile?: boolean
}

export function TopBar({
  onSidebarToggle = () => {},
  customTopbarContent = <></>,
  hideSidebarToggleMobile = false,
}: TopBarProps) {
  return (
    <nav className="fixed top-0 right-0 z-50 flex h-14 w-full items-center gap-2 overflow-hidden border-b bg-background p-3">
      <IconButton
        className={hideSidebarToggleMobile ? 'hidden sm:flex' : ''}
        icon={<Menu />}
        tooltip="Toggle Sidebar"
        iconSize="normal"
        onClick={onSidebarToggle}
      />

      <Link
        className="hidden w-48 mr-1 items-center justify-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:flex focus:rounded-md"
        href="/"
      >
        KONYHA
      </Link>

      <div className="flex-1 items-center">{customTopbarContent}</div>

      <UserMenu hideSidebarToggleMobile={hideSidebarToggleMobile} />
    </nav>
  )
}
