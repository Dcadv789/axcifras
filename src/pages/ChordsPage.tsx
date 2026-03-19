import { useState } from 'react'
import { PianoKeyboard } from '@/components/chords/PianoKeyboard'
import { AppShell } from '@/components/layout/AppShell'
import { chordToPianoKeys } from '@/utils/chord-to-keys'
import { cn } from '@/lib/utils'

const CHORD_CATEGORIES = [
  {
    title: 'Maiores',
    chords: ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'D#', 'F#', 'G#', 'A#', 'Db', 'Eb', 'Gb', 'Ab', 'Bb'],
  },
  {
    title: 'Menores',
    chords: ['Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm', 'C#m', 'D#m', 'F#m', 'G#m', 'A#m', 'Dbm', 'Ebm', 'Gbm', 'Abm', 'Bbm'],
  },
  {
    title: 'Com 7ª',
    chords: ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7', 'Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Am7', 'Bm7', 'Cmaj7', 'Dmaj7', 'Emaj7', 'Fmaj7', 'Gmaj7', 'Amaj7', 'Bmaj7'],
  },
  {
    title: 'Sus e outros',
    chords: ['Csus2', 'Csus4', 'Dsus2', 'Dsus4', 'Gsus4', 'Asus4', 'Cdim', 'Caug', 'Ddim', 'Daug'],
  },
  {
    title: 'Com baixo alternativo',
    chords: ['C/E', 'C/G', 'D/F#', 'D/A', 'E/G#', 'F/A', 'F/C', 'G/B', 'G/D', 'A/C#', 'A/E', 'B/D#'],
  },
]

export function ChordsPage() {
  const [selectedChord, setSelectedChord] = useState<string | null>(null)
  const activeKeys = selectedChord ? chordToPianoKeys(selectedChord) : []

  return (
    <AppShell
      title="Manual de acordes"
      subtitle="Teclado e piano – clique em um acorde para ver as teclas destacadas no piano."
    >
      {/* Teclado do piano */}
      <section className="mb-12 rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-950">
              Teclado
            </h2>
            {selectedChord && (
              <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-800">
                {selectedChord}
              </span>
            )}
          </div>
          <div className="overflow-x-auto pb-4">
            <PianoKeyboard
              activeSemitones={activeKeys}
              octaves={1}
              className="mx-auto"
            />
          </div>
        {!selectedChord && (
          <p className="mt-4 text-center text-sm text-zinc-500">
            Selecione um acorde abaixo para ver as teclas destacadas
          </p>
        )}
      </section>

      {/* Lista de acordes */}
      <div className="space-y-8">
          {CHORD_CATEGORIES.map((category) => (
            <section
              key={category.title}
              className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-base font-semibold uppercase tracking-wider text-zinc-600">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.chords.map((chord) => {
                  const isSelected = selectedChord === chord
                  const hasKeys = chordToPianoKeys(chord).length > 0

                  return (
                    <button
                      key={chord}
                      type="button"
                      onClick={() => setSelectedChord(isSelected ? null : chord)}
                      disabled={!hasKeys}
                      className={cn(
                        'rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all',
                        isSelected
                          ? 'border-red-400 bg-red-100 text-red-800'
                          : hasKeys
                            ? 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                            : 'cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-400',
                      )}
                    >
                      {chord}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
      </div>
    </AppShell>
  )
}
