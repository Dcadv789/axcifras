import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { SongCard } from '../components/songs/SongCard'
import { useSongs } from '../hooks/useSongs'

export function SongsPage() {
  const { songs, deleteSong } = useSongs()
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()
  const filteredSongs = songs.filter((song) => {
    if (!normalizedQuery) {
      return true
    }

    return [song.title, song.artist].some((value) => value.toLowerCase().includes(normalizedQuery))
  })

  return (
    <AppShell
      title="Biblioteca de cifras"
      subtitle="Suas músicas ficam separadas por usuário, com edição de posicionamento, visualização limpa e modo ao vivo baseado no BPM."
      actions={
        <Link
          to="/songs/new"
          className="rounded-2xl bg-gold px-4 py-2.5 text-sm font-medium text-night transition hover:brightness-105"
        >
          Nova música
        </Link>
      }
    >
      <section className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="glass-panel rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Busca</div>
          <h2 className="mt-2 font-display text-xl font-semibold">Encontre por nome ou artista</h2>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busque por música ou artista"
            className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-gold/60"
          />
        </div>

        <div className="glass-panel rounded-[28px] p-5">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/35">Músicas</div>
              <div className="mt-3 text-3xl font-semibold">{songs.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/35">Filtradas</div>
              <div className="mt-3 text-3xl font-semibold">{filteredSongs.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/35">Média BPM</div>
              <div className="mt-3 text-3xl font-semibold">
                {songs.length > 0
                  ? Math.round(songs.reduce((total, song) => total + song.bpm, 0) / songs.length)
                  : 0}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {filteredSongs.map((song) => (
          <SongCard key={song.id} song={song} onDelete={deleteSong} />
        ))}

        {filteredSongs.length === 0 ? (
          <div className="glass-panel col-span-full rounded-[28px] p-8 text-center text-mist">
            Nenhuma música encontrada para a busca atual.
          </div>
        ) : null}
      </section>
    </AppShell>
  )
}
