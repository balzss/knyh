import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type LoaderProps = {
  className?: string
  size?: number
}

export function Loader({ className, size = 24 }: LoaderProps) {
  return (
    <div className={cn('col-span-full flex items-center justify-center py-20', className)}>
      <LoaderCircle size={size} className="animate-spin text-muted-foreground" />
    </div>
  )
}
