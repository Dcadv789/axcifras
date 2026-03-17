import { useEffect, useState } from 'react'
import {
  BEAT_WIDTH_PX,
  CHAR_WIDTH_PX,
  SCORE_SIDE_PADDING_PX,
  getBeatsPerBar,
  getLineWidthPx,
  getNearestCharIndex,
} from '../../utils/chord-parser'
import type { SongLine, TimeSignature } from '../../types/song'

interface CaretSelection {
  lineId: string
  charIndex: number
}

interface SimplifiedScoreProps {
  lines: SongLine[]
  timeSignature: TimeSignature
  editable?: boolean
  density?: 'default' | 'live'
  selectedCaret?: CaretSelection | null
  onSelectCaret?: (lineId: string, charIndex: number) => void
  onChordNudge?: (lineId: string, chordId: string, nextNudgePx: number) => void
}

interface DragState {
  chordId: string
  lineId: string
  startX: number
  startNudgePx: number
}

export function SimplifiedScore({
  lines,
  timeSignature,
  editable = false,
  density = 'default',
  selectedCaret,
  onSelectCaret,
  onChordNudge,
}: SimplifiedScoreProps) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const beatsPerBar = getBeatsPerBar(timeSignature)
  const verticalPadding = density === 'live' ? 'py-8' : 'py-5'
  const lyricSize = density === 'live' ? 'text-[clamp(1.3rem,2vw,1.7rem)]' : 'text-base'
  const chordSize = density === 'live' ? 'text-[clamp(1.2rem,1.8vw,1.45rem)]' : 'text-sm'

  useEffect(() => {
    if (!dragState || !onChordNudge) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = event.clientX - dragState.startX
      onChordNudge(dragState.lineId, dragState.chordId, dragState.startNudgePx + deltaX)
    }

    const handlePointerUp = () => {
      setDragState(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [dragState, onChordNudge])

  return (
    <div className="score-scroll overflow-x-auto overflow-y-hidden rounded-[28px] border border-white/10 bg-black/15">
      <div className="min-w-full space-y-3 p-3">
        {lines.map((line) => {
          if (!line.lyric && line.chords.length === 0) {
            return <div key={line.id} className="h-5" />
          }

          const lineWidthPx = getLineWidthPx(line, timeSignature)
          const totalBeats = (lineWidthPx - SCORE_SIDE_PADDING_PX * 2) / BEAT_WIDTH_PX

          return (
            <div
              key={line.id}
              className={`subtle-panel relative rounded-[24px] ${verticalPadding}`}
              style={{ width: Math.max(lineWidthPx, 720) }}
            >
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: totalBeats + 1 }).map((_, beatIndex) => {
                  const isBarLine = beatIndex % beatsPerBar === 0
                  const left = SCORE_SIDE_PADDING_PX + beatIndex * BEAT_WIDTH_PX

                  return (
                    <span
                      key={`${line.id}-beat-${beatIndex}`}
                      className={`absolute inset-y-0 ${
                        isBarLine ? 'w-[2px] bg-white/18' : 'w-px bg-white/8'
                      }`}
                      style={{ left }}
                    />
                  )
                })}
              </div>

              <div
                className="relative h-[92px]"
                onClick={(event) => {
                  if (!editable || !onSelectCaret) {
                    return
                  }

                  const bounds = event.currentTarget.getBoundingClientRect()
                  const nextIndex = getNearestCharIndex(event.clientX - bounds.left)
                  onSelectCaret(line.id, nextIndex)
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/8" />
                <div className="absolute inset-x-0 bottom-[28px] h-px bg-white/12" />

                {line.chords.map((chord) => (
                  <button
                    key={chord.id}
                    type="button"
                    onPointerDown={(event) => {
                      if (!editable) {
                        return
                      }

                      event.preventDefault()
                      setDragState({
                        chordId: chord.id,
                        lineId: line.id,
                        startX: event.clientX,
                        startNudgePx: chord.nudgePx,
                      })
                    }}
                    className={`absolute top-3 rounded-md px-1.5 py-0.5 font-mono font-semibold text-gold ${chordSize} ${
                      editable ? 'cursor-grab border border-gold/10 bg-gold/10 active:cursor-grabbing' : 'cursor-default'
                    }`}
                    style={{
                      left: SCORE_SIDE_PADDING_PX + chord.charIndex * CHAR_WIDTH_PX + chord.nudgePx,
                      transform: 'translateX(-2px)',
                      touchAction: 'none',
                    }}
                  >
                    {chord.chord}
                  </button>
                ))}

                {editable && selectedCaret?.lineId === line.id ? (
                  <span
                    className="absolute bottom-[16px] top-[48px] w-[2px] rounded-full bg-[var(--ax-caret)]"
                    style={{
                      left: SCORE_SIDE_PADDING_PX + selectedCaret.charIndex * CHAR_WIDTH_PX,
                    }}
                  />
                ) : null}

                <p
                  className={`absolute bottom-2 left-0 whitespace-pre font-mono tracking-[0.02em] text-white ${lyricSize}`}
                  style={{
                    left: SCORE_SIDE_PADDING_PX,
                  }}
                >
                  {line.lyric || ' '}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
