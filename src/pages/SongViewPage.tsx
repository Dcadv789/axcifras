import { useState } from 'react'
import { ArrowLeft, BookOpen, Eye, Pencil, Radio, TimerReset } from 'lucide-react'
import { ChordManualModal } from '@/components/chords/ChordManualModal'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SimplifiedScore } from '@/components/songs/SimplifiedScore'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSongs } from '@/hooks/useSongs'

export function SongViewPage() {
  const { songId } = useParams()
  const { getSong, isLoading } = useSongs()
  const song = songId ? getSong(songId) : undefined
  const [manualOpen, setManualOpen] = useState(false)

  if (songId && isLoading) {
    return <div className="min-h-screen bg-zinc-50" />
  }

  if (!song) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1880px]">
        <header className="mb-6 rounded-[30px] border border-zinc-300 bg-white px-5 py-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:px-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'rounded-2xl border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100',
              )}
            >
              <ArrowLeft className="mr-2 size-4" />
              Voltar
            </Link>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setManualOpen(true)}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-2xl border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100',
                )}
              >
                <BookOpen className="mr-2 size-4" />
                Manual de cifras
              </button>
              <Link
                to={`/songs/${song.id}/edit`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-2xl border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100',
                )}
              >
                <Pencil className="mr-2 size-4" />
                Editar
              </Link>
              <Link
                to={`/songs/${song.id}/live`}
                className={cn(
                  buttonVariants({ variant: 'default', size: 'lg' }),
                  'rounded-2xl bg-[#c62424] text-white hover:bg-[#d92c2c]',
                )}
              >
                <Radio className="mr-2 size-4" />
                Modo ao vivo
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full border border-zinc-300 bg-white text-zinc-700 hover:bg-white">
                  <Eye className="mr-2 size-3.5" />
                  Visualização limpa
                </Badge>
                <Badge className="rounded-full border border-red-200 bg-red-50 text-[#a61f1f] hover:bg-red-50">
                  <TimerReset className="mr-2 size-3.5" />
                  {song.bpm} BPM
                </Badge>
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-zinc-950 sm:text-4xl">
                {song.title}
              </h1>
              <p className="mt-2 text-sm text-zinc-600 sm:text-base">
                {song.artist} • {song.keySignature} • {song.timeSignature}
              </p>
            </div>

          </div>
        </header>

        <SimplifiedScore
          lines={song.lines}
          timeSignature={song.timeSignature}
          presentation="sheet"
        />
      </div>

      <ChordManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
    </div>
  )
}
