import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Recipe } from '@/lib/types'

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

export function getErrorMessage(err: unknown, fallback = 'Unknown error'): string {
  if (err instanceof Error && typeof err.message === 'string') return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const possible = (err as Record<string, unknown>).message
    if (typeof possible === 'string') return possible
  }
  return fallback
}

export { generateId } from './id'

// Re-export recipe parsing utilities (barrel style)
export { parseMarkdown, parseSingleRecipe, recipeToMarkdown } from './recipe-utils'

export function queryRecipes(recipes: Recipe[], query: string): Recipe[] {
  // Regex to strip diacritical marks for accent-insensitive search
  const diacriticsRegex = /[\u0300-\u036f]/g
  const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(diacriticsRegex, '')
  return recipes.filter((r) => normalize(r.title).includes(normalize(query)))
}
