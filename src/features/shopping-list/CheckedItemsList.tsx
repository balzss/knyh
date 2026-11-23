import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Checkbox } from '@/components/ui/checkbox'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/inputs/IconButton'

type CheckedItemsListProps = {
  items: string[]
  onItemUnchecked: (item: string) => void
  onItemRemoved: (item: string) => void
  className?: string
  checkedItemsLabel?: string
  removeItemTooltip?: string
}

const UNCHECK_DELAY_MS = 80

// Key by text plus occurrence so keys stay stable when items shift position
const itemKeys = (items: string[]) => {
  const seen = new Map<string, number>()
  return items.map((item) => {
    const n = seen.get(item) ?? 0
    seen.set(item, n + 1)
    return `${item}-${n}`
  })
}

export function CheckedItemsList({
  items,
  onItemUnchecked,
  onItemRemoved,
  className = '',
  checkedItemsLabel = 'Checked items',
  removeItemTooltip = 'Remove item',
}: CheckedItemsListProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [unchecking, setUnchecking] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  // Show the box clear before the row leaves
  const handleUncheck = (item: string) => {
    setUnchecking(item)
    timer.current = setTimeout(() => {
      setUnchecking(null)
      onItemUnchecked(item)
    }, UNCHECK_DELAY_MS)
  }

  if (items.length === 0) {
    return null
  }

  const keys = itemKeys(items)

  return (
    <div className={`grid w-full items-center ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-3 text-sm text-muted-foreground hover:text-foreground transition-colors font-normal justify-start hover:bg-transparent"
        type="button"
        variant="ghost"
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>
          {checkedItemsLabel} ({items.length})
        </span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <ul className="grid mt-2">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.li
                    key={keys[index]}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="relative flex items-center max-w-2xl w-full mb-2">
                      <span className="ml-8 p-2 absolute left-0 top-0 bottom-0 flex items-center gap-2">
                        <Checkbox
                          checked={unchecking !== item}
                          onCheckedChange={() => handleUncheck(item)}
                          className="data-[state=checked]:bg-muted-foreground data-[state=checked]:text-black border-muted-foreground"
                          id={`checked-${item}`}
                        />
                      </span>
                      <div className="pl-[4.25rem] pr-3 py-2 border-0 line-through text-muted-foreground w-full">
                        {item}
                      </div>
                      <span className="right-2 absolute">
                        <IconButton
                          iconSize="small"
                          variant="ghost"
                          icon={<X />}
                          tooltip={removeItemTooltip}
                          onClick={() => onItemRemoved(item)}
                          type="button"
                        />
                      </span>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
