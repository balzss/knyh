import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocale, useTranslations } from 'use-intl'
import { PageShell } from '@/app/layout/PageShell'
import { PageLayout } from '@/components/layout/PageLayout'
import { Loader } from '@/components/layout/Loader'
import { CloseButton } from '@/components/layout/CloseButton'
import { RelativeTime } from '@/components/feedback/RelativeTime'
import { useRecipes } from '@/features/recipes/hooks/use-recipes'
import { useEditMode } from '@/app/providers/EditModeProvider'
import { useClosePage } from '@/hooks/use-close-page'
import { InstructionList } from './InstructionList'
import { IngredientList } from './IngredientList'
import { LinkifiedText } from './LinkifiedText'
import { RecipeHeader } from './RecipeHeader'
import { RecipeTopBar } from './RecipeTopBar'
import { usePageTitle } from '@/hooks/use-page-title'

// Timestamps written moments apart (e.g. create then save) read the same as relative times
const isSameMinute = (a: Date | string, b: Date | string) =>
  Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 60_000

type RecipePageProps = {
  recipeId: string
}

export default function RecipePage({ recipeId }: RecipePageProps) {
  const [factor, setFactor] = useState(1)
  const [scaleOpen, setScaleOpen] = useState(false)
  const [titleEl, setTitleEl] = useState<HTMLHeadingElement | null>(null)
  const [titleOffscreen, setTitleOffscreen] = useState(false)

  const handleClosePage = useClosePage()
  const t = useTranslations('RecipeView')
  const separator = useLocale() === 'hu' ? ',' : '.'

  const { recipes, loading } = useRecipes({ ids: [recipeId], sort: 'random' })
  const recipe = recipes?.[0]
  usePageTitle(recipe?.title)

  const { editor } = useEditMode()

  // Show the top bar title only once the main title has scrolled under the top bar (h-14 = 56px)
  useEffect(() => {
    if (!titleEl) return
    const observer = new IntersectionObserver(
      ([entry]) => setTitleOffscreen(!entry.isIntersecting),
      { rootMargin: '-56px 0px 0px 0px' }
    )
    observer.observe(titleEl)
    return () => observer.disconnect()
  }, [titleEl])

  if (loading) {
    return (
      <PageShell hideSidebarToggleMobile topBarContent={<CloseButton onClick={handleClosePage} />}>
        <PageLayout>
          <Loader />
        </PageLayout>
      </PageShell>
    )
  }

  if (!recipe) {
    return (
      <PageShell
        hideSidebarToggleMobile
        topBarContent={
          <div className="flex items-center gap-2">
            <CloseButton onClick={handleClosePage} />
          </div>
        }
      >
        <PageLayout>
          <div className="flex flex-col items-center justify-center py-12">
            <h1 className="font-bold text-2xl mb-4">{t('recipeNotFound')}</h1>
            <p className="text-muted-foreground mb-6">{t('recipeNotFoundDesc')}</p>
            <Link
              to="/"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {t('backToHome')}
            </Link>
          </div>
        </PageLayout>
      </PageShell>
    )
  }

  return (
    <PageShell
      hideSidebarToggleMobile
      topBarContent={
        <RecipeTopBar
          recipe={recipe}
          titleOffscreen={titleOffscreen}
          onClose={handleClosePage}
          onOpenScale={() => setScaleOpen(true)}
        />
      }
    >
      <PageLayout>
        <RecipeHeader recipe={recipe} factor={factor} separator={separator} titleRef={setTitleEl} />
        <IngredientList
          groups={recipe.ingredients ?? []}
          factor={factor}
          separator={separator}
          onFactorChange={setFactor}
          scaleOpen={scaleOpen}
          onScaleOpenChange={setScaleOpen}
        />
        <InstructionList instructions={recipe.instructions ?? []} />
        {editor && recipe.notes.length > 0 && (
          <div className="flex flex-col gap-1">
            <h2 className="text-xl text-muted-foreground mt-4">{t('notes')}</h2>
            <ul className="flex flex-col gap-2 ml-4 list-disc text-md leading-6">
              {recipe.notes.map((note, index) => (
                <li key={index}>
                  <LinkifiedText text={note} />
                </li>
              ))}
            </ul>
          </div>
        )}
        {editor && (
          <div className="mt-6 text-xs italic text-muted-foreground">
            {recipe.updatedAt && !isSameMinute(recipe.createdAt, recipe.updatedAt) && (
              <span>
                {t('modified')}: <RelativeTime date={recipe.updatedAt} />
                &nbsp;·&nbsp;
              </span>
            )}
            {recipe.createdAt && (
              <span className="mt-1">
                {t('created')}: <RelativeTime date={recipe.createdAt} />
              </span>
            )}
          </div>
        )}
      </PageLayout>
    </PageShell>
  )
}
