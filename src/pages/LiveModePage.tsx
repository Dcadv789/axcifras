import { useEffect, useRef, useState } from 'react'
import { BookOpen, Maximize2, Pause, Piano, Play, SlidersHorizontal } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ChordManualModal } from '@/components/chords/ChordManualModal'
import { PianoKeyboard } from '@/components/chords/PianoKeyboard'
import { SimplifiedScore } from '@/components/songs/SimplifiedScore'
import { chordToPianoKeys } from '@/utils/chord-to-keys'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSongs } from '@/hooks/useSongs'

export function LiveModePage() {
  const { songId } = useParams()
  const { getSong, isLoading } = useSongs()
  const song = songId ? getSong(songId) : undefined
  const [autoScroll, setAutoScroll] = useState(true)
  const [speedFactor, setSpeedFactor] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showChordKeys, setShowChordKeys] = useState(true)
  const [selectedChordName, setSelectedChordName] = useState<string | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (!autoScroll || !song) return

    let frameId = 0
    let timeoutId = 0

    const startScroll = () => {
      const container = scrollRef.current
      if (!container) return

      let lastTimestamp = 0
      const pixelsPerSecond = Math.max(48, (song.bpm / 60) * 60 * speedFactor)

      const step = (timestamp: number) => {
        if (!lastTimestamp) lastTimestamp = timestamp
        const deltaSeconds = (timestamp - lastTimestamp) / 1000
        lastTimestamp = timestamp

        const limit = container.scrollHeight - container.clientHeight
        if (limit > 0) {
          const nextScrollTop = container.scrollTop + deltaSeconds * pixelsPerSecond
          container.scrollTop = Math.min(nextScrollTop, limit)
        }

        if (container.scrollTop < limit) {
          frameId = window.requestAnimationFrame(step)
        }
      }

      frameId = window.requestAnimationFrame(step)
    }

    timeoutId = window.setTimeout(startScroll, 150)

    return () => {
      clearTimeout(timeoutId)
      window.cancelAnimationFrame(frameId)
    }
  }, [autoScroll, song, speedFactor])

  if (songId && isLoading) {
    return <div className="min-h-screen bg-white" />
  }

  if (!song) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-zinc-200 px-4 py-4 xl:px-8">
          <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full border border-zinc-200 bg-white text-zinc-600 hover:bg-white">
                  Modo palco
                </Badge>
                <Badge className="rounded-full border border-red-100 bg-white text-[#c62424] hover:bg-white">
                  {song.bpm} BPM base
                </Badge>
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-[-0.05em] sm:text-3xl">{song.title}</h1>
              <p className="mt-2 text-sm text-zinc-500">
                {song.artist} • {song.keySignature} • {song.timeSignature}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-[28px] border border-zinc-200 bg-white px-3 py-3">
              <Link
                to={`/songs/${song.id}/view`}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
                )}
              >
                Sair do modo ao vivo
              </Link>

              <div className="inline-flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2">
                <SlidersHorizontal className="size-4 text-zinc-500" />
                <input
                  type="range"
                  min={0.6}
                  max={1.8}
                  step={0.05}
                  value={speedFactor}
                  onChange={(event) => setSpeedFactor(Number.parseFloat(event.target.value))}
                  className="w-28"
                />
                <span className="text-sm text-zinc-700">{speedFactor.toFixed(2)}x</span>
              </div>

              <Button
                type="button"
                onClick={() => setAutoScroll((current) => !current)}
                size="lg"
                className="rounded-2xl bg-[#c62424] text-white hover:bg-[#d92c2c]"
              >
                {autoScroll ? <Pause className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
                {autoScroll ? 'Pausar' : 'Retomar'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={async () => {
                  if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen()
                    return
                  }

                  await document.exitFullscreen()
                }}
                className="rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              >
                <Maximize2 className="mr-2 size-4" />
                {isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setShowChordKeys((v) => !v)}
                className={cn(
                  'rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
                  showChordKeys && 'border-red-200 bg-red-50 text-red-700',
                )}
              >
                <Piano className="mr-2 size-4" />
                {showChordKeys ? 'Teclas ativas' : 'Teclas desativadas'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setManualOpen(true)}
                className="rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              >
                <BookOpen className="mr-2 size-4" />
                Manual de cifras
              </Button>
            </div>
          </div>
        </header>

        {selectedChordName && showChordKeys && (
          <div className="border-b border-zinc-200 bg-white px-4 py-4 xl:px-8">
            <div className="mx-auto max-w-[1920px] rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-950">Teclado</h2>
                <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-800">
                  {selectedChordName}
                </span>
              </div>
              <div className="flex justify-center overflow-x-auto pb-2">
                <PianoKeyboard
                  activeSemitones={chordToPianoKeys(selectedChordName)}
                  octaves={1}
                  className="mx-auto"
                />
              </div>
            </div>
          </div>
        )}

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            ref={scrollRef}
            className="score-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto overscroll-contain px-4 pb-[50vh] pt-4 xl:px-8"
          >
            <SimplifiedScore
            lines={song.lines}
            timeSignature={song.timeSignature}
            density="live"
            presentation="sheet"
            onChordClick={
              showChordKeys
                ? (chord) => setSelectedChordName((prev) => (prev === chord ? null : chord))
                : undefined
            }
          />
          </div>
        </main>

        <ChordManualModal open={manualOpen} onClose={() => setManualOpen(false)} />
      </div>
    </div>
  )
}
