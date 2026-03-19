import { chordToPianoKeys, PIANO_KEY_LABELS } from '../../utils/chord-to-keys'

interface PianoChordKeysProps {
  chordName: string
  className?: string
}

const BLACK_KEYS = [1, 3, 6, 8, 10]

export function PianoChordKeys({ chordName, className = '' }: PianoChordKeysProps) {
  const keys = chordToPianoKeys(chordName)
  if (keys.length === 0) return null

  return (
    <div className={`inline-flex items-end gap-0.5 ${className}`}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((semitone) => {
        const isActive = keys.includes(semitone)
        const isBlack = BLACK_KEYS.includes(semitone)

        return (
          <div
            key={semitone}
            className={`relative flex flex-col items-center transition-all ${
              isBlack ? 'z-10 -mx-1' : ''
            }`}
          >
            <div
              className={`flex h-12 w-6 items-end justify-center rounded-b border-2 pb-1 text-[10px] font-bold ${
                isBlack
                  ? 'h-8 w-4 border-zinc-800 bg-zinc-900'
                  : 'border-zinc-300 bg-white'
              } ${
                isActive
                  ? isBlack
                    ? 'border-red-500 bg-red-600 text-white'
                    : 'border-red-400 bg-red-100 text-red-800'
                  : isBlack
                    ? 'text-zinc-500'
                    : 'text-zinc-400'
              }`}
            >
              {PIANO_KEY_LABELS[semitone]}
            </div>
          </div>
        )
      })}
    </div>
  )
}
