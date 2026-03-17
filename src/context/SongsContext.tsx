import { useMemo, useState, type PropsWithChildren } from 'react'
import { createSongRecord, loadSongsForUser, saveSongsForUser } from '../services/song-storage'
import type { Song } from '../types/song'
import { useAuth } from '../hooks/useAuth'
import { SongsContext, type SongsContextValue } from './songs-context'

export function SongsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth()
  const [songs, setSongs] = useState<Song[]>(() => (user ? loadSongsForUser(user.id) : []))
  const isLoading = false

  const value = useMemo<SongsContextValue>(
    () => ({
      songs,
      isLoading,
      saveSong(draft, existingId) {
        if (!user) {
          throw new Error('Nenhum usuário autenticado.')
        }

        let savedSong: Song | null = null

        setSongs((currentSongs) => {
          const existing = currentSongs.find((song) => song.id === existingId)
          const nextSong = createSongRecord(draft, existing)
          const nextSongs = existing
            ? currentSongs.map((song) => (song.id === existing.id ? nextSong : song))
            : [nextSong, ...currentSongs]

          saveSongsForUser(user.id, nextSongs)
          savedSong = nextSong
          return nextSongs
        })

        if (!savedSong) {
          throw new Error('Não foi possível salvar a música.')
        }

        return savedSong
      },
      deleteSong(songId) {
        if (!user) {
          return
        }

        setSongs((currentSongs) => {
          const nextSongs = currentSongs.filter((song) => song.id !== songId)
          saveSongsForUser(user.id, nextSongs)
          return nextSongs
        })
      },
      getSong(songId) {
        return songs.find((song) => song.id === songId)
      },
    }),
    [isLoading, songs, user],
  )

  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>
}
