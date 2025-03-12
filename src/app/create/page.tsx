'use client'

import { useState } from 'react'
import { TopBar } from '@/components/TopBar'
import { AppSidebar } from '@/components/AppSidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { PageLayout } from '@/components/PageLayout'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { SortableInput } from '@/components/SortableInput';

export default function Create() {
  const {
    toggleSidebar,
  } = useSidebar()
  const [ingredientList, setIngredientList] = useState<string[]>(['1', '2', '3', '4'])

  const handleDragEnd = (event) => {
    const {active, over} = event

    if (active.id !== over.id) {
      setIngredientList((items) => {
        const oldIndex = items.indexOf(active.id)
        const newIndex = items.indexOf(over.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }


  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={
          <div className="flex items-center gap-2">
            <span className="mr-4 font-bold ">
              Add Recipe
            </span>
          </div>
        }
      />
      <AppSidebar />
      <main className="w-full mt-14 mx-auto">
        <PageLayout>
          <div className="grid w-full items-center gap-2 mb-4">
            <Label htmlFor="recipe-title" className="font-bold">Recipe title</Label>
            <Input type="text" id="recipe-title" />
          </div>

          <div className="grid w-full items-center gap-2 mb-4">
            <Label className="font-bold">Ingredients</Label>
            <DndContext onDragEnd={handleDragEnd}>
              <ul className="grid gap-2">
                <SortableContext items={ingredientList}>
                  {ingredientList.map((id) => (
                    <SortableInput key={id} id={id}/>
                  ))}
                </SortableContext>
              </ul>
            </DndContext>
          </div>
        </PageLayout>
      </main>
    </div>
  );
}
