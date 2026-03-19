import { normalizeSongLineLyric, parseChordSheet } from '../utils/chord-parser'
import type { Song, SongDraft } from '../types/song'

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
    lines: song.lines.map((line) =>
      normalizeSongLineLyric({
        ...line,
        chords: line.chords.map((chord) => ({ ...chord })),
      }),
    ),
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
    lines: draft.lines.map((line) =>
      normalizeSongLineLyric({
        ...line,
        chords: line.chords.map((chord) => ({ ...chord })),
      }),
    ),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

export function getMockSongs(): Song[] {
  const mockDrafts: SongDraft[] = [
    {
      title: 'Hallelujah',
      artist: 'Leonard Cohen',
      keySignature: 'C',
      timeSignature: '4/4',
      bpm: 60,
      rawInput: `C                Am
Now I've heard there was a secret chord
C                   Am
That David played and it pleased the Lord
F                 G
But you don't really care for music, do you
C        F          G
It goes like this, the fourth, the fifth
Am               F
The minor fall, the major lift
G             E7            Am
The baffled king composing Hallelujah`,
      lines: parseChordSheet(`C                Am
Now I've heard there was a secret chord
C                   Am
That David played and it pleased the Lord
F                 G
But you don't really care for music, do you
C        F          G
It goes like this, the fourth, the fifth
Am               F
The minor fall, the major lift
G             E7            Am
The baffled king composing Hallelujah`),
    },
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
    {
      title: 'Horizonte em 6/8',
      artist: 'Noite de Estúdio',
      keySignature: 'C',
      timeSignature: '6/8',
      bpm: 68,
      rawInput: `C              G/B
So-bre o mar da ma-dru-ga-da
Am             F
Vai meu som se des-do-brar

C/E            G
Cada fra-se em mo-vi-men-to
F              G
Faz a lu-z do céu pulsar`,
      lines: parseChordSheet(`C              G/B
So-bre o mar da ma-dru-ga-da
Am             F
Vai meu som se des-do-brar

C/E            G
Cada fra-se em mo-vi-men-to
F              G
Faz a lu-z do céu pulsar`),
    },
    {
      title: 'Ciranda, Cirandinha',
      artist: 'Tradicional brasileira',
      keySignature: 'C',
      timeSignature: '3/4',
      bpm: 92,
      rawInput: `C              G
Ci-ran-da ci-ran-di-nha
G               C
Va-mos to-dos ci-ran-dar

C               F
Va-mos dar a mei-a-vol-ta
C        G        C
Vol-ta e mei-a va-mos dar`,
      lines: parseChordSheet(`C              G
Ci-ran-da ci-ran-di-nha
G               C
Va-mos to-dos ci-ran-dar

C               F
Va-mos dar a mei-a-vol-ta
C        G        C
Vol-ta e mei-a va-mos dar`),
    },
  ]

  return mockDrafts.map((draft) => createSongRecord(draft))
}
