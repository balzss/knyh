import { useEffect } from 'react'
import { useNavigationGuard } from '@/app/providers/NavigationGuardProvider'

interface UseFormNavigationGuardOptions {
  isDirty: boolean
  message: {
    title: string
    description: string
    confirmText: string
    cancelText: string
  }
}

export function useFormNavigationGuard({ isDirty, message }: UseFormNavigationGuardOptions) {
  const { setNavigationGuard } = useNavigationGuard()

  useEffect(() => {
    if (isDirty) {
      setNavigationGuard({
        shouldBlock: () => isDirty,
        message,
      })
    } else {
      setNavigationGuard(null)
    }

    return () => {
      setNavigationGuard(null)
    }
  }, [isDirty, message, setNavigationGuard])
}
