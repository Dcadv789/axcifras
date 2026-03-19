interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_AXCIFRAS_API_URL?: string
  readonly VITE_AXCIFRAS_SCHEMA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
