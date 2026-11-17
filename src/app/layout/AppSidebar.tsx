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
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  X,
  Settings,
  Archive,
  FilePlus,
  Lightbulb,
  ShoppingCart,
  BookOpenText,
  Dices,
  ExternalLink,
} from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { useEditMode } from '@/app/providers/EditModeProvider'
import { SidebarBuildInfo } from './SidebarBuildInfo'
import { SidebarNavLink } from './SidebarNavLink'
import { SidebarTagList } from './SidebarTagList'

type AppSidebarProps = {
  path?: string
}

// Extract tags from URL parameters if present
function getSelectedTagsFromPath(currentPath?: string) {
  if (!currentPath) return []
  try {
    const url = new URL(currentPath, 'http://localhost')
    const tagParam = url.searchParams.get('tag')
    return tagParam ? tagParam.split(',') : []
  } catch {
    return []
  }
}

export function AppSidebar({ path }: AppSidebarProps) {
  const t = useTranslations('Navigation')
  const { isMobile, setOpenMobile } = useSidebar()
  const { editor } = useEditMode()

  const selectedTagIds = getSelectedTagsFromPath(path)

  return (
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
          {editor && !isMobile && (
            <div className="mb-4">
              <Button
                variant={path === '/new' ? 'outline' : 'default'}
                className="font-bold py-4 px-3"
                asChild={path !== '/new'}
                disabled={path === '/new'}
              >
                {path !== '/new' ? (
                  <Link to="/r/new" onClick={() => setOpenMobile(false)}>
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
              <SidebarNavLink
                href="/"
                icon={<BookOpenText />}
                label={t('recipes')}
                // Only highlight recipes when on root path without tag filter
                isActive={path === '/' && selectedTagIds.length === 0}
              />
              <SidebarTagList selectedTagIds={selectedTagIds} />
              <SidebarNavLink
                href="/random"
                icon={<Dices />}
                label={t('random')}
                isActive={path === '/random'}
              />
              {/* The ideas, the shopping list and the archive are private to the editor */}
              {editor && (
                <>
                  <SidebarNavLink
                    href="/ideas"
                    icon={<Lightbulb />}
                    label={t('ideas')}
                    isActive={path === '/ideas'}
                  />
                  <SidebarNavLink
                    href="/shopping-list"
                    icon={<ShoppingCart />}
                    label={t('shopping-list')}
                    isActive={path === '/shopping-list'}
                  />
                  <SidebarNavLink
                    href="/archive"
                    icon={<Archive />}
                    label={t('archive')}
                    isActive={path === '/archive'}
                  />
                </>
              )}
              <SidebarNavLink
                href="/settings"
                icon={<Settings />}
                label={t('settings')}
                isActive={path === '/settings'}
              />
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
        <SidebarBuildInfo />
      </SidebarFooter>
    </Sidebar>
  )
}
