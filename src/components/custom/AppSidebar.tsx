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
import { useTags, useTagMutations, useRecipes } from '@/hooks'
import { SidebarItemRow } from '@/components/custom/SidebarItemRow'
import { ConfirmDialog } from '@/components/custom/ConfirmDialog'
import { myToast } from '@/components/custom'
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
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
                            {item.subItems.map((subItem) => (
                              <SidebarItemRow
                                alwaysShowActionsOnMobile={false}
                                key={subItem.id}
                                href={subItem.href}
                                displayName={subItem.displayName}
                                isMobile={isMobile}
                                open={menuOpenForTag === subItem.id}
                                onOpenChange={(open) => setMenuOpenForTag(open ? subItem.id : null)}
                                onNavigate={() => setOpenMobile(false)}
                                actions={[
                                  {
                                    key: 'rename',
                                    label: tTag('renameTag'),
                                    icon: <Pencil className="h-4 w-4" />,
                                    onSelect: () => {
                                      const newName =
                                        window.prompt(tTag('renamePrompt'), subItem.displayName) ||
                                        ''
                                      const trimmed = newName.trim()
                                      if (!trimmed || trimmed === subItem.displayName) return
                                      renameTag.mutate(
                                        { id: subItem.id, displayName: trimmed },
                                        {
                                          onSuccess: () => myToast({ message: tTag('tagRenamed') }),
                                          onError: (error: unknown) =>
                                            myToast({
                                              message: getErrorMessage(error, 'Error'),
                                            }),
                                        }
                                      )
                                    },
                                  },
                                  {
                                    key: 'delete',
                                    label: tTag('removeTag'),
                                    icon: <Trash2 className="h-4 w-4" />,
                                    onSelect: () =>
                                      setTagToDelete({
                                        id: subItem.id,
                                        displayName: subItem.displayName,
                                      }),
                                  },
                                ]}
                              />
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
