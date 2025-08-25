import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import crypto from 'crypto'
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shuffles an array using the Fisher-Yates algorithm and returns a new array.
 * @param array The array to shuffle.
 * @returns A new array with the elements shuffled randomly.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array] // Create a shallow copy
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]] // Swap elements
  }
  return newArray
}

/**
 * Generates a cryptographically secure 8-character string using a-z and 0-9.
 */
export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const randomBytes = crypto.randomBytes(8)
  let result = ''
  for (let i = 0; i < 8; i++) {
    // Map each random byte to a character in our set
    result += chars[randomBytes[i] % chars.length]
  }
  return result
}

export function getErrorMessage(err: unknown, fallback = 'Unknown error'): string {
  if (err instanceof Error && typeof err.message === 'string') return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const possible = (err as Record<string, unknown>).message
    if (typeof possible === 'string') return possible
  }
  return fallback
}

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
export const dataJsonPath = `data/data.json`
export const clientDataPath = `${basePath}/${dataJsonPath}`
export const serverDataPath = `public/${dataJsonPath}`

// Timestamps
export const DEFAULT_TIMESTAMP = '1970-01-01-00:00'
export function formatTimestamp(date: Date = new Date()): string {
  try {
    return format(date, 'yyyy-MM-dd-HH:mm')
  } catch {
    return DEFAULT_TIMESTAMP
  }
}

// Re-export recipe parsing utilities (barrel style)
export { parseMarkdown, parseSingleRecipe, recipeToMarkdown } from './recipe-utils'

/**
 * Generates initials from a name or fallback identifier
 * @param name The user's name
 * @param fallback Fallback identifier (like userId)
 * @returns Up to 2 initials in uppercase
 */
export function generateInitials(name?: string, fallback?: string): string {
  const source = name || fallback || 'User'

  // Split by spaces and take first letter of each word (max 2)
  const words = source.trim().split(/\s+/)
  const initials = words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  // If we only have one word, take first 2 characters
  if (initials.length === 1 && source.length > 1) {
    return source.slice(0, 2).toUpperCase()
  }

  return initials || 'U'
}
