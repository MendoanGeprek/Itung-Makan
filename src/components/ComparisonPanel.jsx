import { formatRupiah } from '../lib/format'

function MethodCard({ title, description, active, onSelect, children }) {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        active
          ? 'border-indigo-400 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/30'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        {active ? (
          <span className="shrink-0 rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            dipakai
          </span>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            className="shrink-0 rounded-full border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            pakai ini
          </button>
        )}
      </div>
      <dl className="mt-3 space-y-1.5">{children}</dl>
    </div>
  )
}

function Line({ name, amount }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <dt className="truncate text-slate-600 dark:text-slate-300">{name}</dt>
      <dd className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
        {formatRupiah(amount)}
      </dd>
    </div>
  )
}

export default function ComparisonPanel({ result, open, onToggle, onMethodChange }) {
  const biggestGap = result.rows.reduce(
    (max, row) => Math.max(max, Math.abs(row.delta)),
    0,
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
      >
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Bandingkan cara bagi biaya tambahan
          </h2>
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
            Selisih terbesar antar metode{' '}
            <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatRupiah(biggestGap)}
            </span>
          </p>
        </div>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="space-y-4 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Harga makanan selalu dibagi proporsional. Yang bisa diperdebatkan cuma{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatRupiah(result.extraFees)}
            </span>{' '}
            biaya tambahan — ongkir dan biaya layanan tidak ikut naik gara-gara ada yang pesan lebih
            banyak.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <MethodCard
              title="50/50"
              description="Biaya tambahan dibagi rata. Ongkir satu motor sama saja berapa pun isinya."
              active={result.method === 'even'}
              onSelect={() => onMethodChange('even')}
            >
              {result.rows.map((row) => (
                <Line key={row.id} name={row.name} amount={row.exactEven} />
              ))}
            </MethodCard>

            <MethodCard
              title="Proporsional Penuh"
              description="Biaya tambahan ikut bobot pesanan. Yang pesan lebih banyak bayar ongkir lebih besar."
              active={result.method === 'proportional'}
              onSelect={() => onMethodChange('proportional')}
            >
              {result.rows.map((row) => (
                <Line key={row.id} name={row.name} amount={row.exactProportional} />
              ))}
            </MethodCard>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
            <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Selisih kalau pindah ke proporsional
            </p>
            <ul className="mt-2 space-y-1">
              {result.rows.map((row) => {
                const sign = row.delta > 0 ? '+' : row.delta < 0 ? '−' : ''
                const tone =
                  row.delta > 0.5
                    ? 'text-rose-600 dark:text-rose-400'
                    : row.delta < -0.5
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'

                return (
                  <li
                    key={row.id}
                    className="flex items-baseline justify-between gap-3 text-sm"
                  >
                    <span className="truncate text-slate-600 dark:text-slate-300">{row.name}</span>
                    <span className={`font-semibold tabular-nums ${tone}`}>
                      {sign}
                      {formatRupiah(Math.abs(row.delta))}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
