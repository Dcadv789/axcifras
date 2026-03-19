import { PIANO_KEY_LABELS } from '../../utils/chord-to-keys'

const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11]
const BLACK_KEYS = [1, 3, 6, 8, 10]

const BLACK_KEY_OFFSETS: Record<number, number> = {
  1: 0.7,
  3: 1.7,
  6: 3.7,
  8: 4.7,
  10: 5.7,
}

interface PianoKeyboardProps {
  activeSemitones?: number[]
  octaves?: number
  className?: string
}

export function PianoKeyboard({
  activeSemitones = [],
  octaves = 2,
  className = '',
}: PianoKeyboardProps) {
  const isActive = (semitone: number) => activeSemitones.includes(semitone % 12)

  return (
    <div className={`relative select-none ${className}`} style={{ width: octaves * 7 * 44 }}>
      {/* Teclas brancas */}
      <div className="relative flex">
        {Array.from({ length: octaves * 7 }, (_, i) => {
          const semitone = WHITE_KEYS[i % 7] + Math.floor(i / 7) * 12
          const active = isActive(semitone)
          const label = PIANO_KEY_LABELS[semitone % 12]

          return (
            <div
              key={`w-${semitone}`}
              className={`relative flex h-40 w-11 flex-col items-center justify-end rounded-b border-2 pb-4 shadow-sm transition-colors ${
                active
                  ? 'border-red-400 bg-red-100'
                  : 'border-zinc-300 bg-white'
              }`}
              style={{ minWidth: 44 }}
            >
              <span
                className={`text-base font-bold ${
                  active ? 'text-red-800' : 'text-zinc-400'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Teclas pretas - posicionadas sobre as brancas */}
      <div className="pointer-events-none absolute left-0 right-0 top-0">
        {Array.from({ length: octaves * 5 }, (_, i) => {
          const semitone = BLACK_KEYS[i % 5] + Math.floor(i / 5) * 12
          const active = isActive(semitone)
          const label = PIANO_KEY_LABELS[semitone % 12]
          const offsetInOctave = BLACK_KEY_OFFSETS[semitone % 12] ?? 0
          const octaveOffset = Math.floor(i / 5) * 7 * 44
          const leftPx = octaveOffset + offsetInOctave * 44 - 16

          return (
            <div
              key={`b-${semitone}`}
              className={`absolute z-10 flex h-24 w-8 flex-col items-center justify-end rounded-b border-2 pb-2 shadow-xl ${
                active ? 'border-red-500 bg-red-600' : 'border-zinc-800 bg-zinc-900'
              }`}
              style={{ left: leftPx }}
            >
              <span
                className={`text-xs font-bold ${
                  active ? 'text-white' : 'text-zinc-500'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
