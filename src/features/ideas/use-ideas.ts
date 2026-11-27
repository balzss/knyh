import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useEditMode } from '@/app/providers/EditModeProvider'
import type { Idea, Recipe } from '@shared/types'

type IdeaInput = { title: string; notes?: string[] }

/**
 * Hook to fetch the ideas, best first. They are only readable in edit mode.
 */
export const useIdeas = () => {
  const { editor } = useEditMode()
  const {
    data: ideas,
    isPending: loading,
    error,
  } = useQuery({
    queryKey: ['ideas'],
    queryFn: () => api<Idea[]>('/api/ideas'),
    enabled: editor,
  })

  return { ideas: ideas || [], loading, error }
}

/**
 * Hook for idea mutations. Each one writes its result to the cache instead of refetching, so
 * cards being edited are not overwritten by stale server data.
 */
export const useIdeaMutations = () => {
  const queryClient = useQueryClient()
  const setIdeas = (update: (ideas: Idea[]) => Idea[]) =>
    queryClient.setQueryData<Idea[]>(['ideas'], (ideas) => update(ideas ?? []))

  const createIdea = useMutation({
    mutationFn: (input: IdeaInput) => api<Idea>('/api/ideas', { method: 'POST', json: input }),
    onSuccess: (idea) => setIdeas((ideas) => [idea, ...ideas]),
  })

  const updateIdea = useMutation({
    mutationFn: ({ id, ...input }: IdeaInput & { id: string }) =>
      api<Idea>(`/api/ideas/${id}`, { method: 'PUT', json: input }),
    onSuccess: (idea) => setIdeas((ideas) => ideas.map((i) => (i.id === idea.id ? idea : i))),
  })

  const deleteIdea = useMutation({
    mutationFn: (id: string) => api<{ message: string }>(`/api/ideas/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => setIdeas((ideas) => ideas.filter((i) => i.id !== id)),
  })

  const reorderIdeas = useMutation({
    mutationFn: (ids: string[]) =>
      api<Idea[]>('/api/ideas/order', { method: 'PUT', json: { ids } }),
    // Show the new order right away, then settle on the server's answer
    onMutate: (ids) => {
      const previous = queryClient.getQueryData<Idea[]>(['ideas'])
      setIdeas((ideas) => ids.flatMap((id) => ideas.filter((i) => i.id === id)))
      return { previous }
    },
    onError: (_error, _ids, context) => queryClient.setQueryData(['ideas'], context?.previous),
    onSuccess: (ideas) => queryClient.setQueryData(['ideas'], ideas),
  })

  const developIdea = useMutation({
    mutationFn: (id: string) => api<Recipe>(`/api/ideas/${id}/develop`, { method: 'POST' }),
    onSuccess: (_recipe, id) => {
      setIdeas((ideas) => ideas.filter((i) => i.id !== id))
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })

  const restoreIdea = useMutation({
    mutationFn: (input: { recipeId: string; idea: Idea; index: number }) =>
      api<Idea[]>('/api/ideas/restore', { method: 'POST', json: input }),
    onSuccess: (ideas) => {
      queryClient.setQueryData(['ideas'], ideas)
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
  })

  return { createIdea, updateIdea, deleteIdea, reorderIdeas, developIdea, restoreIdea }
}
