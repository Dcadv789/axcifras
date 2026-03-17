import { useContext } from 'react'
import { SongsContext } from '../context/songs-context'

export function useSongs() {
  const context = useContext(SongsContext)

  if (!context) {
    throw new Error('useSongs must be used within SongsProvider')
  }

  return context
}
