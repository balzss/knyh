import { Skeleton } from '@/components/ui/skeleton'

type ListSkeletonProps = {
  rows?: number
}

export function ListSkeleton({ rows = 6 }: ListSkeletonProps) {
  return (
    <div className="grid gap-2 max-w-2xl w-full" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  )
}
