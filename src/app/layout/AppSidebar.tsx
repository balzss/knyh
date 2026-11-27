import { useTranslations } from 'use-intl'
import { Link, useSearchParams } from 'react-router-dom'
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
  Lightbulb,
  ShoppingCart,
  BookOpenText,
  ExternalLink,
} from 'lucide-react'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { useEditMode } from '@/app/providers/EditModeProvider'
import { useRecipes } from '@/features/recipes/hooks/use-recipes'
import { useIdeas } from '@/features/ideas/use-ideas'
import { useShoppingList } from '@/features/shopping-list/use-shopping-list'
import { SidebarBuildInfo } from './SidebarBuildInfo'
import { SidebarNavLink } from './SidebarNavLink'
import { SidebarTagList } from './SidebarTagList'

type AppSidebarProps = {
  /** The page this sidebar is on, which highlights its entry. Pages without an entry leave it out. */
  path?: string
}

export function AppSidebar({ path }: AppSidebarProps) {
  const t = useTranslations('Navigation')
  const { isMobile, setOpenMobile } = useSidebar()
  const { editor } = useEditMode()
  const { recipes } = useRecipes({ archived: false })
  const { ideas } = useIdeas()
  const { shoppingList } = useShoppingList()
  const readyCount = recipes.filter((recipe) => recipe.status === 'ready').length
  const toBuyCount = shoppingList.filter((item) => !item.checked).length

  // Tags are only filtered on the recipe list
  const [searchParams] = useSearchParams()
  const selectedTagIds = path === '/' ? (searchParams.get('tag')?.split(',') ?? []) : []

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
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarNavLink
                href="/"
                icon={<BookOpenText />}
                label={t('recipes')}
                badge={`${readyCount}/${recipes.length}`}
                // Only highlight recipes when on root path without tag filter
                isActive={path === '/' && selectedTagIds.length === 0}
              />
              <SidebarTagList selectedTagIds={selectedTagIds} />
              {/* The ideas, the shopping list and the archive are private to the editor */}
              {editor && (
                <>
                  <SidebarNavLink
                    href="/ideas"
                    icon={<Lightbulb />}
                    label={t('ideas')}
                    badge={String(ideas.length)}
                    isActive={path === '/ideas'}
                  />
                  <SidebarNavLink
                    href="/shopping-list"
                    icon={<ShoppingCart />}
                    label={t('shopping-list')}
                    badge={String(toBuyCount)}
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
