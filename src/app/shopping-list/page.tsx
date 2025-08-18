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
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const checkedStateRef = useRef<Map<string, boolean>>(new Map())

  // Update items when data loads from the database
  useEffect(() => {
    if (!loading && shoppingList) {
      const newItems = shoppingList.map((item) => item.text)
      const newCheckedStates = new Map<string, boolean>()
      const newCheckedItems: string[] = []

      shoppingList.forEach((item) => {
        newCheckedStates.set(item.text, item.checked)
        if (item.checked) {
          newCheckedItems.push(item.text)
        }
      })

      setItems(newItems)
      setCheckedItems(newCheckedItems)
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

  // Handle checked state changes from SortableList
  const handleItemCheckedChange = useCallback(
    (item: string, checked: boolean) => {
      // Update local state immediately
      checkedStateRef.current.set(item, checked)

      // Only update React state if the checked state actually changed
      setCheckedItems((prev) => {
        const isCurrentlyChecked = prev.includes(item)
        if (checked === isCurrentlyChecked) {
          return prev // No change needed
        }

        return checked
          ? [...prev, item] // Add if not present
          : prev.filter((i) => i !== item) // Remove if present
      })

      // Clear existing timeout and set a new one to debounce saves
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }

      updateTimeoutRef.current = setTimeout(() => {
        const newShoppingList: ShoppingListItem[] = items.map((text) => ({
          text,
          checked: checkedStateRef.current.get(text) || false,
        }))

        updateShoppingList.mutateAsync(newShoppingList).catch((error) => {
          console.error('Failed to update shopping list:', error)
        })
      }, 300) // Shorter debounce for checked state changes
    },
    [items, updateShoppingList]
  )

  // Note: We're now syncing both item changes and checked state changes
  // with proper debouncing for optimal user experience.

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
            onItemCheckedChange={handleItemCheckedChange}
            checkedItems={checkedItems}
            checkable
          />
        </PageLayout>
      </main>
    </div>
  )
}
