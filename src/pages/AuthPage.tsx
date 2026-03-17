import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthForm } from '../components/auth/AuthForm'
import { useAuth } from '../hooks/useAuth'

export function AuthPage() {
  const { user, signIn, signUp, authMode } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [isBusy, setIsBusy] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1500px] items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
        <section className="glass-panel rounded-[34px] p-6 sm:p-10">
          <div className="max-w-3xl">
            <div className="rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-gold">
              Gerenciamento de cifras com visual de partitura
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              AxPiano organiza letra, compasso e cifra no mesmo fluxo visual.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-mist sm:text-lg">
              Edite o alinhamento das cifras sobre as sílabas corretas, visualize em uma grade moderna de
              compassos e entre em modo ao vivo com rolagem automática baseada no BPM.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ['Importação', 'Cole cifras tradicionais e transforme em linhas editáveis.'],
                ['Precisão', 'Arraste acordes para ajuste fino, com posição em pixels.'],
                ['Ao vivo', 'Use tela cheia e scroll automático para palco e ensaio.'],
              ].map(([label, text]) => (
                <div key={label} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/35">{label}</div>
                  <p className="mt-3 text-sm leading-6 text-mist">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <AuthForm
            mode={mode}
            authMode={authMode}
            isBusy={isBusy}
            onSubmit={async (email, password) => {
              setIsBusy(true)
              setError(null)
              setFeedback(null)

              try {
                const result =
                  mode === 'signin'
                    ? await signIn(email.trim(), password)
                    : await signUp(email.trim(), password)
                setFeedback(result.message)
              } catch (caughtError) {
                setError(caughtError instanceof Error ? caughtError.message : 'Falha na autenticação.')
              } finally {
                setIsBusy(false)
              }
            }}
          />

          <div className="glass-panel rounded-[28px] p-5 text-sm text-mist">
            {error ? (
              <p className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-red-100">
                {error}
              </p>
            ) : null}
            {feedback ? (
              <p className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-cyan-100">
                {feedback}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3">
              <span>{mode === 'signin' ? 'Ainda não tem conta?' : 'Já possui login?'}</span>
              <button
                type="button"
                onClick={() => setMode((current) => (current === 'signin' ? 'signup' : 'signin'))}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-ink transition hover:border-white/20"
              >
                {mode === 'signin' ? 'Criar conta' : 'Entrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
