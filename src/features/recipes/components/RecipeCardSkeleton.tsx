import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function RecipeCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 p-3 sm:p-4" aria-hidden>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-[22px] w-16 rounded-full my-[3px]" />
    </Card>
  )
}
