import { useState } from 'react'
import { useTranslations } from 'use-intl'
import { Checkbox } from '@/components/ui/checkbox'
import { ScaleDialog } from '@/features/recipes/components/ScaleDialog'
import { formatAmount } from '@/features/recipes/lib/scale-quantity'
import { ScaledText } from './ScaledText'
import type { GroupData } from '@shared/types'

type IngredientListProps = {
  groups: GroupData[]
  factor: number
  separator: ',' | '.'
  onFactorChange: (factor: number) => void
  scaleOpen: boolean
  onScaleOpenChange: (open: boolean) => void
}

export function IngredientList({
  groups,
  factor,
  separator,
  onFactorChange,
  scaleOpen,
  onScaleOpenChange,
}: IngredientListProps) {
  const t = useTranslations('RecipeView')
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())

  const handleIngredientCheckChange = (checked: boolean, index: number) => {
    setCheckedIngredients((prev) => {
      const newChecked = new Set(prev)
      if (checked) {
        newChecked.add(index)
      } else {
        newChecked.delete(index)
      }
      return newChecked
    })
  }

  const hasIngredients = groups.some((group) => group.items.length > 0)

  return (
    <div className="flex flex-col gap-1">
      {hasIngredients && (
        <div className="flex items-center justify-between mt-4">
          <h2 className="text-xl text-muted-foreground">{t('ingredients')}</h2>
          <div className="flex items-center gap-1">
            {factor !== 1 && (
              <button
                type="button"
                onClick={() => onFactorChange(1)}
                aria-label={t('resetAmounts')}
                title={t('resetAmounts')}
                className="text-primary text-sm font-medium px-1"
              >
                ×{formatAmount(factor, separator)}
              </button>
            )}
          </div>
        </div>
      )}
      <ScaleDialog
        open={scaleOpen}
        onOpenChange={onScaleOpenChange}
        factor={factor}
        onApply={onFactorChange}
      />
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-4">
          {group.label && <h3 className="font-medium text-lg mb-2">{group.label}</h3>}
          <ul>
            {group.items.map((ingredient, itemIndex) => {
              const globalIndex = groupIndex * 1000 + itemIndex // Simple way to create unique indices
              return (
                <li key={globalIndex} className="flex items-center space-x-2 text-md leading-8">
                  <Checkbox
                    id={`ingredient-${globalIndex}`}
                    checked={checkedIngredients.has(globalIndex)}
                    onCheckedChange={(checked) =>
                      handleIngredientCheckChange(checked as boolean, globalIndex)
                    }
                    className={
                      checkedIngredients.has(globalIndex)
                        ? 'data-[state=checked]:bg-muted-foreground data-[state=checked]:text-black border-muted-foreground'
                        : ''
                    }
                  />
                  <label
                    htmlFor={`ingredient-${globalIndex}`}
                    className={`${checkedIngredients.has(globalIndex) ? 'text-muted-foreground line-through' : ''}`}
                  >
                    <ScaledText text={ingredient} factor={factor} separator={separator} />
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
