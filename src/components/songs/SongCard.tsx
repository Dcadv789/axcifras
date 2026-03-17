import { Link } from 'react-router-dom'
import type { Song } from '../../types/song'

interface SongCardProps {
  song: Song
  onDelete: (songId: string) => void
}

export function SongCard({ song, onDelete }: SongCardProps) {
  return (
    <article className="glass-panel rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">{song.artist}</div>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
            {song.title}
          </h3>
        </div>
        <div className="rounded-2xl border border-gold/20 bg-gold/10 px-3 py-2 text-right text-sm text-gold">
          <div>{song.keySignature}</div>
          <div className="text-xs text-gold/70">{song.timeSignature}</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm text-mist">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <div className="text-xs uppercase tracking-[0.18em] text-white/35">BPM</div>
          <div className="mt-2 text-lg text-ink">{song.bpm}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <div className="text-xs uppercase tracking-[0.18em] text-white/35">Linhas</div>
          <div className="mt-2 text-lg text-ink">{song.lines.filter((line) => line.lyric).length}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
          <div className="text-xs uppercase tracking-[0.18em] text-white/35">Cifras</div>
          <div className="mt-2 text-lg text-ink">
            {song.lines.reduce((count, line) => count + line.chords.length, 0)}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={`/songs/${song.id}/edit`}
          className="rounded-2xl bg-gold px-4 py-2.5 text-sm font-medium text-night transition hover:brightness-105"
        >
          Editar
        </Link>
        <Link
          to={`/songs/${song.id}/view`}
          className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-mist transition hover:border-white/20 hover:text-ink"
        >
          Visualizar
        </Link>
        <Link
          to={`/songs/${song.id}/live`}
          className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm text-cyan-200 transition hover:border-cyan-200/30"
        >
          Ao vivo
        </Link>
        <button
          type="button"
          onClick={() => onDelete(song.id)}
          className="rounded-2xl border border-red-300/15 px-4 py-2.5 text-sm text-red-200/80 transition hover:border-red-300/30 hover:text-red-100"
        >
          Excluir
        </button>
      </div>
    </article>
  )
}
