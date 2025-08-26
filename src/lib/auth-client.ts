import { createAuthClient } from 'better-auth/react'
import { basePath } from '@/lib/utils'

const authClient = createAuthClient({
  basePath: `${basePath}/api/auth`,
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  deleteUser,
  changePassword,
  changeEmail,
  updateUser,
} = authClient
