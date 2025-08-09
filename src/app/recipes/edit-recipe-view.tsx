'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { X, Ellipsis } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, IconButton } from '@/components/custom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import FormView from './form-view'
import RawView from './raw-view'
import { useRecipes } from '@/hooks'

type NewRecipeViewProps = {
  recipeId?: string
  resetTrigger?: number
}

export default function EditRecipeView({ recipeId }: NewRecipeViewProps) {
  const [formResetTrigger, setFormResetTrigger] = useState<number>(0)

  const searchParams = useSearchParams()
  const t = useTranslations('EditRecipeView')
  const mode = searchParams.get('mode') === 'raw' ? 'raw' : 'form'

  const { toggleSidebar } = useSidebar()
  const router = useRouter()
  const { recipes } = useRecipes({
    ids: recipeId ? [recipeId] : [],
  })

  const recipeToEdit = recipeId ? recipes[0] : undefined
  const inNewRecipeMode = !recipeId // if there is no recipe id, this is a new recipe

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
            <span className="mr-auto sm:mr-4 font-bold">
              {t(recipes[0]?.id ? 'editRecipe' : 'newRecipe')}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  iconSize="normal"
                  variant="ghost"
                  icon={<Ellipsis />}
                  tooltip={t('moreOptions')}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setFormResetTrigger((n) => n + 1)}>
                  {t('resetChanges')}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={mode === 'raw' ? '?mode=form' : '?mode=raw'}>
                    {t(mode === 'raw' ? 'switchToForm' : 'switchToMarkdown')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<X />}
              tooltip={t('close')}
              onClick={handleClosePage}
            />
          </div>
        }
      />
      <AppSidebar path="/new" />

      {(inNewRecipeMode || recipeToEdit) && (
        <main className="w-full mt-16 mx-auto">
          {mode === 'raw' ? (
            <RawView initialRecipe={recipeToEdit} />
          ) : (
            <FormView initialRecipe={recipeToEdit} resetTrigger={formResetTrigger} />
          )}
        </main>
      )}
    </div>
  )
}
