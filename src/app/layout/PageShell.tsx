import type { ReactNode } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { AppSidebar } from './AppSidebar'

type PageShellProps = {
  /** Content of the top bar, next to the sidebar toggle and the logo. */
  topBarContent?: ReactNode
  hideSidebarToggleMobile?: boolean
  /** Path the sidebar uses to highlight the current item. */
  sidebarPath?: string
  mainClassName?: string
  children: ReactNode
}

/** The frame every page shares: top bar, sidebar and the main area under the top bar. */
export function PageShell({
  topBarContent,
  hideSidebarToggleMobile,
  sidebarPath,
  mainClassName = 'w-full mt-16 mx-auto',
  children,
}: PageShellProps) {
  return (
    <div className="flex w-full">
      <TopBar
        hideSidebarToggleMobile={hideSidebarToggleMobile}
        customTopbarContent={topBarContent}
      />
      <AppSidebar path={sidebarPath} />
      <main className={mainClassName}>{children}</main>
    </div>
  )
}
