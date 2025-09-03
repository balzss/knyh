'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dices } from 'lucide-react'
import {
  TopBar,
  AppSidebar,
  PageLayout,
  RecipeCard,
  IconButton,
  TagEditor,
} from '@/components/custom'
import { useRecipes } from '@/hooks'
import type { Tag } from '@/lib/types'

export default function RandomPage() {
  const t = useTranslations('RandomRecipePage')
  const [tagFilter, setTagFilter] = useState<Tag[]>([])
  const [rollIndex, setRollIndex] = useState<number>(0)
  const { recipes } = useRecipes({ sort: 'random', tags: tagFilter.map((t) => t.id) })

  // // Filter the pre-shuffled recipes by selected tags, then pick the nth (rollIndex) entry.
  // const filtered = recipes?.filter((r) => tagFilter?.every((tag) => r.tags.includes(tag.id))) || []
  const recipe = recipes.length > 0 ? recipes[rollIndex % recipes.length] : undefined

  return (
    <div className="flex w-full">
      <TopBar
        customTopbarContent={
          <div className="flex items-center gap-2">
            <span className="mr-auto sm:mr-4 font-bold">{t('title')}</span>
            <IconButton
              iconSize="normal"
              variant="ghost"
              icon={<Dices />}
              tooltip={t('rollNew')}
              onClick={() => setRollIndex((i) => i + 1)}
            />
          </div>
        }
      />
      <AppSidebar path="/random" />
      <main className="w-full mt-14">
        <PageLayout variant="list">
          <TagEditor
            label={t('filter')}
            buttonLabel={t('selectTag')}
            tags={tagFilter}
            onTagChange={(newTags) => {
              setTagFilter(newTags)
              // Reset the roll index so the first result after changing filters is the 0th
              setRollIndex(0)
            }}
          />
          {recipe && <RecipeCard key={recipe.id} tags={recipe.tags} recipeData={recipe} />}
        </PageLayout>
      </main>
    </div>
  )
}
