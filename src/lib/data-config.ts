// Environment configuration for data layer
export const isStaticExport = process.env.NEXT_OUTPUT_MODE === 'export'
export const isDevelopment = process.env.NODE_ENV === 'development'

// Use SQLite in development/production, JSON for static exports
export const useDatabase = !isStaticExport && (isDevelopment || process.env.NODE_ENV === 'production')

export const dataMode = useDatabase ? 'sqlite' : 'json'

console.log(`🔧 Data mode: ${dataMode} (static export: ${isStaticExport}, dev: ${isDevelopment})`)
