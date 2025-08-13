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
import { useTags, useTagMutations, useRecipes, useLongPress } from '@/hooks'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { myToast } from '@/components/custom'
import { useState, useRef } from 'react'
import type { Tag } from '@/lib/types'
import { getErrorMessage } from '@/lib/utils'

type AppSidebarProps = {
  path?: string
}

export function AppSidebar({ path }: AppSidebarProps) {
  const t = useTranslations('Navigation')
  const tTag = useTranslations('TagActions')
  const { isMobile, setOpenMobile } = useSidebar()
  const { tags } = useTags()
  const { recipes } = useRecipes()
  const { renameTag, deleteTag } = useTagMutations()
  const [tagToDelete, setTagToDelete] = useState<{ id: string; displayName: string } | null>(null)
  const [menuOpenForTag, setMenuOpenForTag] = useState<string | null>(null)

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
        const usageCount = recipes?.filter((r) => r.tags.includes(id)).length || 0
        return {
          id,
          displayName,
          href: `/?tag=${id}`,
          usageCount,
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
                            {item.subItems.map((subItem) => {
                              const { bind, wasLongPress } = useLongPress(
                                () => setMenuOpenForTag(subItem.id),
                                { enabled: isMobile }
                              )
                              return (
                                <SidebarMenuSubItem
                                  key={subItem.id}
                                  className="flex items-center group/tagrow"
                                  {...bind}
                                >
                                <SidebarMenuSubButton asChild className="flex-1">
                                  <Link
                                    href={subItem.href}
                                    onClick={(e) => {
                                      if (wasLongPress()) {
                                        e.preventDefault()
                                        return
                                      }
                                      setOpenMobile(false)
                                    }}
                                  >
                                    <span>{subItem.displayName}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                                <DropdownMenu
                                  open={menuOpenForTag === subItem.id}
                                  onOpenChange={(open) => {
                                    setMenuOpenForTag(open ? subItem.id : null)
                                  }}
                                >
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      // Always visible on mobile (touch), hover/focus/open on desktop
                                      className={
                                        `h-6 w-6 ml-1 transition-opacity ` +
                                        (isMobile
                                          ? 'opacity-100'
                                          : 'opacity-0 group-hover/tagrow:opacity-100 focus:opacity-100 data-[state=open]:opacity-100')
                                      }
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onSelect={() => {
                                        const newName =
                                          window.prompt(
                                            tTag('renamePrompt'),
                                            subItem.displayName
                                          ) || ''
                                        const trimmed = newName.trim()
                                        if (!trimmed || trimmed === subItem.displayName) return
                                        renameTag.mutate(
                                          { id: subItem.id, displayName: trimmed },
                                          {
                                            onSuccess: () =>
                                              myToast({ message: tTag('tagRenamed') }),
                                            onError: (error: unknown) =>
                                              myToast({
                                                message: getErrorMessage(error, 'Error'),
                                              }),
                                          }
                                        )
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" /> {tTag('renameTag')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onSelect={() => {
                                        setTagToDelete({
                                          id: subItem.id,
                                          displayName: subItem.displayName,
                                        })
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" /> {tTag('removeTag')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                </SidebarMenuSubItem>
                              )
                            })}
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
      {tagToDelete && (
        <ConfirmDialog
          open={!!tagToDelete}
          onOpenChange={(open) => {
            if (!open) setTagToDelete(null)
          }}
          title={tTag('deleteTagDialogTitle')}
          description={tTag('deleteTagDialogDescription', {
            name: tagToDelete.displayName,
            count: recipes?.filter((r) => r.tags.includes(tagToDelete.id)).length || 0,
          })}
          confirmText={deleteTag.isPending ? tTag('deleting') : tTag('delete')}
          onConfirm={() => {
            deleteTag.mutate(tagToDelete.id, {
              onSuccess: () => {
                myToast({ message: tTag('tagDeleted') })
              },
              onError: (e: unknown) => {
                myToast({ message: getErrorMessage(e, 'Error') })
              },
            })
          }}
        />
      )}
    </Sidebar>
  )
}
