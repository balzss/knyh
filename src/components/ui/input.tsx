import * as React from "react"

import { cn } from "@/lib/utils"

// TODO: Remove this workaround once Chrome Android fixes the password manager popup issue
// https://github.com/chromium/chromium/issues/...
function useAndroidChromeWorkaround() {
  const [isAndroidChrome, setIsAndroidChrome] = React.useState(false)
  
  React.useEffect(() => {
    // Only apply workaround on mobile Android Chrome to minimize a11y impact
    const userAgent = navigator.userAgent
    const isAndroid = /Android/i.test(userAgent)
    const isChrome = /Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)
    const isMobile = window.innerWidth < 768 // tablet and below
    
    setIsAndroidChrome(isAndroid && isChrome && isMobile)
  }, [])
  
  return isAndroidChrome
}

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const isAndroidChrome = useAndroidChromeWorkaround()
    
    // Workaround: Use type="search" on Android Chrome to prevent password manager popup
    // Only apply to text-like inputs that would trigger the issue
    const shouldApplyWorkaround = isAndroidChrome && 
      (type === 'text' || type === 'number' || type === 'tel' || type === 'url' || type === 'email' || !type)
    
    const effectiveType = shouldApplyWorkaround ? 'search' : type
    
    return (
      <input
        type={effectiveType}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          // Remove search input styling when using workaround
          shouldApplyWorkaround && "[&::-webkit-search-decoration]:appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
