import { PrismaClient } from '@prisma/client'
import path from 'path'

// Normalize relative SQLite DATABASE_URL to absolute path so Prisma can open it
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  try {
    const filePath = process.env.DATABASE_URL.slice(5)
    if (filePath && !path.isAbsolute(filePath)) {
      const abs = path.join(process.cwd(), filePath)
      process.env.DATABASE_URL = `file:${abs}`
    }
  } catch (_e) {
    // If normalization fails, leave env as-is and let Prisma report the error.
    // This should be rare, but we avoid throwing during module init.
  }
}

// In Next.js (and other serverless) it's important to reuse the PrismaClient
// across module reloads to avoid exhausting database connections in dev.
declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
