import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Checkbox } from '@/components/ui/checkbox'
import { X, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/custom'

type CheckedItemsListProps = {
  items: string[]
  onItemUnchecked: (item: string) => void
  onItemRemoved: (item: string) => void
  className?: string
  checkedItemsLabel?: string
  removeItemTooltip?: string
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

  if (items.length === 0) {
    return null
  }

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
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <motion.ul className="grid gap-2 overflow-hidden mt-2">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.li
                    key={item}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="relative flex items-center max-w-2xl w-full">
                      <span className="ml-8 p-2 absolute left-0 top-0 bottom-0 flex items-center gap-2">
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => onItemUnchecked(item)}
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
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
