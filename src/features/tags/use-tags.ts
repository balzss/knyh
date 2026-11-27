import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Tag } from '@shared/types'

type UseTagsProps = {
  ids?: string[]
}

const NO_TAGS: Tag[] = []

export const useTags = ({ ids }: UseTagsProps = {}) => {
  const {
    data,
    isPending: loading,
    error,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api<Tag[]>('/api/tags'),
  })

  // Callers pass a fresh array every render, so key the filter on its contents.
  const idKey = ids?.join(',')
  const tags = useMemo(() => {
    const all = data ?? NO_TAGS
    if (idKey === undefined) return all
    const idSet = new Set(idKey.split(','))
    return all.filter((tag) => idSet.has(tag.id))
  }, [data, idKey])

  return { tags, loading, error }
}
