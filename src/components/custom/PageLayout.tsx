type LayoutVariant = 'list' | 'grid'
type PageLayoutProps = {
  title?: string
  variant?: LayoutVariant
  maxCols?: number
  children: React.ReactNode
}

function getLayout(variant: LayoutVariant, maxCols: number) {
  if (variant === 'list') {
    return 'max-w-2xl grid-cols-1'
  }
  return `grid-cols-2 lg:grid-cols-${Math.min(3, maxCols)} xl:grid-cols-${Math.min(4, maxCols)} 2xl:grid-cols-${Math.min(5, maxCols)} max-w-7xl`
}

export function PageLayout({ title, variant = 'list', children, maxCols = 5 }: PageLayoutProps) {
  return (
    <div className={`gap-3 p-3 w-full mx-auto grid ${getLayout(variant, maxCols)}`}>
      {title && (
        <h1 className="col-span-full scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {title}
        </h1>
      )}
      {children}
    </div>
  )
}
