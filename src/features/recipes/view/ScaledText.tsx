import { scaleLine } from '@/features/recipes/lib/scale-quantity'

/** Text with its scaled leading amount highlighted, so it's clear it isn't the original */
export function ScaledText({
  text,
  factor,
  separator,
}: {
  text: string
  factor: number
  separator: ',' | '.'
}) {
  const { amount, rest } = scaleLine(text, factor, separator)
  return (
    <>
      {amount && <span className="text-primary">{amount}</span>}
      {rest}
    </>
  )
}
