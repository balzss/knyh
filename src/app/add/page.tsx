'use client'

import { useState, Fragment, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, ListPlus, CircleChevronUp, CircleChevronDown, ListX } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/TopBar'
import {
  AppSidebar,
  PageLayout,
  SortableList,
  IconButton,
  GroupLabelEdit,
} from '@/components/custom'

export default function Add() {
  const [ingredientGroupLabels, setIngredientGroupLabels] = useState<string[]>([''])
  const [disableAddIngredientGroupBtn, setDisableAddIngredientGroupBtn] = useState<boolean>(true)
  const ingredientLists = useRef([['']])
  const ingredientsRef = useRef<HTMLDivElement>(null)

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
    setIngredientGroupLabels((prevItems) =>
      prevItems.map((item, i) => (i === groupIndex ? newValue : item))
    )
  }

  const handleAddIngredientGroup = () => {
    setIngredientGroupLabels((prevItems) => {
      const isFirstGroup = prevItems.length === 1 && prevItems[0] === ''
      return [...(isFirstGroup ? ['First component'] : prevItems), 'New component']
    })

    // wait one tick to ensure the new group is included in the ref and can be focued
    setTimeout(() => {
      focusLastGroupLabel()
    }, 0)
  }

  const focusLastGroupLabel = () => {
    const ingredientsChildren = ingredientsRef.current?.children
    ;(ingredientsChildren?.[ingredientsChildren?.length - 2].firstChild as HTMLSpanElement)?.focus()
  }

  const handleIngredientsChange = (groupIndex: number, newIngredients: string[]) => {
    ingredientLists.current[groupIndex] = newIngredients
    setDisableAddIngredientGroupBtn(
      ingredientLists.current[ingredientLists.current.length - 1].length === 0
    )
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

          <div className="flex gap-3 flex-col" ref={ingredientsRef}>
            {ingredientGroupLabels.map((label, index) => {
              return (
                <Fragment key={index}>
                  {ingredientGroupLabels.length > 1 && (
                    <GroupLabelEdit
                      isInEditMode={true}
                      label={label}
                      onLabelChange={(newValue) =>
                        handleIngredientGroupLabelChange(index, newValue)
                      }
                      actions={[
                        { tooltip: 'Move group up', icon: <CircleChevronUp /> },
                        { tooltip: 'Move group down', icon: <CircleChevronDown /> },
                        { tooltip: 'Remove group', icon: <ListX /> },
                      ]}
                    />
                  )}
                  <SortableList
                    label="Ingredients"
                    initialItems={[]}
                    onItemsChange={(newItems) => handleIngredientsChange(index, newItems)}
                  />
                </Fragment>
              )
            })}
          </div>

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
