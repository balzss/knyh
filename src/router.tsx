import {
  createBrowserRouter,
  Navigate,
  Outlet,
  ScrollRestoration,
  useParams,
} from 'react-router-dom'
import Providers from '@/providers'
import HomePage from '@/pages/HomePage'
import ArchivePage from '@/pages/ArchivePage'
import IdeasPage from '@/pages/IdeasPage'
import RandomPage from '@/pages/RandomPage'
import SettingsPage from '@/pages/SettingsPage'
import ShoppingListPage from '@/pages/ShoppingListPage'
import { EditorOnly } from '@/components/custom/EditorOnly'
import { BottomNav } from '@/components/custom/BottomNav'
import { RecipeRoute, EditRecipeRoute, NewRecipeRoute } from '@/pages/recipes/routes'
import NotFoundPage from '@/pages/NotFoundPage'

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
