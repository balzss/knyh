'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { X, ListPlus } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout, SortableList, IconButton } from '@/components/custom'

type IngredientGroup = {
  label: string
  ingredients: string[]
}

export default function Add() {
  const [ingredientGroups, setIngredientGroups] = useState<IngredientGroup[]>([
    { label: '', ingredients: [] },
  ])
  const { toggleSidebar } = useSidebar()
  const router = useRouter()

  const handleClosePage = () => {
    if (document.referrer.startsWith('https://balzss.github.io/knyh/')) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  const handleIngredientGroupLabelChange = (groupIndex: number, newValue: string) => {
    setIngredientGroups((prevItems) =>
      prevItems.map((item, i) => (i === groupIndex ? { ...item, label: newValue } : item))
    )
  }

  const handleAddIngredientGroup = () => {
    setIngredientGroups((prevItems) => [...prevItems, { label: '', ingredients: [] }])
  }

  // const handleIngredientsChange = (groupIndex: number, newIngredients: string[]) => {
  //   setIngredientGroups((prevItems) =>
  //     prevItems.map((item, i) =>
  //       i === groupIndex ? { ...item, ingredients: newIngredients } : item
  //     )
  //   )
  // }

  const disableAddIngredientGroupBtn =
    ingredientGroups.length === 1 && ingredientGroups[0].ingredients.length === 0

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
              tooltip="Clear selection"
              onClick={handleClosePage}
            />
            <span className="mr-4 font-bold">Add Recipe</span>
          </div>
        }
      />
      <AppSidebar />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <div className="grid w-full items-center gap-2 mb-4">
            <Label htmlFor="recipe-title" className="font-bold">
              Recipe title
            </Label>
            <Input type="text" id="recipe-title" autoFocus />
          </div>

          {ingredientGroups.map(({ label }, index) => {
            return (
              <Fragment key={label}>
                {ingredientGroups.length > 1 && (
                  <Input
                    value={label}
                    onChange={(e) => handleIngredientGroupLabelChange(index, e.target.value)}
                  />
                )}
                <SortableList
                  label={ingredientGroups.length > 1 ? `${label} ingredients` : 'Ingredients'}
                  initialItems={[]}
                  onItemsChange={(newItems) => console.log({ newItems })}
                />
              </Fragment>
            )
          })}

          <div>
            <Button
              variant="outline"
              onClick={handleAddIngredientGroup}
              disabled={disableAddIngredientGroupBtn}
            >
              <ListPlus />
              Add ingredient group
            </Button>
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
