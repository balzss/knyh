import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { Link } from 'react-router-dom'
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
  SidebarFooter,
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
  ExternalLink,
  Pencil,
  Trash2,
} from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { useTags, useTagMutations, useConfirmDialog } from '@/hooks'
import { myToast, RenameTagDialog, SidebarItemRow } from '@/components/custom'
import type { Tag } from '@/lib/types'
import { getErrorMessage } from '@/lib/utils'
import { useEditMode } from '@/providers/EditModeProvider'

type AppSidebarProps = {
  path?: string
}

export function AppSidebar({ path }: AppSidebarProps) {
  const t = useTranslations('Navigation')
  const tTag = useTranslations('TagActions')
  const { isMobile, setOpenMobile } = useSidebar()
  const { editor } = useEditMode()
  const { tags } = useTags()
  const { deleteTag } = useTagMutations()
  const { confirmDelete } = useConfirmDialog()
  const [menuOpenForTag, setMenuOpenForTag] = useState<string | null>(null)
  const [renamingTag, setRenamingTag] = useState<Tag | null>(null)

  // Extract tags from URL parameters if present
  const getSelectedTagsFromPath = (currentPath?: string) => {
    if (!currentPath) return []
    try {
      const url = new URL(currentPath, 'http://localhost')
      const tagParam = url.searchParams.get('tag')
      return tagParam ? tagParam.split(',') : []
    } catch {
      return []
    }
  }

  const selectedTagIds = getSelectedTagsFromPath(path)

  const sidebarItems = (tags: Tag[]) => [
    {
      displayName: t('recipes'),
      icon: <BookOpenText />,
      href: '/',
      // Only highlight recipes when on root path without tag filter
      isActive: path === '/' && selectedTagIds.length === 0,
    },
    {
      displayName: t('tags'),
      icon: <Tags />,
      subItems: Object.values(tags).map(({ id, displayName }) => {
        return {
          id,
          displayName,
          href: `/?tag=${id}`,
          isActive: selectedTagIds.includes(id),
        }
      }),
    },
    {
      displayName: t('random'),
      icon: <Dices />,
      href: '/random',
    },
    // The shopping list and the archive are private to the editor
    ...(editor
      ? [
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
        ]
      : []),
    {
      displayName: t('settings'),
      icon: <Settings />,
      href: '/settings',
    },
  ]

  return (
    <>
      <Sidebar>
        {isMobile && (
          <SidebarHeader className="p-3">
            <div className="flex justify-between items-center">
              <Link
                className="text-2xl font-bold focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2 focus:ring-offset-background focus:rounded-md"
                to="/"
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
            {editor && (
              <div className="mb-4">
                <Button
                  variant={path === '/new' ? 'outline' : 'default'}
                  className="font-bold py-4 px-3"
                  asChild={path !== '/new'}
                  disabled={path === '/new'}
                >
                  {path !== '/new' ? (
                    <Link to="/recipes/new" onClick={() => setOpenMobile(false)}>
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
            )}
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
                                  onOpenChange={(open) =>
                                    setMenuOpenForTag(open ? subItem.id : null)
                                  }
                                  onNavigate={() => setOpenMobile(false)}
                                  isActive={subItem.isActive}
                                  actions={
                                    !editor
                                      ? []
                                      : [
                                          {
                                            key: 'rename',
                                            opensDialog: true,
                                            label: tTag('renameTag'),
                                            icon: <Pencil className="h-4 w-4" />,
                                            onSelect: () => {
                                              setMenuOpenForTag(null)
                                              setRenamingTag({
                                                id: subItem.id,
                                                displayName: subItem.displayName,
                                              })
                                            },
                                          },
                                          {
                                            key: 'delete',
                                            opensDialog: true,
                                            label: tTag('removeTag'),
                                            icon: <Trash2 className="h-4 w-4" />,
                                            onSelect: async () => {
                                              setMenuOpenForTag(null)
                                              const confirmed = await confirmDelete({
                                                name: subItem.displayName,
                                              })
                                              if (confirmed) {
                                                deleteTag.mutate(subItem.id, {
                                                  onSuccess: () => {
                                                    myToast({ message: tTag('tagDeleted') })
                                                  },
                                                  onError: (e: unknown) => {
                                                    myToast({
                                                      message: getErrorMessage(e, 'Error'),
                                                    })
                                                  },
                                                })
                                              }
                                            },
                                          },
                                        ]
                                  }
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
                      <SidebarMenuButton asChild isActive={item.isActive ?? path === item.href}>
                        <Link to={item.href} onClick={() => setOpenMobile(false)}>
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
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-muted-foreground">
                <a href="https://github.com/balzss/knyh" target="_blank" rel="noopener noreferrer">
                  <SiGithub className="h-4 w-4" />
                  <span>{t('github')}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <RenameTagDialog tag={renamingTag} onClose={() => setRenamingTag(null)} />
    </>
  )
}
