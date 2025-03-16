'use client'

import { useRouter } from 'next/navigation'
import { X, ListPlus } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout, SortableList, IconButton } from '@/components/custom'

export default function Add() {
  const { toggleSidebar } = useSidebar()
  const router = useRouter()

  const handleClosePage = () => {
    if (document.referrer.startsWith('https://balzss.github.io/knyh/')) {
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

          <SortableList
            label="Something Strange"
            initialItems={['1 tbsp of salt', '3 drops of water']}
            onItemsChange={(newItems) => console.log({ newItems })}
          />

          <div>
            <Button variant="outline">
              <ListPlus />
              Create new ingredient group
            </Button>
          </div>
        </PageLayout>
      </main>
    </div>
  )
}
