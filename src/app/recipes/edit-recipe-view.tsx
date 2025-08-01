'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Ellipsis } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, IconButton } from '@/components/custom'
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import FormView from './form-view'
import RawView from './raw-view'
import { useRecipes } from '@/hooks'

type NewRecipeViewProps = {
  recipeId?: string
}

export default function NewRecipeView({ recipeId }: NewRecipeViewProps) {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') === 'raw' ? 'raw' : 'form'

  const { toggleSidebar } = useSidebar()
  const router = useRouter()
  const { recipes } = useRecipes({ ids: recipeId ? [recipeId] : [], sort: 'random' })

  const handleClosePage = () => {
    if (window.history.length > 1 && document.referrer === '') {
      router.back()
    } else {
      router.replace('/')
    }
  }

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        hideSidebarToggleMobile
        customTopbarContent={
          <div className="flex items-center gap-2">
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<X />}
              tooltip="Close"
              onClick={handleClosePage}
            />
            <span className="mr-auto sm:mr-4 font-bold">
              {recipes[0]?.id ? 'Edit' : 'New'} recipe
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  iconSize="normal"
                  variant="ghost"
                  icon={<Ellipsis />}
                  tooltip="More options"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>More options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={mode === 'raw' ? '?mode=form' : '?mode=raw'}>
                    Switch to {mode === 'raw' ? 'form' : 'markdown'} mode
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      <AppSidebar path="/new" />

      <main className="w-full mt-16 mx-auto">
        {mode === 'raw' ? (
          <RawView recipeData={recipes[0]} />
        ) : (
          <FormView recipeData={recipes[0]} />
        )}
      </main>
    </div>
  )
}
