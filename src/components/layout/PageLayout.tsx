import { Loader } from './Loader'

type LayoutVariant = 'list' | 'grid'
type PageLayoutProps = {
  title?: string
  variant?: LayoutVariant
  maxCols?: number
  children: React.ReactNode
  className?: string
  loading?: boolean
  skeleton?: React.ReactNode
}

function getLayout(variant: LayoutVariant, maxCols: number) {
  if (variant === 'list') {
    return 'max-w-2xl grid-cols-1'
  }

  const gridClasses: { [key: number]: string } = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: '2xl:grid-cols-5',
  }

  let classes = ''
  for (let i = 3; i <= maxCols; i++) {
    if (gridClasses[i]) {
      classes += `${gridClasses[i]} `
    }
  }

  return `grid-cols-2 ${classes} max-w-7xl`
}

export function PageLayout({
  title,
  variant = 'list',
  children,
  maxCols = 5,
  className = '',
  loading = false,
  skeleton,
}: PageLayoutProps) {
  if (loading && !skeleton) return <Loader />

  return (
    <div className={`gap-3 p-3 w-full mx-auto grid ${getLayout(variant, maxCols)} ${className}`}>
      {title && (
        <h1 className="col-span-full scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {title}
        </h1>
      )}
      {loading ? skeleton : children}
    </div>
  )
}
