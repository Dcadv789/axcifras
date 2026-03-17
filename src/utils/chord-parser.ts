import type { ChordPlacement, SongLine, TimeSignature } from '../types/song'

const CHORD_PATTERN =
  /^(N\.C\.|[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|m7|maj7|m9|7|9|11|13|4|5|6|2)?(?:\/[A-G](?:#|b)?)?(?:\([^)]+\))?)$/i

const MIN_VISIBLE_CHARS = 12
const CHARS_PER_BEAT = 4

export const CHAR_WIDTH_PX = 12
export const BEAT_WIDTH_PX = 84
export const SCORE_SIDE_PADDING_PX = 28

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function createChordToken(chord: string, charIndex: number): ChordPlacement {
  return {
    id: createId('chord'),
    chord,
    charIndex,
    nudgePx: 0,
  }
}

function isChordLine(line: string) {
  const trimmed = line.trim()

  if (!trimmed) {
    return false
  }

  const tokens = trimmed.split(/\s+/)

  return tokens.length > 0 && tokens.every((token) => CHORD_PATTERN.test(token))
}

function parseChordLine(line: string) {
  const chords: ChordPlacement[] = []
  const matcher = /\S+/g

  for (const match of line.matchAll(matcher)) {
    chords.push(createChordToken(match[0], match.index ?? 0))
  }

  return chords
}

export function parseChordSheet(rawInput: string) {
  const source = rawInput.replace(/\r\n/g, '\n')
  const rawLines = source.split('\n')
  const lines: SongLine[] = []

  for (let index = 0; index < rawLines.length; index += 1) {
    const current = rawLines[index] ?? ''
    const next = rawLines[index + 1] ?? ''

    if (!current.trim()) {
      lines.push({
        id: createId('line'),
        lyric: '',
        chords: [],
      })
      continue
    }

    if (isChordLine(current) && next.length > 0 && !isChordLine(next)) {
      lines.push({
        id: createId('line'),
        lyric: next,
        chords: parseChordLine(current),
      })
      index += 1
      continue
    }

    lines.push({
      id: createId('line'),
      lyric: current,
      chords: [],
    })
  }

  return lines.length > 0
    ? lines
    : [
        {
          id: createId('line'),
          lyric: '',
          chords: [],
        },
      ]
}

export function getBeatsPerBar(timeSignature: TimeSignature) {
  return Number.parseInt(timeSignature.split('/')[0] ?? '4', 10)
}

export function getLineWidthPx(line: SongLine, timeSignature: TimeSignature) {
  const beatsPerBar = getBeatsPerBar(timeSignature)
  const contentLength = Math.max(
    MIN_VISIBLE_CHARS,
    line.lyric.length,
    ...line.chords.map((chord) => chord.charIndex + chord.chord.length),
  )
  const estimatedBeats = Math.max(beatsPerBar, Math.ceil(contentLength / CHARS_PER_BEAT))
  const measureCount = Math.max(1, Math.ceil(estimatedBeats / beatsPerBar))

  return measureCount * beatsPerBar * BEAT_WIDTH_PX + SCORE_SIDE_PADDING_PX * 2
}

export function getNearestCharIndex(offsetX: number) {
  return Math.max(0, Math.round((offsetX - SCORE_SIDE_PADDING_PX) / CHAR_WIDTH_PX))
}

export function insertSpaceInLine(line: SongLine, charIndex: number): SongLine {
  const safeIndex = Math.min(Math.max(charIndex, 0), line.lyric.length)

  return {
    ...line,
    lyric: `${line.lyric.slice(0, safeIndex)} ${line.lyric.slice(safeIndex)}`,
    chords: line.chords.map((chord) =>
      chord.charIndex >= safeIndex
        ? {
            ...chord,
            charIndex: chord.charIndex + 1,
          }
        : chord,
    ),
  }
}
