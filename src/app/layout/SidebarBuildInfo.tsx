import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const buildTime = new Date(__BUILD_TIME__).toLocaleString([], {
  dateStyle: 'medium',
  timeStyle: 'short',
})

/** The short commit hash of this build, with the build time on tap */
export function SidebarBuildInfo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full px-2 text-center text-xs text-muted-foreground"
          title={buildTime}
        >
          {__BUILD_SHA__}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-auto px-3 py-2 text-xs">
        {buildTime}
      </PopoverContent>
    </Popover>
  )
}
