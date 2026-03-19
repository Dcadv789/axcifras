import { startTransition, useEffect, useMemo, useState } from 'react'
import { BookOpen, FileUp, Plus, Space } from 'lucide-react'
import { ChordManualModal } from '../chords/ChordManualModal'
import { ImportModal } from './ImportModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SongDraft } from '../../types/song'
import {
  insertChordInLine,
  insertSpaceInLine,
  normalizeSongLineLyric,
  removeChordFromLine,
} from '../../utils/chord-parser'
import { parseImport } from '../../utils/import-parser'
import { SimplifiedScore } from './SimplifiedScore'
import { SongMetadataForm } from './SongMetadataForm'

interface CaretSelection {
  lineId: string
  charIndex: number
}

interface ChordSelection {
  lineId: string
  chordId: string
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
  const [selectedChord, setSelectedChord] = useState<ChordSelection | null>(null)
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
  const [chordNameInput, setChordNameInput] = useState('')
  const [manualOpen, setManualOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const selectedChordData = useMemo(() => {
    if (!selectedChord) {
      return null
    }

    const line = draft.lines.find((item) => item.id === selectedChord.lineId)
    const chord = line?.chords.find((item) => item.id === selectedChord.chordId)

    return line && chord ? { line, chord } : null
  }, [draft.lines, selectedChord])

  const selectedLineData = useMemo(() => {
    const activeLineId = selectedChord?.lineId ?? selectedCaret?.lineId ?? selectedLineId

    if (!activeLineId) {
      return null
    }

    return draft.lines.find((item) => item.id === activeLineId) ?? null
  }, [draft.lines, selectedCaret, selectedChord, selectedLineId])

  useEffect(() => {
    if (!selectedChordData) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        const { line, chord } = selectedChordData
        onChange({
          ...draft,
          lines: draft.lines.map((item) =>
            item.id === line.id ? removeChordFromLine(item, chord.id) : item,
          ),
        })
        setSelectedChord(null)
        return
      }

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return
      }

      event.preventDefault()
      const delta = event.key === 'ArrowLeft' ? -1 : 1
      const { line, chord } = selectedChordData

      onChange({
        ...draft,
        lines: draft.lines.map((item) =>
          item.id !== line.id
            ? item
            : {
                ...item,
                chords: item.chords.map((entry) =>
                  entry.id === chord.id
                    ? {
                        ...entry,
                        nudgePx: entry.nudgePx + delta,
                      }
                    : entry,
                ),
              },
        ),
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [draft, onChange, selectedChordData])

  const handleImport = () => {
    setIsParsing(true)

    startTransition(() => {
      const result = parseImport(draft.rawInput)
      onChange({
        ...draft,
        title: result.title,
        artist: result.artist,
        keySignature: result.keySignature,
        timeSignature: result.timeSignature,
        bpm: result.bpm,
        lines: result.lines,
      })
      setSelectedCaret(null)
      setSelectedChord(null)
      setSelectedLineId(null)
      setIsParsing(false)
    })
  }

  const handleResetAlignment = () => {
    const result = parseImport(draft.rawInput)
    onChange({
      ...draft,
      lines: result.lines,
    })
    setSelectedChord(null)
    setSelectedLineId(null)
  }

  const handleInsertSpace = (position: 'before' | 'after') => {
    if (!selectedChordData) {
      return
    }

    const targetIndex =
      position === 'before'
        ? selectedChordData.chord.charIndex
        : selectedChordData.chord.charIndex + 1

    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id === selectedChordData.line.id ? insertSpaceInLine(line, targetIndex) : line,
      ),
    })

    setSelectedCaret({
      lineId: selectedChordData.line.id,
      charIndex: targetIndex,
    })
  }

  const handleRenameChord = () => {
    if (!selectedChordData || !chordNameInput.trim()) {
      return
    }

    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id !== selectedChordData.line.id
          ? line
          : {
              ...line,
              chords: line.chords.map((chord) =>
                chord.id === selectedChordData.chord.id
                  ? {
                      ...chord,
                      chord: chordNameInput.trim(),
                    }
                  : chord,
              ),
            },
      ),
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

  const handleLineLyricChange = (lineId: string, nextText: string) => {
    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              lyric: nextText,
            }
          : line,
      ),
    })
  }

  const handleLineLyricCommit = (lineId: string, nextText: string) => {
    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id === lineId ? normalizeSongLineLyric(line, nextText) : line,
      ),
    })
  }

  const handleSectionTypeChange = (lineId: string, sectionType: import('../../types/song').SectionType) => {
    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id === lineId ? { ...line, sectionType } : line,
      ),
    })
  }

  const handleTogglePairWithNext = (lineId: string) => {
    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id === lineId ? { ...line, pairWithNext: !line.pairWithNext } : line,
      ),
    })
  }

  const handleInsertLineAfter = (lineId: string) => {
    const nextLines = draft.lines.flatMap((line) =>
      line.id === lineId
        ? [
            line,
            {
              id: `line-${crypto.randomUUID()}`,
              lyric: '',
              chords: [],
            },
          ]
        : [line],
    )

    onChange({
      ...draft,
      lines: nextLines,
    })
  }

  const handleDeleteLine = (lineId: string) => {
    const nextLines = draft.lines.filter((line) => line.id !== lineId)
    if (nextLines.length === 0) return
    onChange({ ...draft, lines: nextLines })
    setSelectedCaret(null)
    setSelectedChord(null)
    setSelectedLineId(null)
  }

  const handleInsertChordInLine = (lineId: string, charIndex: number) => {
    const chordName = chordNameInput.trim() || 'C'
    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id === lineId ? insertChordInLine(line, charIndex, chordName) : line,
      ),
    })
    setSelectedCaret({ lineId, charIndex })
  }

  const handleChordChange = (lineId: string, chordId: string, newChord: string) => {
    const trimmed = newChord.trim()
    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id !== lineId
          ? line
          : {
              ...line,
              chords: line.chords.map((c) =>
                c.id === chordId ? { ...c, chord: trimmed || c.chord } : c,
              ),
            },
      ),
    })
  }

  const handleInsertChord = () => {
    if (!selectedCaret || !chordNameInput.trim()) return
    onChange({
      ...draft,
      lines: draft.lines.map((line) =>
        line.id === selectedCaret.lineId
          ? insertChordInLine(line, selectedCaret.charIndex, chordNameInput.trim())
          : line,
      ),
    })
    setSelectedChord(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 sm:p-6">
        <div className="flex flex-col gap-6">
          <SongMetadataForm draft={draft} onChange={onChange} />

          <div>
            <div className="text-xs font-medium uppercase tracking-[0.26em] text-zinc-400">
              Edição por cifra
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Clique na letra para posicionar o cursor e inserir cifras. Clique numa cifra para trocar o nome, ajustar espaços ou mover com as setas ← →. Arraste com o mouse para ajustes maiores.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => setImportOpen(true)}
                size="lg"
                className="rounded-2xl bg-[#c62424] text-white hover:bg-[#d92c2c]"
              >
                <FileUp className="mr-2 size-4" />
                Importar cifra
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setManualOpen(true)}
                className="rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              >
                <BookOpen className="mr-2 size-4" />
                Manual de cifras (teclado/piano)
              </Button>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 text-xs font-medium uppercase tracking-[0.26em] text-zinc-400">
            Ferramentas de edição
          </div>
          <div className="space-y-4 text-sm text-zinc-600">
            <p className="text-zinc-700">
              {selectedChordData
                ? `Cifra selecionada: ${selectedChordData.chord.chord}`
                : 'Clique em uma cifra para selecionar e editar.'}
            </p>
            <p className="text-zinc-700">
              {selectedLineData
                ? 'Edite a letra direto na visualização.'
                : 'Clique em uma linha para editar a letra.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!selectedChordData}
                onClick={() => handleInsertSpace('before')}
                className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                <Space className="mr-1.5 size-3.5" />
                Espaço antes
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!selectedChordData}
                onClick={() => handleInsertSpace('after')}
                className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              >
                <Space className="mr-1.5 size-3.5" />
                Espaço depois
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={chordNameInput}
                onChange={(event) => setChordNameInput(event.target.value)}
                placeholder="C, Am, G7"
                className="h-10 w-28 rounded-xl border-zinc-200 text-zinc-950"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleInsertChord}
                disabled={!selectedCaret || !chordNameInput.trim()}
                className="rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              >
                <Plus className="mr-1 size-3.5" />
                Inserir
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleRenameChord}
                disabled={!selectedChordData || !chordNameInput.trim()}
                className="rounded-xl bg-[#c62424] text-white hover:bg-[#d92c2c]"
              >
                Trocar
              </Button>
            </div>
            <p className="text-xs text-zinc-500">
              Setas ← → para mover a cifra. Arraste com o mouse para ajustes maiores.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-50/50 px-4 py-4 sm:px-6 sm:py-5">
            <h2 className="text-2xl font-bold text-zinc-950">
              {draft.title?.trim() || 'Sem título'}
            </h2>
            {draft.artist?.trim() ? (
              <p className="mt-1 text-base text-zinc-500">{draft.artist}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.keySignature?.trim() ? (
                <span className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700">
                  Tom {draft.keySignature}
                </span>
              ) : null}
              <span className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700">
                {draft.timeSignature || '4/4'}
              </span>
              <span className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700">
                {draft.bpm || 0} BPM
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <SimplifiedScore
              editable
              lines={draft.lines}
              timeSignature={draft.timeSignature}
              presentation="editor"
              selectedLineId={selectedLineData?.id ?? null}
              selectedCaret={selectedCaret}
              selectedChord={selectedChord}
              onSelectCaret={(lineId, charIndex) => {
                const nextLine = draft.lines.find((line) => line.id === lineId)
                setSelectedLineId(lineId)
                setSelectedCaret({ lineId, charIndex })
                setSelectedChord(null)
                setChordNameInput(nextLine?.chords[0]?.chord ?? '')
              }}
              onSelectChord={(lineId, chordId, charIndex, chordName) => {
                setSelectedLineId(lineId)
                setSelectedChord({ lineId, chordId })
                setSelectedCaret({ lineId, charIndex })
                setChordNameInput(chordName)
              }}
              onChordNudge={handleChordNudge}
              onLineLyricChange={handleLineLyricChange}
              onLineLyricCommit={handleLineLyricCommit}
              onInsertLineAfter={handleInsertLineAfter}
              onInsertChordInLine={handleInsertChordInLine}
              onChordChange={handleChordChange}
              onDeleteLine={handleDeleteLine}
              onTogglePairWithNext={handleTogglePairWithNext}
              onSectionTypeChange={handleSectionTypeChange}
            />
          </div>
        </div>

        <ImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          value={draft.rawInput}
          onChange={(rawInput) => onChange({ ...draft, rawInput })}
          onImport={handleImport}
          onResetAlignment={handleResetAlignment}
          isParsing={isParsing}
        />
        <ChordManualModal open={manualOpen} onClose={() => setManualOpen(false)} />

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            onClick={() => {
              setIsSaving(true)
              void onSave().finally(() => setIsSaving(false))
            }}
            disabled={isSaving}
            size="lg"
            className="rounded-2xl bg-[#c62424] px-5 text-white hover:bg-[#d92c2c]"
          >
            {isSaving ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
