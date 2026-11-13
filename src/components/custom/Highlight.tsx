import React from 'react'
import { highlightSegments } from '@/lib/highlight'

type HighlightProps = {
  text: string
  term?: string
}

export function Highlight({ text, term = '' }: HighlightProps) {
  const segments = highlightSegments(text, term)
  return (
    <>
      {segments.map((seg, idx) =>
        seg.match ? (
          <mark key={idx} className="bg-primary/30 text-foreground">
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={idx}>{seg.text}</React.Fragment>
        )
      )}
    </>
  )
}
