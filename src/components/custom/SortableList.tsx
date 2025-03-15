// import { useState } from 'react'
// import { AnimatePresence } from 'motion/react'
// import { nanoid } from 'nanoid'
// import { Label } from '@/components/ui/label'
// import { DndContext, DragEndEvent, Modifier } from '@dnd-kit/core'
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable'
//
// type SortableListProps = {
//   label: string
//   items: string[]
//   onItemsChange: (newItems: string[]) => void
// }
//
// const ingredientListGapPx = 8 // TODO
//
// const restrictToParentElementCustom: Modifier = ({
//   containerNodeRect,
//   draggingNodeRect,
//   transform,
// }) => {
//   if (!draggingNodeRect || !containerNodeRect) {
//     return transform
//   }
//
//   let y = transform.y
//   const bottomOffset = draggingNodeRect.height + ingredientListGapPx
//   if (containerNodeRect.top > draggingNodeRect.top + transform.y) {
//     y = containerNodeRect.top - draggingNodeRect.top
//   } else if (
//     containerNodeRect.bottom - bottomOffset <
//     draggingNodeRect.bottom + transform.y
//   ) {
//     y = containerNodeRect.bottom - draggingNodeRect.bottom - bottomOffset
//   }
//   return {
//     ...transform,
//     x: 0,
//     y,
//   }
// }
//
// export function SortableList({
//   label,
//   items,
//   onItemsChange,
// }: SortableListProps) {
//
//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event
//
//     if (active.id !== over?.id) {
//       setIngredientList((items) => {
//         const oldIndex = items.findIndex((item) => item.id === active.id)
//         const newIndex = items.findIndex((item) => item.id === over?.id)
//         return arrayMove(items, oldIndex, newIndex)
//       })
//     }
//   }
//
//   return (
//     <div>
//       <div className="grid w-full items-center gap-2 mb-4">
//         <Label className="font-bold">{label}</Label>
//         <DndContext
//           onDragEnd={handleDragEnd}
//           modifiers={[restrictToParentElementCustom]}
//           id="dnd-context"
//         >
//           <ul className={`grid gap-[0.5rem]`}>
//             <SortableContext
//               items={ingredientList}
//               strategy={verticalListSortingStrategy}
//             >
//               <AnimatePresence>
//                 {ingredientList.map(({ value, id, autoFocus }, index) => (
//                   <SortableInput
//                     key={id}
//                     id={id}
//                     value={value}
//                     inputRef={(el) => (ingredientInputRefs.current[id] = el)}
//                     onChange={(e) => handleIngredientItemChange(e, id)}
//                     onRemoveSelf={() => handleRemoveIngredient(id)}
//                     newItemMode={index === ingredientList.length - 1}
//                     onFocus={() => setFocusedIngredientId(id)}
//                     onKeyDown={(e) => handleIngredientItemKeydown(e, id)}
//                     autoFocus={autoFocus}
//                     noAnimate={ingredientList.length <= 1}
//                   />
//                 ))}
//               </AnimatePresence>
//             </SortableContext>
//           </ul>
//         </DndContext>
//       </div>
//     </div>
//   )
// }
