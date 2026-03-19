import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PianoKeyboard } from './PianoKeyboard'
import { chordToPianoKeys } from '@/utils/chord-to-keys'
import { cn } from '@/lib/utils'

interface ChordManualModalProps {
  open: boolean
  onClose: () => void
}

const COMMON_CHORDS = [
  'C', 'Cm', 'C7', 'Cm7', 'Cmaj7', 'Cdim', 'Caug',
  'D', 'Dm', 'D7', 'Dm7', 'Dmaj7', 'D/F#', 'D/A',
  'E', 'Em', 'E7', 'Em7', 'Emaj7', 'E/G#',
  'F', 'Fm', 'F7', 'Fm7', 'Fmaj7', 'F/A', 'F/C',
  'G', 'Gm', 'G7', 'Gm7', 'Gmaj7', 'G/B', 'G/D',
  'A', 'Am', 'A7', 'Am7', 'Amaj7', 'A/C#', 'A/E',
  'B', 'Bm', 'B7', 'Bm7', 'Bmaj7', 'B/D#',
  'C#', 'C#m', 'D#', 'D#m', 'F#', 'F#m', 'G#', 'G#m', 'A#', 'A#m',
  'Db', 'Dbm', 'Eb', 'Ebm', 'Gb', 'Gbm', 'Ab', 'Abm', 'Bb', 'Bbm',
  'Dsus4', 'Asus4', 'Gsus4', 'Csus2', 'Dsus2', 'N.C.',
]

export function ChordManualModal({ open, onClose }: ChordManualModalProps) {
  const [selectedChord, setSelectedChord] = useState<string | null>(null)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-zinc-950">
            Manual de cifras – Teclado e piano
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <p className="mb-6 text-sm text-zinc-600">
            Clique em um acorde para ver as teclas. As teclas destacadas em vermelho indicam quais notas tocar.
          </p>

          <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-800">Teclado</h3>
              {selectedChord && (
                <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-800">
                  {selectedChord}
                </span>
              )}
            </div>
            <div className="flex justify-center overflow-x-auto py-4">
              <PianoKeyboard
                activeSemitones={selectedChord ? chordToPianoKeys(selectedChord) : []}
                octaves={1}
                className="mx-auto"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {COMMON_CHORDS.map((chord) => {
              const isSelected = selectedChord === chord
              const hasKeys = chordToPianoKeys(chord).length > 0

              return (
                <button
                  key={chord}
                  type="button"
                  onClick={() => setSelectedChord(isSelected ? null : chord)}
                  disabled={!hasKeys}
                  className={cn(
                    'rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all',
                    isSelected && 'border-red-400 bg-red-100 text-red-800',
                    hasKeys && !isSelected && 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50',
                    !hasKeys && 'cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-400',
                  )}
                >
                  {chord}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
