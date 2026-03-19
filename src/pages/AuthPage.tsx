import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'

const features = [
  {
    title: 'Importacao',
    text: 'Cole cifras tradicionais e transforme em linhas editaveis.',
  },
  {
    title: 'Precisao',
    text: 'Arraste acordes para ajuste fino, com posicao em pixels.',
  },
  {
    title: 'Ao vivo',
    text: 'Use tela cheia e scroll automatico para palco e ensaio.',
  },
]

export function AuthPage() {
  const { email: sessionEmail, isLoading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isLoading && sessionEmail) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="dark theme relative min-h-screen overflow-hidden bg-[#090d14]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.12),transparent_18%),linear-gradient(180deg,#090d14_0%,#0b1018_100%)]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1260px] items-center px-5 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,21,32,0.96)_0%,rgba(13,18,28,0.98)_100%)] px-7 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.42)] sm:px-8 sm:py-8">
            <div className="space-y-6">
              <div className="inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-5 py-1.5 text-[11px] font-medium uppercase tracking-[0.34em] text-red-200">
                Gerenciamento de cifras com visual de partitura
              </div>

              <div className="max-w-[52rem]">
                <h1 className="text-[clamp(2.35rem,4vw,3.35rem)] font-semibold leading-[1.06] tracking-[-0.015em] text-white">
                  AxPiano organiza letra, compasso e cifra no mesmo fluxo visual.
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-400">
                  Edite o alinhamento das cifras sobre as silabas corretas, visualize em uma grade moderna
                  de compassos e entre em modo ao vivo com rolagem automatica baseada no BPM.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-[24px] border border-white/8 bg-white/[0.04] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  >
                    <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
                      {feature.title}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <Card className="rounded-[30px] border-transparent bg-[linear-gradient(180deg,rgba(16,21,32,0.98)_0%,rgba(13,18,28,0.99)_100%)] py-0 shadow-[0_24px_70px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.03)]">
              <CardContent className="p-6">
                <div className="mb-7 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
                      AxPiano
                    </div>
                    <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-white">
                      Entrar
                    </h2>
                  </div>

                  <div className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
                    Auth
                  </div>
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault()
                    setIsSubmitting(true)
                    setErrorMessage(null)
                    void signIn(email, password)
                      .catch((error: unknown) => {
                        const message =
                          error instanceof Error ? error.message : 'Nao foi possivel autenticar.'
                        setErrorMessage(message)
                      })
                      .finally(() => setIsSubmitting(false))
                  }}
                >
                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-400">Email</span>
                    <Input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 rounded-2xl border-white/10 bg-[#1a1f2b] px-4 text-white placeholder:text-zinc-500"
                      placeholder="voce@exemplo.com"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-zinc-400">Senha</span>
                    <Input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 rounded-2xl border-white/10 bg-[#1a1f2b] px-4 text-white placeholder:text-zinc-500"
                      placeholder="Min. 6 caracteres"
                    />
                  </label>

                  <Button
                    type="submit"
                    size="lg"
                    className="mt-6 h-11 w-full rounded-2xl bg-[#c62424] text-[15px] font-semibold text-white hover:bg-[#d92c2c]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Entrando...' : 'Entrar no AxPiano'}
                  </Button>
                </form>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  Use email e senha cadastrados no Supabase Auth.
                </p>
                {errorMessage ? <p className="mt-2 text-sm text-red-300">{errorMessage}</p> : null}
              </CardContent>
            </Card>

            <Card className="rounded-[26px] border-transparent bg-[linear-gradient(180deg,rgba(16,21,32,0.98)_0%,rgba(13,18,28,0.99)_100%)] py-0 shadow-[0_18px_50px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.03)]">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="text-sm text-zinc-400">Ainda nao tem conta?</div>
                <button
                  type="button"
                  className="inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-white/5"
                >
                  Criar conta
                  <ArrowRight className="ml-2 size-4" />
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
