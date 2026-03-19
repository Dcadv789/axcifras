import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { Song } from '../types/song'
import { deleteSong as deleteSongFromApi, fetchSongs, saveSong as saveSongToApi } from '../services/song-api'
import { SongsContext, type SongsContextValue } from './songs-context'

export function SongsProvider({ children }: PropsWithChildren) {
  const { accessToken } = useAuth()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshSongs = useCallback(async () => {
    if (!accessToken) {
      setSongs([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const remoteSongs = await fetchSongs()
      setSongs(remoteSongs)
    } catch (error) {
      console.error('Failed to load songs from PostgREST', error)
      setSongs([])
    } finally {
      setIsLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void refreshSongs()
  }, [refreshSongs])

  const value = useMemo<SongsContextValue>(
    () => ({
      songs,
      isLoading,
      async saveSong(draft, existingId) {
        const savedSong = await saveSongToApi(draft, existingId)

        setSongs((currentSongs) => {
          const exists = currentSongs.some((song) => song.id === savedSong.id)
          const nextSongs = exists
            ? currentSongs.map((song) => (song.id === savedSong.id ? savedSong : song))
            : [savedSong, ...currentSongs]

          return [...nextSongs].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        })

        return savedSong
      },
      async deleteSong(songId) {
        await deleteSongFromApi(songId)
        setSongs((currentSongs) => currentSongs.filter((song) => song.id !== songId))
      },
      getSong(songId) {
        return songs.find((song) => song.id === songId)
      },
      refreshSongs,
    }),
    [isLoading, refreshSongs, songs],
  )

  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>
}
