import { useState } from 'react'
import { ArrowLeft, Eye, Music4, Radio, Wand2 } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { SongComposer } from '@/components/songs/SongComposer'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { useSongs } from '@/hooks/useSongs'
import { cn } from '@/lib/utils'
import { createDraftFromSong, createEmptySongDraft } from '@/services/song-storage'
import type { Song, SongDraft } from '@/types/song'

interface EditorScreenProps {
  song: Song | undefined
  onSaveSong: (draft: SongDraft, existingId?: string) => Promise<Song>
}

function EditorScreen({ song, onSaveSong }: EditorScreenProps) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<SongDraft>(() =>
    song ? createDraftFromSong(song) : createEmptySongDraft(),
  )
  const isEditing = Boolean(song)

  const pageTitle = draft.title?.trim() || (isEditing ? 'Editor de Música' : 'Nova Música')
  const pageSubtitle =
    draft.artist?.trim() ||
    'Monte a estrutura da canção, ajuste sílabas e refine o posicionamento de cada cifra.'

  return (
    <AppShell
      title={pageTitle}
      subtitle={pageSubtitle}
      actions={
        <>
          <Badge className="rounded-full border border-red-100 bg-red-50 text-[#a61f1f] hover:bg-red-50">
            <Wand2 className="mr-2 size-3.5" />
            Edição assistida
          </Badge>
          <Badge className="rounded-full border border-red-100 bg-red-50 text-[#a61f1f] hover:bg-red-50">
            <Music4 className="mr-2 size-3.5" />
            Banco remoto
          </Badge>
          {song ? (
            <>
              <Link
                to={`/songs/${song.id}/view`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
                )}
              >
                <Eye className="mr-2 size-4" />
                Visualizar
              </Link>
              <Link
                to={`/songs/${song.id}/live`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
                )}
              >
                <Radio className="mr-2 size-4" />
                Modo ao vivo
              </Link>
            </>
          ) : null}
          <Link
            to="/"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
            )}
          >
            <ArrowLeft className="mr-2 size-4" />
            Voltar
          </Link>
        </>
      }
    >
      <SongComposer
        draft={draft}
        onChange={setDraft}
        submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar música'}
        onSave={async () => {
          const savedSong = await onSaveSong(draft, song?.id)
          navigate(`/songs/${savedSong.id}/edit`, { replace: isEditing })
        }}
      />
    </AppShell>
  )
}

export function SongEditorPage() {
  const { songId } = useParams()
  const { getSong, isLoading, saveSong } = useSongs()
  const song = songId ? getSong(songId) : undefined

  if (songId && isLoading) {
    return (
      <AppShell title="Carregando música" subtitle="Buscando os dados da música no AxCifras...">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600">Carregando...</div>
      </AppShell>
    )
  }

  if (songId && !song) {
    return <Navigate to="/" replace />
  }

  return <EditorScreen key={song?.id ?? 'new'} song={song} onSaveSong={saveSong} />
}
