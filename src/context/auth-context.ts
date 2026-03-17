import { createContext } from 'react'
import type { AuthResult, AuthUser } from '../types/song'

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  authMode: 'supabase' | 'demo'
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
