import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SimplifiedScore } from '../components/songs/SimplifiedScore'
import { useSongs } from '../hooks/useSongs'

export function LiveModePage() {
  const { songId } = useParams()
  const { getSong } = useSongs()
  const song = songId ? getSong(songId) : undefined
  const [autoScroll, setAutoScroll] = useState(true)
  const [speedFactor, setSpeedFactor] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (!autoScroll || !scrollRef.current || !song) {
      return
    }

    let frameId = 0
    let lastTimestamp = 0
    const container = scrollRef.current
    const pixelsPerSecond = Math.max(24, (song.bpm / 60) * 38 * speedFactor)

    const step = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp
      }

      const deltaSeconds = (timestamp - lastTimestamp) / 1000
      lastTimestamp = timestamp
      const nextScrollTop = container.scrollTop + deltaSeconds * pixelsPerSecond
      const limit = container.scrollHeight - container.clientHeight

      container.scrollTop = Math.min(nextScrollTop, limit)

      if (container.scrollTop < limit) {
        frameId = window.requestAnimationFrame(step)
      }
    }

    frameId = window.requestAnimationFrame(step)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [autoScroll, song, speedFactor])

  if (!song) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="relative min-h-screen bg-night text-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/50 to-transparent" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-black/35 px-4 py-4 backdrop-blur xl:px-8">
          <div className="mx-auto flex max-w-[1800px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/35">Modo ao vivo</div>
              <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                {song.title}
              </h1>
              <p className="mt-1 text-sm text-mist">
                {song.artist} • {song.keySignature} • {song.timeSignature} • {song.bpm} BPM
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-mist">
                Velocidade
                <input
                  type="range"
                  min={0.6}
                  max={1.8}
                  step={0.05}
                  value={speedFactor}
                  onChange={(event) => setSpeedFactor(Number.parseFloat(event.target.value))}
                  className="ml-3 align-middle"
                />
                <span className="ml-3 text-ink">{speedFactor.toFixed(2)}x</span>
              </label>
              <button
                type="button"
                onClick={() => setAutoScroll((current) => !current)}
                className="rounded-2xl bg-gold px-4 py-3 text-sm font-medium text-night"
              >
                {autoScroll ? 'Pausar scroll' : 'Retomar scroll'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen()
                    return
                  }

                  await document.exitFullscreen()
                }}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-mist"
              >
                {isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              </button>
              <Link
                to={`/songs/${song.id}/view`}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-mist"
              >
                Visual limpo
              </Link>
            </div>
          </div>
        </header>

        <main ref={scrollRef} className="score-scroll flex-1 overflow-y-auto px-4 py-6 xl:px-8">
          <div className="mx-auto max-w-[1800px] pb-[50vh]">
            <SimplifiedScore lines={song.lines} timeSignature={song.timeSignature} density="live" />
          </div>
        </main>
      </div>
    </div>
  )
}
