// Environment configuration for data layer
export const isStaticExport = process.env.NEXT_OUTPUT_MODE === 'export'
export const isDevelopment = process.env.NODE_ENV === 'development'

// Use SQLite in development/production, localStorage for static exports
export const useDatabase =
  !isStaticExport && (isDevelopment || process.env.NODE_ENV === 'production')

// Data modes: 'sqlite' for server-side DB, 'localStorage' for client-side persistence in static exports
export const dataMode = useDatabase ? 'sqlite' : 'localStorage'

console.log(`🔧 Data mode: ${dataMode} (static export: ${isStaticExport}, dev: ${isDevelopment})`)

// Client-side runtime detection for static exports
export const isClientStaticExport = () => {
  // If we know it's a static export at build time, use that
  if (isStaticExport) return true

  // Runtime fallback: if we're in browser and there's no /api route available,
  // we're likely in a static export environment (like GitHub Pages)
  if (typeof window !== 'undefined') {
    // Check if we're on a domain that suggests static hosting
    const hostname = window.location.hostname
    if (
      hostname.includes('github.io') ||
      hostname.includes('netlify.app') ||
      hostname.includes('vercel.app')
    ) {
      return true
    }
  }

  return false
}
