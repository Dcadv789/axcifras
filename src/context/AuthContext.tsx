import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from './auth-context'
import { assertSupabaseConfigured, supabase } from '@/lib/supabase'
import { setPostgrestAuthToken, setPostgrestAuthUserId } from '@/services/postgrest'

export function AuthProvider({ children }: PropsWithChildren) {
  const [email, setEmail] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) {
      setPostgrestAuthToken(null)
      setPostgrestAuthUserId(null)
      return
    }

    let isActive = true

    const applySession = (session: Session | null) => {
      if (!isActive) {
        return
      }

      setEmail(session?.user.email ?? null)
      setAccessToken(session?.access_token ?? null)
      setUserId(session?.user.id ?? null)
      setPostgrestAuthToken(session?.access_token ?? null)
      setPostgrestAuthUserId(session?.user.id ?? null)
    }

    void supabase.auth.getSession().then(({ data }) => {
      applySession(data.session)
      if (isActive) {
        setIsLoading(false)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
      if (isActive) {
        setIsLoading(false)
      }
    })

    return () => {
      isActive = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      email,
      accessToken,
      userId,
      isLoading,
      async signIn(nextEmail, password) {
        assertSupabaseConfigured()
        const client = supabase
        if (!client) {
          throw new Error('Supabase nao configurado.')
        }
        const normalizedEmail = nextEmail.trim().toLowerCase()
        const { error } = await client.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })

        if (error) {
          throw new Error(error.message)
        }
      },
      signOut() {
        if (!supabase) {
          setEmail(null)
          setAccessToken(null)
          setUserId(null)
          setPostgrestAuthToken(null)
          setPostgrestAuthUserId(null)
          return
        }

        void supabase.auth.signOut()
      },
    }),
    [accessToken, email, isLoading, userId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
