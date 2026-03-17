import { startTransition, useState } from 'react'
import type { SongDraft } from '../../types/song'
import { insertSpaceInLine, parseChordSheet } from '../../utils/chord-parser'
import { RawImportPanel } from './RawImportPanel'
import { SimplifiedScore } from './SimplifiedScore'
import { SongMetadataForm } from './SongMetadataForm'

interface CaretSelection {
  lineId: string
  charIndex: number
}

interface SongComposerProps {
  draft: SongDraft
  onChange: (nextDraft: SongDraft) => void
  onSave: () => Promise<void>
  submitLabel: string
}

export function SongComposer({ draft, onChange, onSave, submitLabel }: SongComposerProps) {
  const [isParsing, setIsParsing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCaret, setSelectedCaret] = useState<CaretSelection | null>(null)

  const handleImport = () => {
    setIsParsing(true)

    startTransition(() => {
      const nextLines = parseChordSheet(draft.rawInput)
      onChange({
        ...draft,
        lines: nextLines,
      })
      setSelectedCaret(null)
      setIsParsing(false)
    })
  }

  const handleResetAlignment = () => {
    onChange({
      ...draft,
      lines: parseChordSheet(draft.rawInput),
    })
  }

  const handleAddSpace = () => {
    if (!selectedCaret) {
      return
    }

    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id === selectedCaret.lineId ? insertSpaceInLine(line, selectedCaret.charIndex) : line,
      ),
    })

    setSelectedCaret({
      lineId: selectedCaret.lineId,
      charIndex: selectedCaret.charIndex + 1,
    })
  }

  const handleChordNudge = (lineId: string, chordId: string, nextNudgePx: number) => {
    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id !== lineId
          ? line
          : {
              ...line,
              chords: line.chords.map((chord) =>
                chord.id === chordId
                  ? {
                      ...chord,
                      nudgePx: Math.round(nextNudgePx),
                    }
                  : chord,
              ),
            },
      ),
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
      <div className="space-y-6">
        <SongMetadataForm draft={draft} onChange={onChange} />
        <RawImportPanel
          value={draft.rawInput}
          onChange={(rawInput) => onChange({ ...draft, rawInput })}
          onImport={handleImport}
          onResetAlignment={handleResetAlignment}
          isParsing={isParsing}
        />

        <section className="glass-panel rounded-[28px] p-5">
          <div className="mb-4">
            <div className="text-xs uppercase tracking-[0.22em] text-white/35">Ferramentas</div>
            <h2 className="mt-2 font-display text-xl font-semibold">Ajuste fino do alinhamento</h2>
          </div>

          <div className="space-y-3 text-sm text-mist">
            <p>
              Clique na linha da letra para marcar a sílaba e use o botão abaixo para inserir espaço.
              Depois arraste as cifras horizontalmente para alinhar pixel a pixel.
            </p>
            <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 px-4 py-3 text-cyan-100/90">
              {selectedCaret
                ? `Posição selecionada: caractere ${selectedCaret.charIndex + 1}`
                : 'Nenhuma sílaba selecionada ainda.'}
            </div>
            <button
              type="button"
              onClick={handleAddSpace}
              disabled={!selectedCaret}
              className="rounded-2xl bg-gold px-4 py-2.5 text-sm font-medium text-night transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Adicionar espaço entre sílabas
            </button>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="glass-panel rounded-[28px] p-5">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-white/35">Editor de cifra</div>
              <h2 className="mt-2 font-display text-xl font-semibold">Partitura simplificada editável</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-mist">
              <span className="rounded-full border border-white/10 px-3 py-1">
                Compasso {draft.timeSignature}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">{draft.bpm} BPM</span>
            </div>
          </div>

          <SimplifiedScore
            editable
            lines={draft.lines}
            timeSignature={draft.timeSignature}
            selectedCaret={selectedCaret}
            onSelectCaret={(lineId, charIndex) => setSelectedCaret({ lineId, charIndex })}
            onChordNudge={handleChordNudge}
          />
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setIsSaving(true)
              void onSave().finally(() => setIsSaving(false))
            }}
            disabled={isSaving}
            className="rounded-2xl bg-gold px-5 py-3 font-medium text-night transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? 'Salvando...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
