import { useState } from 'react'
import { useTranslations } from 'use-intl'

export function InstructionList({ instructions }: { instructions: string[] }) {
  const t = useTranslations('RecipeView')
  const [selectedInstruction, setSelectedInstruction] = useState<number>(-1)

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl text-muted-foreground mt-4">{t('instructions')}</h2>
      <ol className={` flex flex-col gap-3 ml-4 list-[x]`}>
        {instructions.map((instruction, index) => (
          <li
            key={index}
            className={`${selectedInstruction === index ? `relative list-none before:content-['★'] before:absolute before:-left-5 text-primary` : selectedInstruction > -1 ? 'text-muted-foreground' : ''} flex items-center text-md leading-6 list-item transition duration-150 ${selectedInstruction > index ? 'line-through' : ''}`}
            onClick={() => setSelectedInstruction((prev) => (prev === index ? -1 : index))}
          >
            {instruction}
          </li>
        ))}
      </ol>
    </div>
  )
}
