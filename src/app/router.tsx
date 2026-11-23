import {
  createBrowserRouter,
  Navigate,
  Outlet,
  ScrollRestoration,
  useParams,
} from 'react-router-dom'
import Providers from '@/app/providers/index'
import HomePage from '@/features/recipes/pages/HomePage'
import { BottomNav } from '@/app/layout/BottomNav'
import { RecipeRoute } from '@/features/recipes/routes'
import NotFoundPage from './NotFoundPage'

// Secondary pages load on demand to keep the first bundle small. They are also fetched when the
// browser is idle, so opening one rarely waits on the network.
const pages = {
  archive: () => import('@/features/recipes/pages/ArchivePage'),
  ideas: () => import('@/features/ideas/IdeasPage'),
  settings: () => import('@/features/settings/SettingsPage'),
  shoppingList: () => import('@/features/shopping-list/ShoppingListPage'),
  edit: () => import('@/features/recipes/edit/routes'),
}

const lazyDefault = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
})

const preloadPages = () => Object.values(pages).forEach((load) => load().catch(() => {}))
if (typeof window !== 'undefined') {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 2000))
  window.addEventListener('load', () => idle(preloadPages), { once: true })
}

// Old /recipes/... links were shared before the move to /r/...
function LegacyRecipeRedirect({ suffix = '' }: { suffix?: string }) {
  const { id } = useParams()
  return <Navigate to={`/r/${id}${suffix}`} replace />
}

function Root() {
  return (
    <Providers>
      {/* SidebarProvider is a flex row; stack the page above the BottomNav spacer */}
      <div className="flex w-full min-w-0 flex-col">
        <Outlet />
        <BottomNav />
      </div>
      <ScrollRestoration />
    </Providers>
  )
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/archive',
        lazy: async () => {
          const [{ default: ArchivePage }, { EditorOnly }] = await Promise.all([
            pages.archive(),
            import('@/components/layout/EditorOnly'),
          ])
          return {
            Component: () => (
              <EditorOnly>
                <ArchivePage />
              </EditorOnly>
            ),
          }
        },
      },
      { path: '/ideas', lazy: lazyDefault(pages.ideas) },
      { path: '/settings', lazy: lazyDefault(pages.settings) },
      { path: '/shopping-list', lazy: lazyDefault(pages.shoppingList) },
      {
        path: '/r/new',
        lazy: async () => ({ Component: (await pages.edit()).NewRecipeRoute }),
      },
      { path: '/r/:id', element: <RecipeRoute /> },
      {
        path: '/r/:id/edit',
        lazy: async () => ({ Component: (await pages.edit()).EditRecipeRoute }),
      },
      { path: '/recipes/:id', element: <LegacyRecipeRedirect /> },
      { path: '/recipes/:id/edit', element: <LegacyRecipeRedirect suffix="/edit" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
