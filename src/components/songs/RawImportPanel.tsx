import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface RawImportPanelProps {
  value: string
  onChange: (nextValue: string) => void
  onImport: () => void
  onResetAlignment: () => void
  isParsing: boolean
}

export function RawImportPanel({
  value,
  onChange,
  onImport,
  onResetAlignment,
  isParsing,
}: RawImportPanelProps) {
  return (
    <section className="rounded-[28px] border border-zinc-200 bg-white p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.26em] text-zinc-400">Importação</div>
          <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-zinc-950">
            Importar de Cifras Club ou texto com cifra
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Cole o texto completo da cifra. O importador reconhece automaticamente: <strong>título</strong> (primeira linha ou após #), <strong>artista</strong> (segunda linha ou após ##), <strong>tom</strong> (tom: A), <strong>BPM</strong> (bpm: 74), <strong>seções</strong> ([Intro], [Refrão], [Verso]) e <strong>cifras acima da letra</strong>. Depois refine o alinhamento na visualização.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={onImport}
            disabled={isParsing}
            size="lg"
            className="rounded-2xl bg-[#c62424] text-white hover:bg-[#d92c2c]"
          >
            {isParsing ? 'Importando...' : 'Importar estrutura'}
          </Button>
          <Button
            type="button"
            onClick={onResetAlignment}
            variant="outline"
            size="lg"
            className="rounded-2xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          >
            Regenerar alinhamento
          </Button>
        </div>
      </div>

      <Textarea
        rows={12}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[260px] rounded-[24px] border-zinc-200 bg-white px-4 py-4 font-mono text-sm leading-7 text-zinc-950"
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
    </section>
  )
}
