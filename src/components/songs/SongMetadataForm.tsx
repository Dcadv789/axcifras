import type { SongDraft, TimeSignature } from '../../types/song'

interface SongMetadataFormProps {
  draft: SongDraft
  onChange: (nextDraft: SongDraft) => void
}

const signatures: TimeSignature[] = ['4/4', '3/4', '6/8']

export function SongMetadataForm({ draft, onChange }: SongMetadataFormProps) {
  return (
    <section className="glass-panel rounded-[28px] p-5">
      <div className="mb-5">
        <div className="text-xs uppercase tracking-[0.22em] text-white/35">Cadastro</div>
        <h2 className="mt-2 font-display text-xl font-semibold">Metadados da música</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="block xl:col-span-2">
          <span className="mb-2 block text-sm text-mist">Nome da música</span>
          <input
            required
            value={draft.title}
            onChange={(event) => onChange({ ...draft, title: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-gold/60"
            placeholder="Ex: Oceano de Graça"
          />
        </label>

        <label className="block xl:col-span-2">
          <span className="mb-2 block text-sm text-mist">Artista</span>
          <input
            required
            value={draft.artist}
            onChange={(event) => onChange({ ...draft, artist: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-gold/60"
            placeholder="Ex: Ministério AxPiano"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-mist">Tom</span>
          <input
            value={draft.keySignature}
            onChange={(event) => onChange({ ...draft, keySignature: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-gold/60"
            placeholder="C, Am, G"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-mist">Compasso</span>
          <select
            value={draft.timeSignature}
            onChange={(event) =>
              onChange({
                ...draft,
                timeSignature: event.target.value as TimeSignature,
              })
            }
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-gold/60"
          >
            {signatures.map((signature) => (
              <option key={signature} value={signature}>
                {signature}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-mist">BPM</span>
          <input
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
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-gold/60"
          />
        </label>
      </div>
    </section>
  )
}
