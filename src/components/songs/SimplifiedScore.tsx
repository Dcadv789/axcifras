import { useEffect, useRef, useState } from 'react'
import {
  CHAR_WIDTH_PX,
  SCORE_SIDE_PADDING_PX,
  getNearestCharIndex,
} from '../../utils/chord-parser'
import { Plus, Trash2 } from 'lucide-react'
import type { SectionType, SongLine, TimeSignature } from '../../types/song'

const SECTION_LABELS: Record<SectionType, string> = {
  verso: 'Verso',
  refrão: 'Refrão',
  coro: 'Coro',
  intro: 'Intro',
  ponte: 'Ponte',
  outro: 'Outro',
  final: 'Final',
}

interface CaretSelection {
  lineId: string
  charIndex: number
}

interface ChordSelection {
  lineId: string
  chordId: string
}

interface SimplifiedScoreProps {
  lines: SongLine[]
  timeSignature: TimeSignature
  editable?: boolean
  density?: 'default' | 'live'
  presentation?: 'default' | 'sheet' | 'editor'
  selectedLineId?: string | null
  selectedCaret?: CaretSelection | null
  selectedChord?: ChordSelection | null
  onSelectCaret?: (lineId: string, charIndex: number) => void
  onSelectChord?: (lineId: string, chordId: string, charIndex: number, chordName: string) => void
  onChordNudge?: (lineId: string, chordId: string, nextNudgePx: number) => void
  onLineLyricChange?: (lineId: string, nextText: string) => void
  onLineLyricCommit?: (lineId: string, nextText: string) => void
  onInsertLineAfter?: (lineId: string) => void
  onInsertChordInLine?: (lineId: string, charIndex: number) => void
  onChordChange?: (lineId: string, chordId: string, newChord: string) => void
  onDeleteLine?: (lineId: string) => void
  onTogglePairWithNext?: (lineId: string) => void
  onSectionTypeChange?: (lineId: string, sectionType: SectionType) => void
  /** No modo ao vivo: ao clicar na cifra, exibe as teclas (se showChordKeys estiver ativo) */
  onChordClick?: (chordName: string) => void
}

interface DragState {
  chordId: string
  lineId: string
  startX: number
  startNudgePx: number
}

interface PendingDrag {
  chordId: string
  lineId: string
  startX: number
  startNudgePx: number
}

export function SimplifiedScore({
  lines,
  editable = false,
  density = 'default',
  presentation = 'default',
  selectedLineId,
  selectedCaret,
  selectedChord,
  onSelectCaret,
  onSelectChord,
  onChordNudge,
  onLineLyricChange,
  onLineLyricCommit,
  onInsertLineAfter,
  onInsertChordInLine,
  onChordChange,
  onDeleteLine,
  onTogglePairWithNext,
  onSectionTypeChange,
  onChordClick,
}: SimplifiedScoreProps) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [pendingDrag, setPendingDrag] = useState<PendingDrag | null>(null)
  const [editingChordId, setEditingChordId] = useState<string | null>(null)
  const chordInputRef = useRef<HTMLInputElement>(null)
  const DRAG_THRESHOLD_PX = 5
  const isEditor = presentation === 'editor'
  const isSheet = presentation === 'sheet'
  const lyricSize = density === 'live' ? 'text-[clamp(1.3rem,2vw,1.8rem)]' : isEditor ? 'text-lg' : 'text-base'
  const chordSize = density === 'live' ? 'text-[clamp(1rem,1.3vw,1.2rem)]' : isEditor ? 'text-base font-bold' : 'text-sm'
  const wordSpacing = isEditor ? 'tracking-wide [word-spacing:0.25em]' : 'tracking-[0.01em]'
  const rowGap = density === 'live' ? 'space-y-8' : 'space-y-5'

  useEffect(() => {
    if (!pendingDrag && !dragState) return

    const handlePointerMove = (event: PointerEvent) => {
      if (pendingDrag && !dragState) {
        const deltaX = Math.abs(event.clientX - pendingDrag.startX)
        if (deltaX >= DRAG_THRESHOLD_PX) {
          setDragState({
            chordId: pendingDrag.chordId,
            lineId: pendingDrag.lineId,
            startX: pendingDrag.startX,
            startNudgePx: pendingDrag.startNudgePx,
          })
          setPendingDrag(null)
        }
      }
      if (dragState && onChordNudge) {
        const deltaX = event.clientX - dragState.startX
        onChordNudge(dragState.lineId, dragState.chordId, dragState.startNudgePx + deltaX)
      }
    }

    const handlePointerUp = () => {
      setDragState(null)
      setPendingDrag(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [pendingDrag, dragState, onChordNudge])

  const activeEditingChordId =
    selectedChord && editingChordId && selectedChord.chordId === editingChordId
      ? editingChordId
      : null

  const rows: SongLine[][] = []
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (line?.pairWithNext && lines[i + 1]) {
      rows.push([line, lines[i + 1]!])
      i += 1
    } else {
      rows.push([line!])
    }
  }

  const renderLine = (line: SongLine, lineIndex: number, isPaired: boolean, pairOwnerId?: string, isAltRow?: boolean) => {
    const contentChars = Math.max(
      24,
      line.lyric.length,
      ...line.chords.map((chord) => chord.charIndex + chord.chord.length + 4),
    )
    const rowWidth = SCORE_SIDE_PADDING_PX * 2 + contentChars * CHAR_WIDTH_PX
    const isSelectedLine = selectedLineId === line.id
    const minWidth = density === 'live' ? 980 : isPaired ? 360 : 720

    return (
      <div
        key={line.id}
        className={
          isEditor
            ? `rounded-[24px] border p-4 overflow-hidden ${isSelectedLine ? 'border-red-200 bg-red-50/30' : 'border-zinc-200 bg-white'} ${isPaired ? 'min-w-0 flex-1' : ''}`
            : `rounded-[24px] border p-4 overflow-hidden ${isPaired ? 'min-w-0 flex-1' : ''} ${isSheet ? `border-zinc-400 shadow-sm ${isAltRow ? 'bg-zinc-100' : 'bg-white'}` : 'border-zinc-200 bg-white'}`
        }
        style={{
          width: isPaired ? undefined : Math.max(rowWidth, minWidth),
          minWidth: isPaired ? 0 : undefined,
          maxWidth: density === 'live' ? '100%' : undefined,
        }}
      >
        {isEditor ? (
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                Linha {String(lineIndex + 1).padStart(2, '0')}
              </span>
              <select
                value={line.sectionType ?? 'verso'}
                onChange={(e) => onSectionTypeChange?.(line.id, e.target.value as SectionType)}
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-600 outline-none focus:border-red-200 focus:ring-1 focus:ring-red-200"
              >
                {(Object.keys(SECTION_LABELS) as SectionType[]).map((type) => (
                  <option key={type} value={type}>
                    {SECTION_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              {(isPaired && pairOwnerId) || lines.indexOf(line) < lines.length - 1 ? (
                <button
                  type="button"
                  onClick={() => onTogglePairWithNext?.(pairOwnerId ?? line.id)}
                  title={line.pairWithNext ? 'Desfazer lado a lado' : 'Colocar ao lado da próxima'}
                  className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] transition ${
                    (pairOwnerId ? lines.find((l) => l.id === pairOwnerId)?.pairWithNext : line.pairWithNext)
                      ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'
                  }`}
                >
                  Lado a lado
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onInsertChordInLine?.(line.id, line.lyric.length)}
                title="Inserir cifra no fim da linha"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 transition hover:bg-zinc-50"
              >
                <Plus className="mr-1 size-3" />
                Cifra
              </button>
              <button
                type="button"
                onClick={() => onInsertLineAfter?.(line.id)}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 transition hover:bg-zinc-50"
              >
                Nova linha
              </button>
              {lines.length > 1 ? (
                <button
                  type="button"
                  onClick={() => onDeleteLine?.(line.id)}
                  title="Excluir linha"
                  className="rounded-full border border-red-100 bg-white p-1.5 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className="relative overflow-hidden"
          style={{
            width: isPaired ? '100%' : Math.max(rowWidth, minWidth),
            minWidth: isPaired ? 280 : undefined,
            maxWidth: density === 'live' ? '100%' : undefined,
            height: density === 'live' ? 94 : isEditor ? 92 : 82,
          }}
                onClick={(event) => {
                  if (!editable || !onSelectCaret) {
                    return
                  }

                  const bounds = event.currentTarget.getBoundingClientRect()
                  const nextIndex = getNearestCharIndex(event.clientX - bounds.left)
                  onSelectCaret(line.id, nextIndex)
                }}
              >
                {line.chords.map((chord) => {
                  const isSelected =
                    selectedChord?.lineId === line.id && selectedChord.chordId === chord.id
                  const isEditing = editable && isSelected && activeEditingChordId === chord.id

                  return (
                    <div
                      key={chord.id}
                      className={`absolute rounded-lg font-mono ${chordSize} ${
                        editable ? 'cursor-grab active:cursor-grabbing' : onChordClick ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
                      } ${
                        isSelected
                          ? 'border border-[#c62424] bg-[#c62424] text-white shadow-[0_8px_18px_rgba(198,36,36,0.22)]'
                          : isSheet
                            ? 'border border-red-300 bg-red-50 text-[#8b1515]'
                            : 'border border-red-100 bg-white text-[#b42020]'
                      } ${isEditing ? 'cursor-text p-0' : 'px-3 py-1.5'}`}
                      style={{
                        top: 0,
                        left: SCORE_SIDE_PADDING_PX + chord.charIndex * CHAR_WIDTH_PX + chord.nudgePx,
                        transform: 'translateX(-2px)',
                        touchAction: 'none',
                        minWidth: 36,
                      }}
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        if (editable && onSelectChord) {
                          onSelectChord(line.id, chord.id, chord.charIndex, chord.chord)
                          if (onChordChange) {
                            setEditingChordId(chord.id)
                            setTimeout(() => chordInputRef.current?.focus(), 0)
                          }
                        } else if (!editable && onChordClick) {
                          onChordClick(chord.chord)
                        }
                      }}
                      onPointerDown={(event) => {
                        if (!editable || isEditing) return
                        event.preventDefault()
                        event.stopPropagation()
                        onSelectChord?.(line.id, chord.id, chord.charIndex, chord.chord)
                        setPendingDrag({
                          chordId: chord.id,
                          lineId: line.id,
                          startX: event.clientX,
                          startNudgePx: chord.nudgePx,
                        })
                      }}
                    >
                      {isEditing && onChordChange ? (
                        <input
                          ref={chordInputRef}
                          type="text"
                          value={chord.chord}
                          onChange={(e) => onChordChange(line.id, chord.id, e.target.value)}
                          onBlur={() => {
                            setEditingChordId(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              chordInputRef.current?.blur()
                            }
                            e.stopPropagation()
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="min-w-[2ch] rounded border-0 bg-transparent px-2 py-1 font-mono text-inherit outline-none"
                        />
                      ) : (
                        chord.chord
                      )}
                    </div>
                  )
                })}

                {editable && selectedCaret?.lineId === line.id ? (
                  <span
                    className="absolute w-[2px] rounded-full bg-[var(--ax-caret)]"
                    style={{
                      left: SCORE_SIDE_PADDING_PX + selectedCaret.charIndex * CHAR_WIDTH_PX,
                      top: 44,
                      height: 30,
                    }}
                  />
                ) : null}

                {isEditor ? (
                  <textarea
                    value={line.lyric}
                    onClick={(event) => event.stopPropagation()}
                    onPointerDown={(event) => event.stopPropagation()}
                    onChange={(event) => onLineLyricChange?.(line.id, event.target.value)}
                    onBlur={(event) => onLineLyricCommit?.(line.id, event.target.value)}
                    className={`absolute resize-none overflow-hidden border-none bg-transparent p-0 font-mono text-zinc-950 outline-none ${lyricSize} ${wordSpacing}`}
                    style={{
                      left: SCORE_SIDE_PADDING_PX,
                      top: density === 'live' ? 46 : 44,
                      width: (isPaired ? 'calc(100% - 56px)' : rowWidth - SCORE_SIDE_PADDING_PX * 2) as number | string,
                      height: 30,
                    }}
                    rows={1}
                    spellCheck={false}
                  />
                ) : (
                  <p
                    className={`absolute whitespace-pre font-mono text-zinc-950 ${lyricSize} ${wordSpacing}`}
                    style={{
                      left: SCORE_SIDE_PADDING_PX,
                      top: density === 'live' ? 46 : 44,
                    }}
                  >
                    {line.lyric || ' '}
                  </p>
                )}
              </div>
            </div>
    )
  }

  return (
    <div
      className={
        isSheet
          ? `score-scroll min-w-full overflow-x-auto rounded-[28px] border border-zinc-300 bg-white p-4 shadow-[0_18px_48px_rgba(15,23,42,0.05)] ${rowGap} ${density === 'live' ? 'mx-auto max-w-[1920px] overflow-y-visible' : 'overflow-y-hidden'}`
          : isEditor
            ? `score-scroll overflow-x-auto overflow-y-hidden p-4 ${rowGap}`
            : `score-scroll overflow-x-auto overflow-y-hidden rounded-[28px] border border-zinc-200 bg-white p-4 ${rowGap}`
      }
    >
      {rows.map((row, rowIndex) => {
          const lineIndex = rows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0)
          const firstLine = row[0]!
          const prevLastLine = rowIndex > 0 ? rows[rowIndex - 1]?.at(-1) : null
          const showSectionHeader =
            !isEditor &&
            (prevLastLine == null || firstLine.sectionType !== prevLastLine.sectionType) &&
            (firstLine.sectionType ?? 'verso') !== 'verso'

          const lineContent =
            row.length === 1 ? (
              <div key={row[0]!.id}>{renderLine(row[0]!, lineIndex, false, undefined, lineIndex % 2 === 1)}</div>
            ) : (
              <div
                key={row.map((l) => l.id).join('-')}
                className="flex w-full items-stretch gap-4 overflow-hidden"
              >
                <div className="flex-1 min-w-0">{renderLine(row[0]!, lineIndex, true, row[0]!.id, lineIndex % 2 === 1)}</div>
                <div className="w-0.5 shrink-0 bg-zinc-400" aria-hidden title="Divisão entre blocos" />
                <div className="flex-1 min-w-0">{renderLine(row[1]!, lineIndex + 1, true, row[0]!.id, (lineIndex + 1) % 2 === 1)}</div>
              </div>
            )

          return (
            <div key={row.map((l) => l.id).join('-')} className="space-y-2">
              {showSectionHeader ? (
                <div className="flex items-center gap-2 pt-2 first:pt-0">
                  <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                    {SECTION_LABELS[firstLine.sectionType ?? 'verso']}
                  </span>
                </div>
              ) : null}
              {lineContent}
            </div>
          )
        })}
    </div>
  )
}
