import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'

type SidebarNavLinkProps = {
  href: string
  icon: ReactNode
  label: string
  isActive: boolean
}

export function SidebarNavLink({ href, icon, label, isActive }: SidebarNavLinkProps) {
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={href} onClick={() => setOpenMobile(false)}>
          {icon}
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
