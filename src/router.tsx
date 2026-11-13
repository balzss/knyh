import { createBrowserRouter, Outlet, ScrollRestoration } from 'react-router-dom'
import Providers from '@/providers'
import HomePage from '@/pages/HomePage'
import ArchivePage from '@/pages/ArchivePage'
import RandomPage from '@/pages/RandomPage'
import SettingsPage from '@/pages/SettingsPage'
import ShoppingListPage from '@/pages/ShoppingListPage'
import { RecipeRoute, EditRecipeRoute, NewRecipeRoute } from '@/pages/recipes/routes'
import NotFoundPage from '@/pages/NotFoundPage'

function Root() {
  return (
    <Providers>
      <Outlet />
      <ScrollRestoration />
    </Providers>
  )
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/archive', element: <ArchivePage /> },
      { path: '/random', element: <RandomPage /> },
      { path: '/settings', element: <SettingsPage /> },
      { path: '/shopping-list', element: <ShoppingListPage /> },
      { path: '/recipes/new', element: <NewRecipeRoute /> },
      { path: '/recipes/:id', element: <RecipeRoute /> },
      { path: '/recipes/:id/edit', element: <EditRecipeRoute /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
