/**
 * Mapeia cifras para teclas do piano (posições em semitons).
 * C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
 */

const ROOT_SEMITONES: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

const CHORD_INTERVALS: Record<string, number[]> = {
  '': [0, 4, 7],
  maj: [0, 4, 7],
  m: [0, 3, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  min7: [0, 3, 7, 10],
  dim7: [0, 3, 6, 9],
  '9': [0, 4, 7, 10, 14],
  m9: [0, 3, 7, 10, 14],
  '11': [0, 4, 7, 10, 14, 17],
  '13': [0, 4, 7, 10, 14, 17, 21],
  add9: [0, 4, 7, 14],
  '2': [0, 2, 4, 7],
  '5': [0, 7],
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
}

const CHORD_PATTERN =
  /^([A-G](?:#|b)?)(maj|min|m|dim|aug|sus2|sus4|add9|7|maj7|m7|min7|dim7|9|m9|11|13|5|6|m6|2)?(\/[A-G](?:#|b)?)?$/i

function parseChordName(chordStr: string): { root: number; intervals: number[]; bass?: number } | null {
  const clean = chordStr.replace(/\s/g, '').replace(/\(.*?\)/g, '')
  const match = clean.match(CHORD_PATTERN)
  if (!match) return null

  const [, rootStr, quality, bassStr] = match
  const root = ROOT_SEMITONES[rootStr ?? 'C']
  if (root === undefined) return null

  const qualityKey = (quality ?? '').toLowerCase()
  const intervals = CHORD_INTERVALS[qualityKey] ?? CHORD_INTERVALS['']
  const bassNote = bassStr ? bassStr.replace(/^\//, '') : ''
  const bass = bassNote ? ROOT_SEMITONES[bassNote] : undefined

  return { root, intervals, bass }
}

export function chordToPianoKeys(chordStr: string): number[] {
  const clean = chordStr.trim().toUpperCase()
  if (clean === 'N.C.' || clean === 'NC') return []

  const parsed = parseChordName(chordStr)
  if (!parsed) return []

  const { root, intervals, bass } = parsed
  const keys = new Set<number>()

  intervals.forEach((interval) => {
    let semitone = (root + interval) % 12
    if (semitone < 0) semitone += 12
    keys.add(semitone)
  })

  if (bass !== undefined) {
    keys.add(bass)
  }

  return Array.from(keys).sort((a, b) => a - b)
}

export function chordToPianoKeysWithOctave(chordStr: string, baseOctave = 4): number[] {
  const parsed = parseChordName(chordStr)
  if (!parsed) return []

  const { root, intervals, bass } = parsed
  const keys: number[] = []

  const addKey = (semitone: number, octave: number) => {
    keys.push(octave * 12 + semitone)
  }

  intervals.forEach((interval) => {
    let semitone = (root + interval) % 12
    if (semitone < 0) semitone += 12
    addKey(semitone, baseOctave)
  })

  if (bass !== undefined) {
    addKey(bass, baseOctave - 1)
  }

  return keys.sort((a, b) => a - b)
}

export const PIANO_KEY_LABELS: Record<number, string> = {
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'D#',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'A#',
  11: 'B',
}
