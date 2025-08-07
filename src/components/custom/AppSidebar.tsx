import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import {
  X,
  Tags,
  ChevronRight,
  Settings,
  Archive,
  FilePlus,
  ShoppingCart,
  BookOpenText,
  Dices,
} from 'lucide-react'
import { useTags } from '@/hooks'
import type { Tag } from '@/lib/types'

type AppSidebarProps = {
  path?: string
}

export function AppSidebar({ path }: AppSidebarProps) {
  const t = useTranslations('Navigation')
  const { isMobile, setOpenMobile } = useSidebar()
  const { tags } = useTags()

  const sidebarItems = (tags: Tag[]) => [
    {
      displayName: t('recipes'),
      icon: <BookOpenText />,
      href: '/',
    },
    {
      displayName: t('tags'),
      icon: <Tags />,
      subItems: Object.values(tags).map(({ id, displayName }) => {
        return {
          displayName,
          href: `/?tag=${id}`,
        }
      }),
    },
    {
      displayName: t('random'),
      icon: <Dices />,
      href: '/random',
    },
    {
      displayName: t('shopping-list'),
      icon: <ShoppingCart />,
      href: '/shopping-list',
    },
    {
      displayName: t('archive'),
      icon: <Archive />,
      href: '/archive',
    },
    {
      displayName: t('settings'),
      icon: <Settings />,
      href: '/settings',
    },
  ]

  return (
    <Sidebar>
      {isMobile && (
        <SidebarHeader className="p-3">
          <div className="flex justify-between items-center">
            <Link
              className="text-2xl font-bold focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md"
              href="/"
              onClick={() => setOpenMobile(false)}
            >
              KONYHA
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)}>
              <X />
            </Button>
          </div>
        </SidebarHeader>
      )}
      <SidebarContent className={isMobile ? '' : 'mt-16'}>
        <SidebarGroup>
          <div className="mb-4">
            <Button
              variant={path === '/new' ? 'outline' : 'default'}
              className="font-bold py-4 px-3"
              asChild={path !== '/new'}
              disabled={path === '/new'}
            >
              {path !== '/new' ? (
                <Link href="/recipes/new" onClick={() => setOpenMobile(false)}>
                  <FilePlus />
                  <span>{t('new-recipe-button')}</span>
                </Link>
              ) : (
                <>
                  <FilePlus />
                  <span>{t('new-recipe-button')}</span>
                </>
              )}
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems(tags).map((item) => {
                if (item.subItems) {
                  return (
                    <Collapsible
                      key={item.displayName}
                      asChild
                      defaultOpen={true}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton>
                            {item.icon}
                            <span>{item.displayName}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.displayName}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={subItem.href} onClick={() => setOpenMobile(false)}>
                                    <span>{subItem.displayName}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={path === item.href}>
                      <Link href={item.href} onClick={() => setOpenMobile(false)}>
                        {item.icon}
                        <span>{item.displayName}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
