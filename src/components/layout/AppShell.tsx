import type { PropsWithChildren, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LibraryBig, LogOut, Music2, Piano, PlusCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface AppShellProps extends PropsWithChildren {
  title: string
  subtitle: string
  actions?: ReactNode
}

const navigationItems = [
  {
    label: 'Biblioteca',
    to: '/',
    icon: LibraryBig,
  },
  {
    label: 'Nova música',
    to: '/songs/new',
    icon: PlusCircle,
  },
  {
    label: 'Manual de acordes',
    to: '/chords',
    icon: Piano,
  },
]

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const { email, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <aside className="hidden border-r border-zinc-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-[296px]">
        <div className="flex h-full flex-col">
          <div className="px-7 py-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-[#c62424]">
                <Music2 className="size-5" />
              </div>
              <div>
                <div className="text-base font-semibold text-zinc-950">AxPiano</div>
                <div className="text-sm text-zinc-500">Gerenciamento de cifras</div>
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-200" />

          <nav className="space-y-2 px-4 py-5">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    buttonVariants({
                      variant: isActive ? 'secondary' : 'ghost',
                      size: 'lg',
                    }),
                    'w-full justify-start rounded-2xl px-4 text-sm',
                    isActive
                      ? 'bg-red-50 text-[#c62424] hover:bg-red-50'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
                  )
                }
              >
                <item.icon className="mr-2 size-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-6 py-6">
            <Separator className="mb-5 bg-zinc-200" />
            <div className="mb-4 text-sm text-zinc-500">
              Sessão: <span className="font-medium text-zinc-900">{email}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              onClick={signOut}
            >
              <LogOut className="mr-2 size-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[296px]">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-zinc-200 bg-white"
        >
          <div className="px-4 py-5 sm:px-6 lg:px-10">
            <div className="mb-4 flex flex-wrap gap-3 lg:hidden">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      buttonVariants({
                        variant: isActive ? 'secondary' : 'outline',
                        size: 'lg',
                      }),
                      isActive
                        ? 'rounded-2xl border-red-100 bg-red-50 text-[#c62424] hover:bg-red-50'
                        : 'rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
                    )
                  }
                >
                  <item.icon className="mr-2 size-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.04em] text-zinc-950 sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500 sm:text-base">
                  {subtitle}
                </p>
              </div>

              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </div>
        </motion.header>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-6 sm:px-6 lg:px-10"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
