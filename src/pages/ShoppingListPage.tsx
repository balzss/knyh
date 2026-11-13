import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'use-intl'
import { MoreVertical, Trash2, RotateCcw, CheckCheck } from 'lucide-react'
import { TopBar, AppSidebar, PageLayout, IconButton, EditorOnly } from '@/components/custom'
import { SortableList, CheckedItemsList } from '@/components/custom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useShoppingList, useShoppingListMutations } from '@/hooks'
import type { ShoppingListItem } from '@/lib/types'

export default function ShoppingListPage() {
  const t = useTranslations('ShoppingListPage')
  const { shoppingList, loading } = useShoppingList()
  const { updateShoppingList } = useShoppingListMutations()

  // Track unchecked and checked items separately
  const [uncheckedItems, setUncheckedItems] = useState<string[]>([])
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  // Update items when data loads from the database
  useEffect(() => {
    if (!loading && shoppingList) {
      const unchecked: string[] = []
      const checked: string[] = []

      shoppingList.forEach((item) => {
        if (item.checked) {
          checked.push(item.text)
        } else {
          unchecked.push(item.text)
        }
      })

      setUncheckedItems(unchecked)
      setCheckedItems(checked)
    }
  }, [shoppingList, loading])

  const saveToDatabase = useCallback(
    (unchecked: string[], checked: string[]) => {
      const newShoppingList: ShoppingListItem[] = [
        ...unchecked.map((text) => ({ text, checked: false })),
        ...checked.map((text) => ({ text, checked: true })),
      ]
      updateShoppingList.mutateAsync(newShoppingList).catch((error) => {
        console.error('Failed to update shopping list:', error)
      })
    },
    [updateShoppingList]
  )

  // Handle unchecked items change from SortableList (typing, reorder, add, remove)
  // Saves immediately on structural changes (add, remove, reorder), not on typing
  const handleUncheckedItemsChange = useCallback(
    (newItems: string[]) => {
      const isTyping =
        newItems.length === uncheckedItems.length &&
        newItems.filter((item, i) => item !== uncheckedItems[i]).length === 1
      setUncheckedItems(newItems)
      if (!isTyping) {
        saveToDatabase(newItems, checkedItems)
      }
    },
    [uncheckedItems, checkedItems, saveToDatabase]
  )

  // Save when user finishes editing an item (blur)
  const handleUncheckedItemsBlur = useCallback(
    (newItems: string[]) => {
      setUncheckedItems(newItems)
      saveToDatabase(newItems, checkedItems)
    },
    [checkedItems, saveToDatabase]
  )

  // Handle checking an item (move from unchecked to checked)
  const handleItemChecked = useCallback(
    (item: string) => {
      const newUncheckedItems = uncheckedItems.filter((i) => i !== item)
      const newCheckedItems = [...checkedItems, item]

      setUncheckedItems(newUncheckedItems)
      setCheckedItems(newCheckedItems)
      saveToDatabase(newUncheckedItems, newCheckedItems)
    },
    [uncheckedItems, checkedItems, saveToDatabase]
  )

  // Handle unchecking an item (move from checked to unchecked)
  const handleItemUnchecked = useCallback(
    (item: string) => {
      const newCheckedItems = checkedItems.filter((i) => i !== item)
      const newUncheckedItems = [...uncheckedItems, item]

      setCheckedItems(newCheckedItems)
      setUncheckedItems(newUncheckedItems)
      saveToDatabase(newUncheckedItems, newCheckedItems)
    },
    [checkedItems, uncheckedItems, saveToDatabase]
  )

  // Handle removing a checked item completely
  const handleCheckedItemRemoved = useCallback(
    (item: string) => {
      const newCheckedItems = checkedItems.filter((i) => i !== item)
      setCheckedItems(newCheckedItems)
      saveToDatabase(uncheckedItems, newCheckedItems)
    },
    [checkedItems, uncheckedItems, saveToDatabase]
  )

  // Handle clearing the entire list
  const handleClearList = useCallback(() => {
    setUncheckedItems([])
    setCheckedItems([])
    saveToDatabase([], [])
  }, [saveToDatabase])

  // Handle unchecking all items (move all checked items to unchecked)
  const handleUncheckAll = useCallback(() => {
    const allItems = [...uncheckedItems, ...checkedItems]
    setUncheckedItems(allItems)
    setCheckedItems([])
    saveToDatabase(allItems, [])
  }, [uncheckedItems, checkedItems, saveToDatabase])

  // Handle removing all checked items
  const handleRemoveChecked = useCallback(() => {
    setCheckedItems([])
    saveToDatabase(uncheckedItems, [])
  }, [uncheckedItems, saveToDatabase])

  const shoppingListContent = (
    <div className="flex w-full">
      {loading ? (
        <>
          <TopBar
            customTopbarContent={
              <div className="flex items-center gap-2 justify-between w-full">
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
        </>
      ) : (
        <>
          <TopBar
            customTopbarContent={
              <div className="flex items-center gap-2 justify-between w-full">
                <span className="mr-4 font-bold">{t('title')}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <IconButton
                      icon={<MoreVertical />}
                      tooltip={t('moreOptions')}
                      variant="ghost"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleClearList}
                      disabled={shoppingList.length === 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('clearList')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleUncheckAll}
                      disabled={checkedItems.length === 0}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {t('uncheckAll')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleRemoveChecked}
                      disabled={checkedItems.length === 0}
                    >
                      <CheckCheck className="mr-2 h-4 w-4" />
                      {t('removeChecked')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            }
          />
          <AppSidebar path="/shopping-list" />
          <main className="w-full mt-16 mx-auto">
            <PageLayout>
              <div className="space-y-4">
                <SortableList
                  addItemLabel={t('addItem')}
                  items={uncheckedItems}
                  onItemsChange={handleUncheckedItemsChange}
                  onItemBlur={handleUncheckedItemsBlur}
                  showCheckboxes={true}
                  onItemChecked={handleItemChecked}
                />

                {checkedItems.length > 0 && (
                  <CheckedItemsList
                    items={checkedItems}
                    onItemUnchecked={handleItemUnchecked}
                    onItemRemoved={handleCheckedItemRemoved}
                    checkedItemsLabel={t('checkedItems')}
                    removeItemTooltip={t('removeItem')}
                  />
                )}
              </div>
            </PageLayout>
          </main>
        </>
      )}
    </div>
  )

  return <EditorOnly>{shoppingListContent}</EditorOnly>
}
