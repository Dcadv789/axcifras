import type { ChordPlacement, SectionType, SongLine } from '../types/song'
import { normalizeImportedLyricText, parseChordLine } from './chord-parser'

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

const CHORD_PATTERN =
  /^(N\.C\.|[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add|m7|maj7|m9|7|9|11|13|4|5|6|2)?(?:\/[A-G](?:#|b)?)?(?:\([^)]+\))?)$/i

function isChordLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  const tokens = trimmed.split(/\s+/)
  return tokens.length > 0 && tokens.every((token) => CHORD_PATTERN.test(token))
}

function isTabLine(line: string): boolean {
  const t = line.trim()
  return /^[A-G]b?\|[-\d|\s]+$/.test(t) || /^\|[-\d|\s]+$/.test(t) || /^[-]+$/.test(t)
}

const SECTION_MAP: Record<string, SectionType> = {
  intro: 'intro',
  introdução: 'intro',
  introducao: 'intro',
  verso: 'verso',
  verse: 'verso',
  refrão: 'refrão',
  refrao: 'refrão',
  chorus: 'refrão',
  coro: 'coro',
  ponte: 'ponte',
  bridge: 'ponte',
  solo: 'verso',
  outro: 'outro',
  final: 'final',
  ending: 'final',
  pré: 'intro',
  pre: 'intro',
  'pré-refrão': 'refrão',
  'pre-refrao': 'refrão',
}

function parseSectionType(header: string): SectionType | null {
  const inner = header.replace(/^\[|\]$/g, '').trim().toLowerCase()
  return SECTION_MAP[inner] ?? null
}

function extractKeyFromText(text: string): string | null {
  const patterns = [
    /tom:\s*([A-G][#b]?m?)/i,
    /tonalidade:\s*([A-G][#b]?m?)/i,
    /key:\s*([A-G][#b]?m?)/i,
    /tono:\s*([A-G][#b]?m?)/i,
    /\(([A-G][#b]?m?)\)/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractBpmFromText(text: string): number | null {
  const patterns = [
    /bpm:\s*(\d+)/i,
    /(\d+)\s*bpm/i,
    /tempo:\s*(\d+)/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const n = parseInt(match[1], 10)
      if (n >= 40 && n <= 240) return n
    }
  }
  return null
}

function extractTimeSignature(text: string): string | null {
  const match = text.match(/(\d+\/\d+)|compasso:\s*(\d+\/\d+)/i)
  return match ? (match[1] ?? match[2] ?? null) : null
}

function extractArtistFromText(text: string): string | null {
  const patterns = [
    /(?:artista|artist|por|by):\s*(.+?)(?:\n|$)/i,
    /^##\s*(.+)$/m,
    /^Artista:\s*(.+)$/im,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const artist = match[1].trim()?.replace(/^[-–—]\s*/, '')
      if (artist && artist.length > 1 && !isChordLine(artist)) return artist
    }
  }
  return null
}

function extractTitleFromText(text: string): string | null {
  const patterns = [
    /^#\s*(.+)$/m,
    /^Título:\s*(.+)$/im,
    /^Titulo:\s*(.+)$/im,
    /^Título da música:\s*(.+)$/im,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const title = match[1].trim()
      if (title && !isChordLine(title)) return title
    }
  }
  return null
}

export interface ImportResult {
  title: string
  artist: string
  keySignature: string
  timeSignature: string
  bpm: number
  rawInput: string
  lines: SongLine[]
}

export function parseImport(rawInput: string): ImportResult {
  const source = rawInput.replace(/\r\n/g, '\n').trim()
  const allLines = source.split('\n')

  let title = ''
  let artist = ''
  let keySignature = 'C'
  let timeSignature = '4/4'
  let bpm = 74

  const keyFromText = extractKeyFromText(source)
  if (keyFromText) keySignature = keyFromText

  const bpmFromText = extractBpmFromText(source)
  if (bpmFromText) bpm = bpmFromText

  const tsFromText = extractTimeSignature(source)
  if (tsFromText) timeSignature = tsFromText

  const titleFromText = extractTitleFromText(source)
  if (titleFromText) title = titleFromText

  const artistFromText = extractArtistFromText(source)
  if (artistFromText) artist = artistFromText

  if (!artist && allLines.length >= 2) {
    const secondLine = allLines[1]?.trim()
    if (
      secondLine &&
      secondLine.length < 60 &&
      !isChordLine(secondLine) &&
      !secondLine.startsWith('[') &&
      !/^(tom|bpm|composição|artista):/i.test(secondLine)
    ) {
      artist = secondLine
    }
  }

  const contentLines: string[] = []
  let foundFirstContent = false

  for (let i = 0; i < allLines.length; i += 1) {
    const line = allLines[i] ?? ''
    const trimmed = line.trim()

    if (!trimmed) {
      contentLines.push('')
      continue
    }

    if (isTabLine(line)) continue

    if (trimmed.startsWith('Composição') || trimmed.startsWith('Composicao') || trimmed.startsWith('Composer:')) continue
    if (/^tom:\s|^bpm:\s|^tonalidade:\s|^afinação:\s/i.test(trimmed)) continue
    if (trimmed.match(/^[A-G]b?\s+[A-G]b?\s+[A-G]b?\s+[A-G]b?\s+[A-G]b?\s+[A-G]b?\s*$/)) continue

    // Não incluir linhas de metadados no conteúdo (ficam só no cabeçalho)
    if (titleFromText && /^[#]?\s*t[ií]tulo[:\s]/i.test(trimmed)) continue
    if (artistFromText && /^[#]?\s*artista[:\s]/i.test(trimmed)) continue
    if (!foundFirstContent && (titleFromText || artistFromText)) {
      if (trimmed.startsWith('#') && titleFromText) continue
      if (trimmed.startsWith('##') && artistFromText) continue
    }

    contentLines.push(line)
    foundFirstContent = true
  }

  if (!title && contentLines.length > 0) {
    const firstContent = contentLines.find((l) => {
      const t = l.trim()
      return t.length > 0 && !t.startsWith('[') && !isChordLine(t) && !/^(tom|bpm|artista|composição):/i.test(t)
    })
    if (firstContent) {
      const t = firstContent.trim()
      if (t.length < 80 && t.length > 1) {
        title = t
      }
    }
  }

  // Remove title/artist from content when inferred from content (evita duplicar no editor)
  if (contentLines.length > 0 && (!titleFromText || !artistFromText)) {
    const filtered: string[] = []
    let skipTitle = !titleFromText && !!title
    let skipArtist = !artistFromText && !!artist

    for (const line of contentLines) {
      const t = line.trim()
      if (!t) {
        filtered.push(line)
        continue
      }
      if (t.startsWith('[') || isChordLine(t) || /^(tom|bpm|artista|composição):/i.test(t)) {
        filtered.push(line)
        continue
      }
      if (skipTitle && (t === title || t.toLowerCase() === title.toLowerCase())) {
        skipTitle = false
        continue
      }
      if (skipArtist && (t === artist || t.toLowerCase() === artist.toLowerCase())) {
        skipArtist = false
        continue
      }
      filtered.push(line)
    }
    contentLines.length = 0
    contentLines.push(...filtered)
  }

  function isChordProgressionOnly(line: string): boolean {
    const t = line.trim()
    if (!t.startsWith('(') || !t.endsWith(')')) return false
    const inner = t.slice(1, -1).trim()
    return isChordLine(inner)
  }

  const rawLines = contentLines.filter((line) => {
    const t = line.trim()
    if (!t) return true
    if (isTabLine(line)) return false
    if (isChordProgressionOnly(line)) return false
    return true
  })

  const lines: SongLine[] = []
  let currentSection: SectionType = 'verso'

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

    const trimmed = current.trim()

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const sectionType = parseSectionType(trimmed)
      if (sectionType) currentSection = sectionType

      const afterBracket = trimmed.replace(/^\[.*?\]\s*/, '')
      if (afterBracket && isChordLine(afterBracket)) {
        const transformed = normalizeImportedLyricText(next)
        if (next.length > 0 && !isChordLine(next)) {
          lines.push({
            id: createId('line'),
            lyric: transformed.text,
            chords: parseChordLine(afterBracket).map((chord: ChordPlacement) => ({
              ...chord,
              charIndex:
                transformed.originalToNew[Math.min(Math.max(chord.charIndex, 0), next.length)] ??
                chord.charIndex,
            })),
            sectionType: currentSection,
          })
          index += 1
        } else {
          lines.push({
            id: createId('line'),
            lyric: '',
            chords: parseChordLine(afterBracket),
            sectionType: currentSection,
          })
        }
        continue
      }
      continue
    }

    if (isChordLine(current) && next.length > 0 && !isChordLine(next)) {
      const transformed = normalizeImportedLyricText(next)

      lines.push({
        id: createId('line'),
        lyric: transformed.text,
        chords: parseChordLine(current).map((chord: ChordPlacement) => ({
          ...chord,
          charIndex:
            transformed.originalToNew[Math.min(Math.max(chord.charIndex, 0), next.length)] ??
            chord.charIndex,
        })),
        sectionType: currentSection,
      })
      index += 1
      continue
    }

    lines.push({
      id: createId('line'),
      lyric: normalizeImportedLyricText(current).text,
      chords: [],
      sectionType: currentSection,
    })
  }

  const finalLines =
    lines.length > 0
      ? lines
      : [
          {
            id: createId('line'),
            lyric: '',
            chords: [],
          } as SongLine,
        ]

  return {
    title: title || 'Título da música',
    artist: artist || 'Artista',
    keySignature,
    timeSignature,
    bpm,
    rawInput,
    lines: finalLines,
  }
}
