export type TimeSignature = '4/4' | '3/4' | '6/8'

export interface ChordPlacement {
  id: string
  chord: string
  charIndex: number
  nudgePx: number
}

export interface SongLine {
  id: string
  lyric: string
  chords: ChordPlacement[]
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

export interface AuthUser {
  id: string
  email: string
}

export interface AuthResult {
  message: string | null
}
