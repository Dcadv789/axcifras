import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { SongComposer } from '../components/songs/SongComposer'
import { useSongs } from '../hooks/useSongs'
import { createDraftFromSong, createEmptySongDraft } from '../services/song-storage'
import type { SongDraft } from '../types/song'

function SongEditorState({
  songId,
  initialDraft,
  submitLabel,
}: {
  songId?: string
  initialDraft: SongDraft
  submitLabel: string
}) {
  const navigate = useNavigate()
  const { saveSong } = useSongs()
  const [draft, setDraft] = useState<SongDraft>(initialDraft)

  return (
    <SongComposer
      draft={draft}
      onChange={setDraft}
      submitLabel={submitLabel}
      onSave={async () => {
        const savedSong = saveSong(draft, songId)
        navigate(`/songs/${savedSong.id}/edit`, { replace: Boolean(songId) })
      }}
    />
  )
}

export function SongEditorPage() {
  const { songId } = useParams()
  const { getSong } = useSongs()
  const song = songId ? getSong(songId) : undefined

  if (songId && !song) {
    return <Navigate to="/" replace />
  }

  const isEditing = Boolean(song)

  return (
    <AppShell
      title={isEditing ? 'Editar música' : 'Nova música'}
      subtitle="Ajuste metadados, importe a cifra tradicional e refine o posicionamento diretamente na partitura simplificada."
      actions={
        <Link
          to="/"
          className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-mist transition hover:border-white/20 hover:text-ink"
        >
          Voltar
        </Link>
      }
    >
      <SongEditorState
        key={song?.id ?? 'new'}
        songId={song?.id}
        initialDraft={song ? createDraftFromSong(song) : createEmptySongDraft()}
        submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar música'}
      />
    </AppShell>
  )
}
