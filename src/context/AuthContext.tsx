import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { AuthUser } from '../types/song'
import { isSupabaseEnabled, supabase } from '../services/supabase'
import { AuthContext, type AuthContextValue } from './auth-context'

const MOCK_ACCOUNTS_KEY = 'axpiano.mock.accounts.v1'
const MOCK_SESSION_KEY = 'axpiano.mock.session.v1'

interface MockAccount {
  id: string
  email: string
  password: string
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function readMockAccounts() {
  const raw = window.localStorage.getItem(MOCK_ACCOUNTS_KEY)

  if (!raw) {
    return [] as MockAccount[]
  }

  try {
    return JSON.parse(raw) as MockAccount[]
  } catch {
    return []
  }
}

function writeMockAccounts(accounts: MockAccount[]) {
  window.localStorage.setItem(MOCK_ACCOUNTS_KEY, JSON.stringify(accounts))
}

function writeMockSession(user: AuthUser | null) {
  if (!user) {
    window.localStorage.removeItem(MOCK_SESSION_KEY)
    return
  }

  window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user))
}

function readMockSession() {
  const raw = window.localStorage.getItem(MOCK_SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    isSupabaseEnabled ? null : readMockSession(),
  )
  const [isLoading, setIsLoading] = useState(isSupabaseEnabled)

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      return
    }

    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return
      }

      const sessionUser = data.session?.user
      setUser(
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email ?? '',
            }
          : null,
      )
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user
      setUser(
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email ?? '',
            }
          : null,
      )
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      authMode: isSupabaseEnabled ? 'supabase' : 'demo',
      async signIn(email, password) {
        if (isSupabaseEnabled && supabase) {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            throw new Error(error.message)
          }

          return { message: null }
        }

        const account = readMockAccounts().find(
          (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
        )

        if (!account || account.password !== password) {
          throw new Error('Email ou senha inválidos.')
        }

        const mockUser = {
          id: account.id,
          email: account.email,
        }

        writeMockSession(mockUser)
        setUser(mockUser)
        return { message: 'Sessão local criada em modo demonstração.' }
      },
      async signUp(email, password) {
        if (isSupabaseEnabled && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          })

          if (error) {
            throw new Error(error.message)
          }

          if (data.session?.user) {
            return { message: null }
          }

          return {
            message: 'Conta criada. Se a confirmação por email estiver ativa, confirme antes de entrar.',
          }
        }

        const accounts = readMockAccounts()
        const alreadyExists = accounts.some(
          (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
        )

        if (alreadyExists) {
          throw new Error('Já existe uma conta local com este email.')
        }

        const account: MockAccount = {
          id: createId('user'),
          email,
          password,
        }

        accounts.push(account)
        writeMockAccounts(accounts)

        const mockUser = {
          id: account.id,
          email: account.email,
        }

        writeMockSession(mockUser)
        setUser(mockUser)
        return { message: 'Conta local criada em modo demonstração.' }
      },
      async signOut() {
        if (isSupabaseEnabled && supabase) {
          const { error } = await supabase.auth.signOut()

          if (error) {
            throw new Error(error.message)
          }

          return
        }

        writeMockSession(null)
        setUser(null)
      },
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
