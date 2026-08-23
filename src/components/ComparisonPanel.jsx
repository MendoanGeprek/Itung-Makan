import { formatRupiah } from '../lib/format'
import { LeaderLine, Rule, SectionTitle } from './receipt'

function MethodBlock({ title, description, active, onSelect, rows, amountOf }) {
  return (
    <div className={`py-3 ${active ? '' : 'opacity-70'}`}>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold">
          {active ? '[x] ' : '[ ] '}
          {title}
        </h3>
        {active ? (
          <span className="text-faint shrink-0 text-[10px] tracking-wider uppercase">dipakai</span>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            className="border-edge text-faint hover:text-ink shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition"
          >
            pakai ini
          </button>
        )}
      </div>

      <p className="text-faint mt-1 text-[11px] leading-relaxed">{description}</p>

      <div className="mt-2 space-y-1 text-[11px]">
        {rows.map((row) => (
          <LeaderLine key={row.id} label={row.name} value={formatRupiah(amountOf(row))} />
        ))}
      </div>
    </div>
  )
}

export default function ComparisonPanel({ result, open, onToggle, onMethodChange }) {
  const biggestGap = result.rows.reduce((max, row) => Math.max(max, Math.abs(row.delta)), 0)

  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full text-left transition hover:opacity-70"
      >
        <SectionTitle>Cara Bagi Biaya Tambahan</SectionTitle>
        <p className="text-faint pb-3 text-center text-[11px]">
          selisih terbesar {formatRupiah(biggestGap)}
          <span className="ml-2 tracking-wider uppercase">
            [{open ? 'tutup' : 'lihat'}]
          </span>
        </p>
      </button>

      {open && (
        <>
          <Rule />

          <p className="text-faint py-3 text-[11px] leading-relaxed">
            Harga makanan selalu dibagi proporsional. Yang bisa diperdebatkan cuma{' '}
            <span className="text-ink font-bold tabular-nums">
              {formatRupiah(result.extraFees)}
            </span>{' '}
            biaya tambahan, karena ongkir dan biaya layanan tidak ikut naik gara-gara ada yang
            pesan lebih banyak.
          </p>

          <Rule />

          <MethodBlock
            title="50/50"
            description="Dibagi rata. Ongkir satu motor sama saja berapa pun isinya."
            active={result.method === 'even'}
            onSelect={() => onMethodChange('even')}
            rows={result.rows}
            amountOf={(row) => row.exactEven}
          />

          <Rule />

          <MethodBlock
            title="Proporsional Penuh"
            description="Ikut bobot pesanan. Yang pesan lebih banyak bayar ongkir lebih besar."
            active={result.method === 'proportional'}
            onSelect={() => onMethodChange('proportional')}
            rows={result.rows}
            amountOf={(row) => row.exactProportional}
          />

          <Rule />

          <div className="py-3">
            <p className="text-faint text-[10px] tracking-wider uppercase">
              Selisih kalau pindah ke proporsional
            </p>
            <div className="mt-2 space-y-1 text-[11px]">
              {result.rows.map((row) => {
                const sign = row.delta > 0.5 ? '+' : row.delta < -0.5 ? '-' : ''
                const tone =
                  row.delta > 0.5
                    ? 'text-red-600 dark:text-red-400'
                    : row.delta < -0.5
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : ''

                return (
                  <div key={row.id} className="flex items-baseline gap-1.5">
                    <span className="shrink-0 truncate">{row.name}</span>
                    <span className="leader" aria-hidden="true" />
                    <span className={`shrink-0 font-bold tabular-nums ${tone}`}>
                      {sign}
                      {formatRupiah(Math.abs(row.delta))}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
