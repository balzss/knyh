import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  useSidebar,
} from '@/components/ui/sidebar'

type SidebarNavLinkProps = {
  href: string
  icon: ReactNode
  label: string
  isActive: boolean
  /** Muted text shown at the end of the row, like a count */
  badge?: string
}

export function SidebarNavLink({ href, icon, label, isActive, badge }: SidebarNavLinkProps) {
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={href} onClick={() => setOpenMobile(false)}>
          {icon}
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
      {badge && (
        <SidebarMenuBadge className="font-mono text-muted-foreground peer-hover/menu-button:text-muted-foreground peer-data-[active=true]/menu-button:text-muted-foreground">
          {badge}
        </SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )
}
