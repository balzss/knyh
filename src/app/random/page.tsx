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
import { useRecipes, useTags } from '@/hooks'
import type { Tag } from '@/lib/types'

export default function RandomPage() {
  const t = useTranslations('RandomRecipePage')
  const { recipes } = useRecipes({ sort: 'random' })
  const [tagFilter, setTagFilter] = useState<Tag[]>([])
  const { tags } = useTags()
  const recipe = recipes?.filter((r) => tagFilter?.every((tag) => r.tags.includes(tag.id)))?.[0]

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
              onClick={() => window.location.reload()}
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
            onTagChange={(newTags) => setTagFilter(newTags)}
          />
          {recipe && (
            <RecipeCard
              key={recipe.id}
              tags={recipe.tags
                .map((tagId) => tags?.find((tag) => tag.id === tagId))
                .filter((t) => !!t)}
              recipeData={recipe}
            />
          )}
        </PageLayout>
      </main>
    </div>
  )
}
