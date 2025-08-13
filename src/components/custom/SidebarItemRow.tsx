import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { useLongPress } from '@/hooks'
import { useTranslations } from 'next-intl'

export interface SidebarAction {
  key: string
  label: string
  icon?: React.ReactNode
  onSelect: () => void
}

interface SidebarItemRowProps {
  href: string
  displayName: string
  isMobile: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate: () => void
  actions: SidebarAction[]
  alwaysShowActionsOnMobile?: boolean
}

export function SidebarItemRow({
  href,
  displayName,
  isMobile,
  open,
  onOpenChange,
  onNavigate,
  actions,
  alwaysShowActionsOnMobile = true,
}: SidebarItemRowProps) {
  const tTag = useTranslations('TagActions')
  const { bind, wasLongPress } = useLongPress(() => onOpenChange(true), { enabled: isMobile })

  return (
    <div className="flex items-center gap-1 group/tagrow w-full" {...bind}>
      <Link
        href={href}
        className="flex-1"
        onClick={(e) => {
          if (wasLongPress()) {
            e.preventDefault()
            return
          }
          onNavigate()
        }}
      >
        <span>{displayName}</span>
      </Link>
      <DropdownMenu open={open} onOpenChange={(o) => onOpenChange(o)}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={
              `h-6 w-6 ml-1 transition-opacity ` +
              (isMobile && alwaysShowActionsOnMobile
                ? 'opacity-100'
                : 'opacity-0 group-hover/tagrow:opacity-100 focus:opacity-100 data-[state=open]:opacity-100')
            }
            aria-label={tTag('actionsAriaLabel', { name: displayName })}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((a) => (
            <button
              key={a.key}
              onClick={(e) => {
                e.preventDefault()
                a.onSelect()
              }}
              className="flex items-center gap-2 px-2 py-1.5 text-sm w-full text-left hover:bg-accent focus:bg-accent rounded-sm"
            >
              {a.icon}
              <span>{a.label}</span>
            </button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
