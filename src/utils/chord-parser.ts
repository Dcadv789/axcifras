import type { ChordPlacement, SongLine, TimeSignature } from '../types/song'

const CHORD_PATTERN =
  /^(N\.C\.|[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|m7|maj7|m9|7|9|11|13|4|5|6|2)?(?:\/[A-G](?:#|b)?)?(?:\([^)]+\))?)$/i

const MIN_VISIBLE_CHARS = 12
const CHARS_PER_BEAT = 4
const IMPORT_WORD_GAP_SPACES = 3

export const CHAR_WIDTH_PX = 12
export const BEAT_WIDTH_PX = 84
export const SCORE_SIDE_PADDING_PX = 28

const LETTER_PATTERN = /[A-Za-zÀ-ÖØ-öø-ÿ]/
const WORD_PATTERN = /[A-Za-zÀ-ÖØ-öø-ÿ'’]+(?:-[A-Za-zÀ-ÖØ-öø-ÿ'’]+)*/g
const STRONG_VOWELS = new Set(['a', 'e', 'o', 'á', 'à', 'â', 'ã', 'é', 'ê', 'ó', 'ô', 'õ'])
const WEAK_VOWELS = new Set(['i', 'u', 'í', 'ú', 'ü'])
const ACCENTED_WEAK_VOWELS = new Set(['í', 'ú'])
const ALLOWED_ONSET_CLUSTERS = new Set([
  'bl',
  'br',
  'cl',
  'cr',
  'dr',
  'fl',
  'fr',
  'gl',
  'gr',
  'pl',
  'pr',
  'tr',
  'vr',
  'ch',
  'lh',
  'nh',
])
const PORTUGUESE_HINTS = new Set([
  'a',
  'ao',
  'aos',
  'as',
  'cada',
  'com',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'em',
  'faz',
  'meu',
  'minha',
  'na',
  'nas',
  'no',
  'nos',
  'o',
  'os',
  'para',
  'pra',
  'que',
  'sem',
  'sobre',
  'teu',
  'todos',
  'tua',
  'um',
  'uma',
  'vai',
  'vamos',
])

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

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isLetter(char: string) {
  return LETTER_PATTERN.test(char)
}

function isPronouncedVowel(word: string, index: number) {
  const char = word[index]?.toLowerCase() ?? ''

  if (!char || (!STRONG_VOWELS.has(char) && !WEAK_VOWELS.has(char))) {
    return false
  }

  if (char !== 'u') {
    return true
  }

  const previous = word[index - 1]?.toLowerCase() ?? ''
  const next = word[index + 1]?.toLowerCase() ?? ''

  if ((previous === 'q' || previous === 'g') && (next === 'e' || next === 'i')) {
    return false
  }

  return true
}

function shouldMergeVowels(left: string, right: string) {
  if (!left || !right) {
    return false
  }

  const leftLower = left.toLowerCase()
  const rightLower = right.toLowerCase()

  if (stripDiacritics(leftLower) === stripDiacritics(rightLower)) {
    return false
  }

  if (ACCENTED_WEAK_VOWELS.has(leftLower) || ACCENTED_WEAK_VOWELS.has(rightLower)) {
    return false
  }

  const leftIsWeak = WEAK_VOWELS.has(leftLower)
  const rightIsWeak = WEAK_VOWELS.has(rightLower)

  if (leftIsWeak && rightIsWeak) {
    return true
  }

  if (STRONG_VOWELS.has(leftLower) && rightIsWeak && rightLower !== 'í' && rightLower !== 'ú') {
    return true
  }

  return false
}

function getWordBoundaries(word: string) {
  const boundaries: number[] = []
  let cursor = 0

  while (cursor < word.length) {
    let nucleusStart = -1

    for (let index = cursor; index < word.length; index += 1) {
      if (isPronouncedVowel(word, index)) {
        nucleusStart = index
        break
      }
    }

    if (nucleusStart === -1) {
      break
    }

    let nucleusEnd = nucleusStart

    while (
      nucleusEnd + 1 < word.length &&
      isPronouncedVowel(word, nucleusEnd + 1) &&
      shouldMergeVowels(word[nucleusEnd] ?? '', word[nucleusEnd + 1] ?? '')
    ) {
      nucleusEnd += 1
    }

    let nextNucleusStart = -1

    for (let index = nucleusEnd + 1; index < word.length; index += 1) {
      if (isPronouncedVowel(word, index)) {
        nextNucleusStart = index
        break
      }
    }

    if (nextNucleusStart === -1) {
      break
    }

    const consonantStart = nucleusEnd + 1
    const consonantCluster = word.slice(consonantStart, nextNucleusStart).toLowerCase()
    let splitAt = nextNucleusStart

    if (consonantCluster.length === 1) {
      splitAt = consonantStart
    } else if (consonantCluster.length === 2) {
      splitAt = ALLOWED_ONSET_CLUSTERS.has(consonantCluster)
        ? consonantStart
        : consonantStart + 1
    } else if (consonantCluster.length >= 3) {
      const tailCluster = consonantCluster.slice(-2)
      splitAt = ALLOWED_ONSET_CLUSTERS.has(tailCluster)
        ? nextNucleusStart - 2
        : nextNucleusStart - 1
    }

    if (splitAt <= cursor || splitAt >= word.length) {
      break
    }

    boundaries.push(splitAt)
    cursor = splitAt
  }

  return boundaries
}

function createCleanWordMapping(token: string) {
  let cleanWord = ''
  const originalToClean: number[] = [0]
  let cleanLength = 0

  for (let index = 0; index < token.length; index += 1) {
    const current = token[index] ?? ''
    const previous = token[index - 1] ?? ''
    const next = token[index + 1] ?? ''
    const isSyllableHyphen = current === '-' && isLetter(previous) && isLetter(next)

    if (!isSyllableHyphen) {
      cleanWord += current
      cleanLength += 1
    }

    originalToClean.push(cleanLength)
  }

  return {
    cleanWord,
    originalToClean,
  }
}

function syllabifyWordWithMap(token: string) {
  const { cleanWord, originalToClean } = createCleanWordMapping(token)
  const boundaries = getWordBoundaries(cleanWord)

  if (boundaries.length === 0) {
    return {
      text: cleanWord,
      originalToNew: originalToClean,
    }
  }

  const boundarySet = new Set(boundaries)
  let text = ''

  for (let index = 0; index < cleanWord.length; index += 1) {
    if (boundarySet.has(index)) {
      text += '-'
    }

    text += cleanWord[index]
  }

  const cleanToNew: number[] = [0]
  let insertedHyphens = 0
  let boundaryIndex = 0

  for (let position = 1; position <= cleanWord.length; position += 1) {
    while (boundaryIndex < boundaries.length && boundaries[boundaryIndex] < position) {
      insertedHyphens += 1
      boundaryIndex += 1
    }

    cleanToNew[position] = position + insertedHyphens
  }

  return {
    text,
    originalToNew: originalToClean.map((cleanIndex) => cleanToNew[cleanIndex] ?? cleanIndex),
  }
}

export function isLikelyPortugueseText(text: string) {
  if (!text.trim()) {
    return false
  }

  if (/[áàâãéêíóôõúç]/i.test(text)) {
    return true
  }

  const normalized = stripDiacritics(text.toLowerCase())
  const words = normalized.match(/[a-z]+/g) ?? []

  if (words.length === 0) {
    return false
  }

  let hintCount = 0

  for (const word of words) {
    if (PORTUGUESE_HINTS.has(word)) {
      hintCount += 1
    }
  }

  if (hintCount >= 2 || hintCount / words.length >= 0.3) {
    return true
  }

  return /(nh|lh|qu|gu|cao|coes|oes|aes)/.test(normalized)
}

function buildIdentityMap(length: number) {
  return Array.from({ length: length + 1 }, (_, index) => index)
}

function composeMaps(first: number[], second: number[]) {
  return first.map((value) => {
    const safeValue = Math.min(Math.max(value, 0), second.length - 1)
    return second[safeValue] ?? safeValue
  })
}

export function syllabifyPortugueseText(text: string) {
  if (!isLikelyPortugueseText(text)) {
    return {
      text,
      originalToNew: buildIdentityMap(text.length),
    }
  }

  let result = ''
  const originalToNew: number[] = [0]
  let cursor = 0

  for (const match of text.matchAll(WORD_PATTERN)) {
    const token = match[0] ?? ''
    const start = match.index ?? 0

    while (cursor < start) {
      result += text[cursor]
      cursor += 1
      originalToNew[cursor] = result.length
    }

    const transformed = syllabifyWordWithMap(token)
    const tokenBaseOffset = result.length
    result += transformed.text

    for (let position = 1; position <= token.length; position += 1) {
      originalToNew[start + position] = tokenBaseOffset + (transformed.originalToNew[position] ?? position)
    }

    cursor = start + token.length
  }

  while (cursor < text.length) {
    result += text[cursor]
    cursor += 1
    originalToNew[cursor] = result.length
  }

  return {
    text: result,
    originalToNew,
  }
}

function expandWordSpacing(text: string, spacesPerGap: number = IMPORT_WORD_GAP_SPACES) {
  let result = ''
  const originalToNew: number[] = [0]
  let cursor = 0

  while (cursor < text.length) {
    const current = text[cursor] ?? ''

    if (!/\s/.test(current)) {
      result += current
      cursor += 1
      originalToNew[cursor] = result.length
      continue
    }

    const runStart = cursor

    while (cursor < text.length && /\s/.test(text[cursor] ?? '')) {
      cursor += 1
    }

    const runLength = cursor - runStart
    const leftNeighbor = text[runStart - 1] ?? ''
    const rightNeighbor = text[cursor] ?? ''
    const betweenWords =
      runStart > 0 && cursor < text.length && !/\s/.test(leftNeighbor) && !/\s/.test(rightNeighbor)

    if (!betweenWords) {
      result += text.slice(runStart, cursor)

      for (let offset = 1; offset <= runLength; offset += 1) {
        originalToNew[runStart + offset] = result.length - (runLength - offset)
      }

      continue
    }

    const replacement = ' '.repeat(spacesPerGap)
    const baseOffset = result.length
    result += replacement

    for (let offset = 1; offset <= runLength; offset += 1) {
      const ratio = Math.round((offset / runLength) * replacement.length)
      originalToNew[runStart + offset] = baseOffset + ratio
    }
  }

  return {
    text: result,
    originalToNew,
  }
}

export function normalizeImportedLyricText(text: string) {
  const syllabified = syllabifyPortugueseText(text)
  const spaced = expandWordSpacing(syllabified.text)

  return {
    text: spaced.text,
    originalToNew: composeMaps(syllabified.originalToNew, spaced.originalToNew),
  }
}

export function normalizeSongLineLyric(line: SongLine, nextLyric: string = line.lyric): SongLine {
  const transformed = normalizeImportedLyricText(nextLyric)

  return {
    ...line,
    lyric: transformed.text,
    chords: line.chords.map((chord) => ({
      ...chord,
      charIndex:
        transformed.originalToNew[Math.min(Math.max(chord.charIndex, 0), nextLyric.length)] ??
        chord.charIndex,
    })),
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

export function parseChordLine(line: string) {
  const chords: ChordPlacement[] = []
  const matcher = /\S+/g

  for (const match of line.matchAll(matcher)) {
    chords.push(createChordToken(match[0], match.index ?? 0))
  }

  return chords
}

function isTabLine(line: string): boolean {
  const t = line.trim()
  return /^[A-G]b?\|[-\d|\s]+$/.test(t) || /^\|[-\d|\s]+$/.test(t) || /^[-]+$/.test(t)
}

function isSectionHeader(line: string): boolean {
  const t = line.trim()
  return (t.startsWith('[') && t.endsWith(']')) || /^Parte\s+\d+\s+de\s+\d+$/i.test(t)
}

function isChordProgressionOnly(line: string): boolean {
  const t = line.trim()
  if (!t.startsWith('(') || !t.endsWith(')')) return false
  const inner = t.slice(1, -1).trim()
  return isChordLine(inner)
}

export function preprocessCifraClubInput(rawInput: string): string {
  const source = rawInput.replace(/\r\n/g, '\n')
  const rawLines = source.split('\n')
  const result: string[] = []

  for (let i = 0; i < rawLines.length; i += 1) {
    const line = rawLines[i] ?? ''
    const trimmed = line.trim()

    if (!trimmed) {
      result.push('')
      continue
    }

    if (isTabLine(line)) continue
    if (isChordProgressionOnly(line)) continue
    if (isSectionHeader(trimmed) && !isChordLine(trimmed)) {
      result.push('')
      continue
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const afterBracket = trimmed.replace(/^\[.*?\]\s*/, '')
      if (afterBracket && isChordLine(afterBracket)) {
        result.push(afterBracket)
        continue
      }
    }

    result.push(line)
  }

  return result.join('\n')
}

export function parseChordSheet(rawInput: string) {
  const preprocessed = preprocessCifraClubInput(rawInput)
  const rawLines = preprocessed.split('\n')
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
      const transformed = normalizeImportedLyricText(next)

      lines.push({
        id: createId('line'),
        lyric: transformed.text,
        chords: parseChordLine(current).map((chord) => ({
          ...chord,
          charIndex:
            transformed.originalToNew[Math.min(Math.max(chord.charIndex, 0), next.length)] ??
            chord.charIndex,
        })),
      })
      index += 1
      continue
    }

    lines.push({
      id: createId('line'),
      lyric: normalizeImportedLyricText(current).text,
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

export function insertChordInLine(line: SongLine, charIndex: number, chordName: string): SongLine {
  const safeIndex = Math.min(Math.max(charIndex, 0), line.lyric.length)
  const trimmed = chordName.trim()
  if (!trimmed) return line

  const newChord = createChordToken(trimmed, safeIndex)
  const spaceCount = Math.max(1, Math.ceil(trimmed.length / 4))

  return {
    ...line,
    lyric: `${line.lyric.slice(0, safeIndex)}${' '.repeat(spaceCount)}${line.lyric.slice(safeIndex)}`,
    chords: [
      ...line.chords.filter((c) => c.charIndex < safeIndex),
      newChord,
      ...line.chords
        .filter((c) => c.charIndex >= safeIndex)
        .map((c) => ({ ...c, charIndex: c.charIndex + spaceCount })),
    ].sort((a, b) => a.charIndex - b.charIndex),
  }
}

export function removeChordFromLine(line: SongLine, chordId: string): SongLine {
  const chord = line.chords.find((c) => c.id === chordId)
  if (!chord) return line

  const spaceCount = Math.max(1, Math.ceil(chord.chord.length / 4))
  const safeIndex = chord.charIndex

  return {
    ...line,
    lyric: `${line.lyric.slice(0, safeIndex)}${line.lyric.slice(safeIndex + spaceCount)}`,
    chords: line.chords
      .filter((c) => c.id !== chordId)
      .map((c) =>
        c.charIndex > safeIndex ? { ...c, charIndex: Math.max(0, c.charIndex - spaceCount) } : c,
      ),
  }
}
