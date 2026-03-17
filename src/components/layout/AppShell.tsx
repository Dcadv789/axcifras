import type { PropsWithChildren, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface AppShellProps extends PropsWithChildren {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const { user, authMode, signOut } = useAuth()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-4 py-4 text-ink sm:px-6 lg:px-8">
      <header className="glass-panel mb-6 rounded-[28px] px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-mist">
              <Link
                to="/"
                className="rounded-full border border-white/10 px-3 py-1 transition hover:border-gold/40 hover:text-gold"
              >
                AxPiano
              </Link>
              <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-gold">
                {authMode === 'supabase' ? 'Supabase Auth' : 'Modo demo local'}
              </span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-mist sm:text-base">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-mist">
              <div className="text-xs uppercase tracking-[0.22em] text-white/45">Conta</div>
              <div className="mt-1 text-sm text-ink">{user?.email}</div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              {actions}
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-mist transition hover:border-white/20 hover:text-ink"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
