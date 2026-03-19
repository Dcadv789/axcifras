import { motion } from 'framer-motion'
import { Gauge, PenSquare, PlaySquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Song } from '../../types/song'

interface SongCardProps {
  song: Song
}

export function SongCard({ song }: SongCardProps) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <article className="rounded-[24px] border border-zinc-200 bg-white p-4 transition hover:border-red-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[1.02rem] font-semibold tracking-[-0.03em] text-zinc-950">
              {song.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">{song.artist}</p>
          </div>

          <div className="rounded-full border border-red-100 bg-white px-2.5 py-1 text-sm font-medium text-[#c62424]">
            {song.keySignature}
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white px-3.5 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Tom</div>
            <div className="mt-2 text-sm font-medium text-zinc-950">{song.keySignature}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-3.5 py-3">
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Compasso</div>
            <div className="mt-2 text-sm font-medium text-zinc-950">{song.timeSignature}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-3.5 py-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
              <Gauge className="size-3" />
              BPM
            </div>
            <div className="mt-2 text-sm font-medium text-zinc-950">{song.bpm}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-200 pt-3">
          <Link
            to={`/songs/${song.id}/edit`}
            className={cn(
              buttonVariants({ variant: 'default', size: 'sm' }),
              'rounded-xl bg-[#c62424] text-white hover:bg-[#d92c2c]',
            )}
          >
            <PenSquare className="mr-2 size-3.5" />
            Editar
          </Link>
          <Link
            to={`/songs/${song.id}/view`}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
            )}
          >
            Visualizar
          </Link>
          <Link
            to={`/songs/${song.id}/live`}
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'sm' }),
              'rounded-xl border border-red-100 bg-white text-[#c62424] hover:bg-red-50',
            )}
          >
            <PlaySquare className="mr-2 size-3.5" />
            Ao vivo
          </Link>
        </div>
      </article>
    </motion.div>
  )
}
