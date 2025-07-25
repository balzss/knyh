import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import crypto from 'crypto'

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
