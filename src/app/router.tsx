import {
  createBrowserRouter,
  Navigate,
  Outlet,
  ScrollRestoration,
  useParams,
} from 'react-router-dom'
import Providers from '@/app/providers/index'
import HomePage from '@/features/recipes/pages/HomePage'
import ArchivePage from '@/features/recipes/pages/ArchivePage'
import IdeasPage from '@/features/ideas/IdeasPage'
import RandomPage from '@/features/recipes/pages/RandomPage'
import SettingsPage from '@/features/settings/SettingsPage'
import ShoppingListPage from '@/features/shopping-list/ShoppingListPage'
import { EditorOnly } from '@/components/layout/EditorOnly'
import { BottomNav } from '@/app/layout/BottomNav'
import { RecipeRoute, EditRecipeRoute, NewRecipeRoute } from '@/features/recipes/routes'
import NotFoundPage from './NotFoundPage'

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
        element: (
          <EditorOnly>
            <ArchivePage />
          </EditorOnly>
        ),
      },
      { path: '/ideas', element: <IdeasPage /> },
      { path: '/random', element: <RandomPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/shopping-list', element: <ShoppingListPage /> },
      { path: '/r/new', element: <NewRecipeRoute /> },
      { path: '/r/:id', element: <RecipeRoute /> },
      { path: '/r/:id/edit', element: <EditRecipeRoute /> },
      { path: '/recipes/:id', element: <LegacyRecipeRedirect /> },
      { path: '/recipes/:id/edit', element: <LegacyRecipeRedirect suffix="/edit" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
