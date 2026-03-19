import { FileUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ImportModalProps {
  open: boolean
  onClose: () => void
  value: string
  onChange: (nextValue: string) => void
  onImport: () => void
  onResetAlignment: () => void
  isParsing: boolean
}

export function ImportModal({
  open,
  onClose,
  value,
  onChange,
  onImport,
  onResetAlignment,
  isParsing,
}: ImportModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-950">
            <FileUp className="size-5 text-[#c62424]" />
            Importar de Cifras Club ou texto com cifra
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

        <div className="flex flex-1 flex-col overflow-y-auto p-6">
          <p className="mb-4 text-sm leading-6 text-zinc-500">
            Cole o texto completo da cifra. O importador reconhece automaticamente:{' '}
            <strong>título</strong> (primeira linha ou após #), <strong>artista</strong> (segunda linha ou após ##),{' '}
            <strong>tom</strong> (tom: A), <strong>BPM</strong> (bpm: 74), <strong>seções</strong> ([Intro], [Refrão], [Verso]) e{' '}
            <strong>cifras acima da letra</strong>. Depois refine o alinhamento na visualização.
          </p>

          <Textarea
            rows={14}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mb-4 min-h-[280px] rounded-[24px] border-zinc-200 bg-white px-4 py-4 font-mono text-sm leading-7 text-zinc-950"
            spellCheck={false}
            placeholder={`Me Ama
Diante do Trono
tom: A

[Intro]
G              D/F#
Gra-ça surpre-en-den-te
Em             C
Som que acordou meu cora-ção`}
          />

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() => {
                onImport()
                onClose()
              }}
              disabled={isParsing}
              size="lg"
              className="rounded-2xl bg-[#c62424] text-white hover:bg-[#d92c2c]"
            >
              {isParsing ? 'Importando...' : 'Importar estrutura'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onResetAlignment()
                onClose()
              }}
              variant="outline"
              size="lg"
              className="rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            >
              Regenerar alinhamento
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-2xl text-zinc-600"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
