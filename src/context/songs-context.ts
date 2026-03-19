import { createContext } from 'react'
import type { Song, SongDraft } from '../types/song'

export interface SongsContextValue {
  songs: Song[]
  isLoading: boolean
  saveSong: (draft: SongDraft, existingId?: string) => Promise<Song>
  deleteSong: (songId: string) => Promise<void>
  getSong: (songId: string) => Song | undefined
  refreshSongs: () => Promise<void>
}

export const SongsContext = createContext<SongsContextValue | null>(null)
