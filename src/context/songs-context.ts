import { createContext } from 'react'
import type { Song, SongDraft } from '../types/song'

export interface SongsContextValue {
  songs: Song[]
  isLoading: boolean
  saveSong: (draft: SongDraft, existingId?: string) => Song
  deleteSong: (songId: string) => void
  getSong: (songId: string) => Song | undefined
}

export const SongsContext = createContext<SongsContextValue | null>(null)
