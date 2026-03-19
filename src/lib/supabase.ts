import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://eirpkjsqnbiqpugwalar.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabaseConfig) {
  console.warn(
    'Supabase is not fully configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable auth.',
  )
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function assertSupabaseConfigured() {
  if (!supabase) {
    throw new Error('Supabase nao configurado. Defina VITE_SUPABASE_ANON_KEY no .env.')
  }
}
