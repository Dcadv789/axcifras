import { useDeferredValue, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PlusCircle, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { SongCard } from '@/components/songs/SongCard'
import { Input } from '@/components/ui/input'
import { useSongs } from '@/hooks/useSongs'

export function SongsPage() {
  const { songs } = useSongs()
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const filteredSongs = useMemo(
    () =>
      songs.filter((song) => {
        if (!normalizedQuery) {
          return true
        }

        return [song.title, song.artist].some((value) => value.toLowerCase().includes(normalizedQuery))
      }),
    [normalizedQuery, songs],
  )

  return (
    <AppShell
      title="Biblioteca de cifras"
      subtitle="Filtre por música ou artista, abra o editor de cifra e entre no modo palco com uma navegação direta e limpa."
      actions={
        <Link
          to="/songs/new"
          className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#c62424] px-4 text-sm font-medium text-white transition hover:bg-[#d92c2c]"
        >
          <PlusCircle className="mr-2 size-4" />
          Nova música
        </Link>
      }
    >
      <section className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="rounded-[28px] border border-zinc-200 bg-white p-5">
          <div className="mb-4">
            <div className="text-xs font-medium uppercase tracking-[0.26em] text-zinc-400">Busca</div>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-zinc-950">
              Encontre por nome ou artista
            </h2>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busque por música ou artista"
              className="h-12 rounded-2xl border-zinc-200 bg-white pl-11 text-zinc-950"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-[28px] border border-zinc-200 bg-white p-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Músicas</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-950">{songs.length}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Filtradas</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-950">{filteredSongs.length}</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Média BPM</div>
            <div className="mt-3 text-3xl font-semibold text-zinc-950">
              {songs.length > 0
                ? Math.round(songs.reduce((total, song) => total + song.bpm, 0) / songs.length)
                : 0}
            </div>
          </div>
        </div>
      </section>

      <motion.section layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}

        {filteredSongs.length === 0 ? (
          <div className="col-span-full rounded-[28px] border border-zinc-200 bg-white p-10 text-center text-zinc-500">
            Nenhuma música encontrada para a busca atual.
          </div>
        ) : null}
      </motion.section>
    </AppShell>
  )
}
