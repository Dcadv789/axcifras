import { Input } from '@/components/ui/input'
import type { SongDraft } from '../../types/song'

interface SongMetadataFormProps {
  draft: SongDraft
  onChange: (nextDraft: SongDraft) => void
}

export function SongMetadataForm({ draft, onChange }: SongMetadataFormProps) {
  return (
    <div>
      <div className="mb-4">
        <div className="text-xs font-medium uppercase tracking-[0.26em] text-zinc-400">Cadastro</div>
        <h2 className="mt-2 text-lg font-semibold text-zinc-950">Metadados da música</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="block xl:col-span-2">
          <span className="mb-2 block text-sm text-zinc-500">Nome da música</span>
          <Input
            required
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            className="h-12 rounded-2xl border-zinc-200 bg-white text-zinc-950"
            placeholder="Ex: Oceano de Graça"
          />
        </label>

        <label className="block xl:col-span-2">
          <span className="mb-2 block text-sm text-zinc-500">Artista</span>
          <Input
            required
            value={draft.artist}
            onChange={(event) => onChange({ ...draft, artist: event.target.value })}
            className="h-12 rounded-2xl border-zinc-200 bg-white text-zinc-950"
            placeholder="Ex: Tradicional brasileira"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-500">Tom</span>
          <Input
            value={draft.keySignature}
            onChange={(event) => onChange({ ...draft, keySignature: event.target.value })}
            className="h-12 rounded-2xl border-zinc-200 bg-white text-zinc-950"
            placeholder="C, Am, G"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-500">Compasso / tempos</span>
          <Input
            value={draft.timeSignature}
            onChange={(event) => onChange({ ...draft, timeSignature: event.target.value })}
            className="h-12 rounded-2xl border-zinc-200 bg-white text-zinc-950"
            placeholder="Ex: 4/4, 3/4, 5/4, 6/8"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-500">BPM</span>
          <Input
            type="number"
            min={40}
            max={240}
            value={draft.bpm}
            onChange={(event) =>
              onChange({
                ...draft,
                bpm: Number.parseInt(event.target.value || '0', 10) || 0,
              })
            }
            className="h-12 rounded-2xl border-zinc-200 bg-white text-zinc-950"
          />
        </label>
      </div>
    </div>
  )
}
