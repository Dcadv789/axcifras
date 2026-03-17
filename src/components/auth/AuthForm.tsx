import { useState } from 'react'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onSubmit: (email: string, password: string) => Promise<void>
  isBusy: boolean
  authMode: 'supabase' | 'demo'
}

export function AuthForm({ mode, onSubmit, isBusy, authMode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form
      className="glass-panel w-full rounded-[30px] p-6 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault()
        void onSubmit(email, password)
      }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">AxPiano</div>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            {mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </h2>
        </div>
        <div className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs text-gold">
          {authMode === 'supabase' ? 'Supabase ativo' : 'Fallback local'}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-mist">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-ink outline-none transition focus:border-gold/60"
            placeholder="voce@exemplo.com"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-mist">Senha</span>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-ink outline-none transition focus:border-gold/60"
            placeholder="Min. 6 caracteres"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isBusy}
        className="mt-6 w-full rounded-2xl bg-gold px-4 py-3 font-medium text-night transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isBusy ? 'Processando...' : mode === 'signin' ? 'Entrar no AxPiano' : 'Criar conta'}
      </button>

      <p className="mt-4 text-sm leading-6 text-mist">
        {authMode === 'supabase'
          ? 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para autenticação real por email e senha.'
          : 'Sem credenciais do Supabase, o app mantém a autenticação em modo local para prototipação.'}
      </p>
    </form>
  )
}
