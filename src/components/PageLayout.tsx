type PageLayoutProps = {
  title?: string
  variant?: 'list' | 'grid'
  children: React.ReactNode
}

const layouts = {
  list: 'max-w-2xl',
  grid: 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl-grid-cols-6 max-w-7xl',
}

export function PageLayout({
  title,
  variant = 'list',
  children,
}: PageLayoutProps) {
  return (
    <div
      className={`gap-3 p-3 w-full mx-auto grid grid-cols-1 ${layouts[variant]}`}
    >
      {title && (
        <h1 className="col-span-full scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          {title}
        </h1>
      )}
      {children}
    </div>
  )
}
