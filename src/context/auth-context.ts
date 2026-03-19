import { createContext } from 'react'

export interface AuthContextValue {
  email: string | null
  accessToken: string | null
  userId: string | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
