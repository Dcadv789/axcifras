import { parseChordSheet } from '../utils/chord-parser'
import type { Song, SongDraft } from '../types/song'

const SONGS_STORAGE_KEY = 'axpiano.songs.v1'

type SongsByUser = Record<string, Song[]>

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createEmptySongDraft(): SongDraft {
  const rawInput = `G              D/F#
Gra-ça surpre-en-den-te
Em             C
Som que acordou meu cora-ção`

  return {
    title: '',
    artist: '',
    keySignature: 'G',
    timeSignature: '4/4',
    bpm: 74,
    rawInput,
    lines: parseChordSheet(rawInput),
  }
}

export function createDraftFromSong(song: Song): SongDraft {
  return {
    title: song.title,
    artist: song.artist,
    keySignature: song.keySignature,
    timeSignature: song.timeSignature,
    bpm: song.bpm,
    rawInput: song.rawInput,
    lines: song.lines.map((line) => ({
      ...line,
      chords: line.chords.map((chord) => ({ ...chord })),
    })),
  }
}

export function createSongRecord(draft: SongDraft, existing?: Song): Song {
  const now = new Date().toISOString()

  return {
    id: existing?.id ?? createId('song'),
    title: draft.title.trim(),
    artist: draft.artist.trim(),
    keySignature: draft.keySignature.trim(),
    timeSignature: draft.timeSignature,
    bpm: draft.bpm,
    rawInput: draft.rawInput,
    lines: draft.lines.map((line) => ({
      ...line,
      chords: line.chords.map((chord) => ({ ...chord })),
    })),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

function getSeedSongs(): Song[] {
  const seedDrafts: SongDraft[] = [
    {
      title: 'Luz Sobre o Teclado',
      artist: 'AxPiano Session',
      keySignature: 'D',
      timeSignature: '4/4',
      bpm: 82,
      rawInput: `D              A/C#
Quando a no-i-te cai
Bm             G
Tua voz me guia em paz

Em             Bm
Cada a-cor-de a bri-lhar
G              A
Faz meu cora-ção cantar`,
      lines: parseChordSheet(`D              A/C#
Quando a no-i-te cai
Bm             G
Tua voz me guia em paz

Em             Bm
Cada a-cor-de a bri-lhar
G              A
Faz meu cora-ção cantar`),
    },
    {
      title: 'Sala de Ensaio',
      artist: 'AxPiano Trio',
      keySignature: 'Am',
      timeSignature: '3/4',
      bpm: 96,
      rawInput: `Am          F
To-do pul-sa em nós
C           G
No va-zio da can-ção

Am          F
Sem pres-sa pra cair
C            E
No tem-po do com-pas-so`,
      lines: parseChordSheet(`Am          F
To-do pul-sa em nós
C           G
No va-zio da can-ção

Am          F
Sem pres-sa pra cair
C            E
No tem-po do com-pas-so`),
    },
  ]

  return seedDrafts.map((draft) => createSongRecord(draft))
}

function readStore() {
  if (typeof window === 'undefined') {
    return {}
  }

  const raw = window.localStorage.getItem(SONGS_STORAGE_KEY)

  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw) as SongsByUser
  } catch {
    return {}
  }
}

function writeStore(payload: SongsByUser) {
  window.localStorage.setItem(SONGS_STORAGE_KEY, JSON.stringify(payload))
}

export function loadSongsForUser(userId: string) {
  const store = readStore()
  const existing = store[userId]

  if (existing && existing.length > 0) {
    return existing
  }

  const seeded = getSeedSongs()
  store[userId] = seeded
  writeStore(store)
  return seeded
}

export function saveSongsForUser(userId: string, songs: Song[]) {
  const store = readStore()
  store[userId] = songs
  writeStore(store)
}
