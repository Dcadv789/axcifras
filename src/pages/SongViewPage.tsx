import { Link, Navigate, useParams } from 'react-router-dom'
import { SimplifiedScore } from '../components/songs/SimplifiedScore'
import { useSongs } from '../hooks/useSongs'

export function SongViewPage() {
  const { songId } = useParams()
  const { getSong } = useSongs()
  const song = songId ? getSong(songId) : undefined

  if (!song) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1700px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 rounded-[30px] border border-white/10 bg-black/25 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-white/35">{song.artist}</div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {song.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-mist">
            {song.keySignature} • {song.timeSignature} • {song.bpm} BPM
          </div>
          <Link
            to={`/songs/${song.id}/edit`}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-mist transition hover:border-white/20 hover:text-ink"
          >
            Editar
          </Link>
          <Link
            to={`/songs/${song.id}/live`}
            className="rounded-2xl bg-gold px-4 py-2 text-sm font-medium text-night transition hover:brightness-105"
          >
            Modo ao vivo
          </Link>
        </div>
      </div>

      <section className="glass-panel rounded-[32px] p-5 sm:p-8">
        <SimplifiedScore lines={song.lines} timeSignature={song.timeSignature} />
      </section>
    </div>
  )
}
