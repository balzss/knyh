'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useSidebar } from '@/components/ui/sidebar'
import { TopBar } from '@/components/TopBar'
import { AppSidebar, PageLayout } from '@/components/custom'
import { SortableList } from '@/components/custom'
import { useShoppingList, useShoppingListMutations } from '@/hooks'
import type { ShoppingListItem } from '@/lib/types'

export default function ShoppingList() {
  const t = useTranslations('ShoppingListPage')
  const { toggleSidebar } = useSidebar()
  const { shoppingList, loading } = useShoppingList()
  const { updateShoppingList } = useShoppingListMutations()

  // Track the current state of items including their checked status
  const [items, setItems] = useState<string[]>([])
  const checkedStateRef = useRef<Map<string, boolean>>(new Map())

  // Update items when data loads from the database
  useEffect(() => {
    if (!loading && shoppingList) {
      const newItems = shoppingList.map((item) => item.text)
      const newCheckedStates = new Map<string, boolean>()

      shoppingList.forEach((item) => {
        newCheckedStates.set(item.text, item.checked)
      })

      setItems(newItems)
      checkedStateRef.current = newCheckedStates
    }
  }, [shoppingList, loading])

  // Debounce the database updates
  const updateTimeoutRef = useRef<NodeJS.Timeout>()

  // Handle items change from SortableList
  const handleItemsChange = useCallback(
    (newItems: string[]) => {
      setItems(newItems)

      // Clear existing timeout and set a new one to debounce saves
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }

      updateTimeoutRef.current = setTimeout(() => {
        const newShoppingList: ShoppingListItem[] = newItems.map((text) => ({
          text,
          checked: checkedStateRef.current.get(text) || false,
        }))

        updateShoppingList.mutateAsync(newShoppingList).catch((error) => {
          console.error('Failed to update shopping list:', error)
        })
      }, 500) // 500ms debounce
    },
    [updateShoppingList]
  )

  // Note: The SortableList component manages checked states internally.
  // For now, we're persisting the basic structure. To sync checked states,
  // we'd need to modify SortableList to expose checked state changes.

  if (loading) {
    return (
      <div className="flex w-full">
        <TopBar
          onSidebarToggle={toggleSidebar}
          customTopbarContent={
            <div className="flex items-center gap-2">
              <span className="mr-4 font-bold">{t('title')}</span>
            </div>
          }
        />
        <AppSidebar path="/shopping-list" />
        <main className="w-full mt-16 mx-auto">
          <PageLayout>
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </PageLayout>
        </main>
      </div>
    )
  }

  return (
    <div className="flex w-full">
      <TopBar
        onSidebarToggle={toggleSidebar}
        customTopbarContent={
          <div className="flex items-center gap-2">
            <span className="mr-4 font-bold">{t('title')}</span>
          </div>
        }
      />
      <AppSidebar path="/shopping-list" />
      <main className="w-full mt-16 mx-auto">
        <PageLayout>
          <SortableList
            addItemLabel="Add item"
            items={items}
            onItemsChange={handleItemsChange}
            checkable
          />
        </PageLayout>
      </main>
    </div>
  )
}
