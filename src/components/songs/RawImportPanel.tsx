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
    <section className="glass-panel rounded-[28px] p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/35">Importação</div>
          <h2 className="mt-2 font-display text-xl font-semibold">Texto colado com cifra acima da letra</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-mist">
            Cole no formato tradicional, reimporte quando quiser e depois refine o alinhamento arrastando
            as cifras diretamente na partitura.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onImport}
            disabled={isParsing}
            className="rounded-2xl bg-gold px-4 py-2.5 text-sm font-medium text-night transition hover:brightness-105 disabled:opacity-70"
          >
            {isParsing ? 'Importando...' : 'Importar estrutura'}
          </button>
          <button
            type="button"
            onClick={onResetAlignment}
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-mist transition hover:border-white/20 hover:text-ink"
          >
            Regerar alinhamento
          </button>
        </div>
      </div>

      <textarea
        rows={12}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[24px] border border-white/10 bg-night/70 px-4 py-4 font-mono text-sm leading-7 text-ink outline-none transition focus:border-gold/60"
        spellCheck={false}
        placeholder={`G              D/F#
Gra-ça surpre-en-den-te
Em             C
Som que acordou meu cora-ção`}
      />
    </section>
  )
}
