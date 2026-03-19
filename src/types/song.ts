export type TimeSignature = string

export interface ChordPlacement {
  id: string
  chord: string
  charIndex: number
  nudgePx: number
}

export type SectionType = 'verso' | 'refrão' | 'coro' | 'intro' | 'ponte' | 'outro' | 'final'

export interface SongLine {
  id: string
  lyric: string
  chords: ChordPlacement[]
  /** Quando true, esta linha e a próxima são exibidas lado a lado */
  pairWithNext?: boolean
  /** Tipo de seção (refrão, coro, etc.) para exibição e organização */
  sectionType?: SectionType
}

export interface Song {
  id: string
  title: string
  artist: string
  keySignature: string
  timeSignature: TimeSignature
  bpm: number
  rawInput: string
  lines: SongLine[]
  createdAt: string
  updatedAt: string
}

export interface SongDraft {
  title: string
  artist: string
  keySignature: string
  timeSignature: TimeSignature
  bpm: number
  rawInput: string
  lines: SongLine[]
}
