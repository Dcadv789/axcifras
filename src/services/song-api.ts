import type { SectionType, Song, SongDraft, SongLine } from '@/types/song'
import { normalizeSongLineLyric } from '@/utils/chord-parser'
import { getPostgrestAuthUserId, postgrestRequest } from './postgrest'

interface SongRow {
  id: string
  title: string
  artist: string
  key_signature: string
  time_signature: string
  bpm: number
  raw_input: string
  created_at: string
  updated_at: string
}

interface SongLineRow {
  id: string
  song_id: string
  position: number
  lyric: string
  pair_with_next: boolean | null
  section_type: string | null
}

interface SongChordRow {
  id: string
  line_id: string
  position: number
  chord: string
  char_index: number
  nudge_px: number
}

function toInFilter(values: string[]) {
  return `in.(${values.map((value) => `"${value}"`).join(',')})`
}

function mapSectionTypeFromDb(value: string | null): SectionType | undefined {
  if (!value) {
    return undefined
  }

  const normalized = value.toLowerCase()
  if (normalized === 'refrao') return 'refrão'
  if (normalized === 'refrão') return 'refrão'
  if (
    normalized === 'verso' ||
    normalized === 'coro' ||
    normalized === 'intro' ||
    normalized === 'ponte' ||
    normalized === 'outro' ||
    normalized === 'final'
  ) {
    return normalized
  }

  return undefined
}

function mapSectionTypeToDb(value: SectionType | undefined) {
  if (!value) {
    return null
  }

  return value === 'refrão' ? 'refrao' : value
}

function mapSongGraph(song: SongRow, lineRows: SongLineRow[], chordRows: SongChordRow[]): Song {
  const songLines = lineRows
    .filter((line) => line.song_id === song.id)
    .sort((a, b) => a.position - b.position)
    .map((line): SongLine => ({
      id: line.id,
      lyric: line.lyric,
      pairWithNext: line.pair_with_next ?? undefined,
      sectionType: mapSectionTypeFromDb(line.section_type),
      chords: chordRows
        .filter((chord) => chord.line_id === line.id)
        .sort((a, b) => a.position - b.position)
        .map((chord) => ({
          id: chord.id,
          chord: chord.chord,
          charIndex: chord.char_index,
          nudgePx: chord.nudge_px,
        })),
    }))

  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    keySignature: song.key_signature,
    timeSignature: song.time_signature,
    bpm: song.bpm,
    rawInput: song.raw_input,
    lines: songLines,
    createdAt: song.created_at,
    updatedAt: song.updated_at,
  }
}

async function fetchSongRowsByIds(songIds: string[]) {
  if (songIds.length === 0) {
    return {
      lineRows: [] as SongLineRow[],
      chordRows: [] as SongChordRow[],
    }
  }

  const lineQuery = new URLSearchParams({
    select: 'id,song_id,position,lyric,pair_with_next,section_type',
    order: 'position.asc',
  })
  lineQuery.set('song_id', toInFilter(songIds))
  const lineRows = await postgrestRequest<SongLineRow[]>('song_lines', {
    query: lineQuery.toString(),
  })

  const lineIds = lineRows.map((line) => line.id)
  if (lineIds.length === 0) {
    return {
      lineRows,
      chordRows: [] as SongChordRow[],
    }
  }

  const chordQuery = new URLSearchParams({
    select: 'id,line_id,position,chord,char_index,nudge_px',
    order: 'position.asc',
  })
  chordQuery.set('line_id', toInFilter(lineIds))
  const chordRows = await postgrestRequest<SongChordRow[]>('song_chords', {
    query: chordQuery.toString(),
  })

  return {
    lineRows,
    chordRows,
  }
}

export async function fetchSongs() {
  const query = new URLSearchParams({
    select: 'id,title,artist,key_signature,time_signature,bpm,raw_input,created_at,updated_at',
    order: 'updated_at.desc',
  })
  const songRows = await postgrestRequest<SongRow[]>('songs', {
    query: query.toString(),
  })

  const { lineRows, chordRows } = await fetchSongRowsByIds(songRows.map((song) => song.id))
  return songRows.map((song) => mapSongGraph(song, lineRows, chordRows))
}

export async function fetchSongById(songId: string) {
  const query = new URLSearchParams({
    select: 'id,title,artist,key_signature,time_signature,bpm,raw_input,created_at,updated_at',
  })
  query.set('id', `eq.${songId}`)
  const songRows = await postgrestRequest<SongRow[]>('songs', { query: query.toString() })
  const song = songRows[0]

  if (!song) {
    return null
  }

  const { lineRows, chordRows } = await fetchSongRowsByIds([song.id])
  return mapSongGraph(song, lineRows, chordRows)
}

function buildSongPayload(draft: SongDraft) {
  return {
    title: draft.title.trim(),
    artist: draft.artist.trim(),
    key_signature: draft.keySignature.trim(),
    time_signature: draft.timeSignature.trim(),
    bpm: draft.bpm,
    raw_input: draft.rawInput,
    owner_user_id: getPostgrestAuthUserId() ?? null,
  }
}

export async function saveSong(draft: SongDraft, existingId?: string) {
  const payload = buildSongPayload(draft)
  let songId = existingId ?? ''

  if (existingId) {
    const query = new URLSearchParams({
      select: 'id',
    })
    query.set('id', `eq.${existingId}`)
    const rows = await postgrestRequest<Array<{ id: string }>>('songs', {
      method: 'PATCH',
      query: query.toString(),
      body: payload,
      prefer: 'return=representation',
    })
    const updated = rows[0]
    if (!updated) {
      throw new Error('Não foi possível atualizar a música.')
    }
    songId = updated.id
  } else {
    const query = new URLSearchParams({
      select: 'id',
    })
    const rows = await postgrestRequest<Array<{ id: string }>>('songs', {
      method: 'POST',
      query: query.toString(),
      body: payload,
      prefer: 'return=representation',
    })
    const inserted = rows[0]
    if (!inserted) {
      throw new Error('Não foi possível criar a música.')
    }
    songId = inserted.id
  }

  const deleteLinesQuery = new URLSearchParams()
  deleteLinesQuery.set('song_id', `eq.${songId}`)
  await postgrestRequest('song_lines', {
    method: 'DELETE',
    query: deleteLinesQuery.toString(),
    prefer: 'return=minimal',
  })

  const normalizedLines = draft.lines.map((line) => normalizeSongLineLyric(line, line.lyric))
  const linePayload = normalizedLines.map((line, position) => ({
    song_id: songId,
    position,
    lyric: line.lyric,
    pair_with_next: Boolean(line.pairWithNext),
    section_type: mapSectionTypeToDb(line.sectionType),
  }))

  const insertedLines =
    linePayload.length > 0
      ? await postgrestRequest<SongLineRow[]>('song_lines', {
          method: 'POST',
          query: 'select=id,song_id,position,lyric,pair_with_next,section_type',
          body: linePayload,
          prefer: 'return=representation',
        })
      : []

  const lineIdByPosition = new Map<number, string>()
  insertedLines.forEach((line) => {
    lineIdByPosition.set(line.position, line.id)
  })

  const chordPayload = normalizedLines.flatMap((line, linePosition) => {
    const lineId = lineIdByPosition.get(linePosition)
    if (!lineId) {
      return []
    }

    return line.chords.map((chord, position) => ({
      line_id: lineId,
      position,
      chord: chord.chord,
      char_index: chord.charIndex,
      nudge_px: Math.round(chord.nudgePx),
    }))
  })

  if (chordPayload.length > 0) {
    await postgrestRequest('song_chords', {
      method: 'POST',
      body: chordPayload,
      prefer: 'return=minimal',
    })
  }

  const savedSong = await fetchSongById(songId)
  if (!savedSong) {
    throw new Error('Música salva, mas não foi possível recarregar os dados.')
  }

  return savedSong
}

export async function deleteSong(songId: string) {
  const query = new URLSearchParams()
  query.set('id', `eq.${songId}`)
  await postgrestRequest('songs', {
    method: 'DELETE',
    query: query.toString(),
    prefer: 'return=minimal',
  })
}
