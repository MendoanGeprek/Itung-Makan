import { formatPercent, formatRupiah } from '../lib/format'

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
      <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-slate-900 tabular-nums dark:text-slate-100">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}

export default function SummaryBar({ result }) {
  const { extraFees, feePerPerson, discountRatio, trueFoodTotal, totals, payer } = result
  const discount = 1 - discountRatio

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total pesanan" value={formatRupiah(trueFoodTotal)} />
        <Stat
          label="Biaya tambahan"
          value={formatRupiah(extraFees)}
          hint={`${formatRupiah(feePerPerson)} / orang`}
        />
        <Stat
          label={discount >= 0 ? 'Diskon' : 'Kelebihan bayar'}
          value={formatPercent(Math.abs(discount))}
          hint="dari harga makanan"
        />
        <Stat label="Sisa pembulatan" value={formatRupiah(totals.remainder)} />
      </div>

      {payer ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <strong className="font-semibold">{payer.name}</strong> menalangi{' '}
          <span className="font-semibold tabular-nums">{formatRupiah(payer.pays)}</span> dan menerima{' '}
          <span className="font-semibold tabular-nums">{formatRupiah(payer.collects)}</span> dari yang
          lain — nombok{' '}
          <span className="font-semibold tabular-nums">{formatRupiah(payer.absorbs)}</span> karena
          pembulatan ke bawah.
        </p>
      ) : (
        totals.remainder !== 0 && (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
            Nominal siap-transfer dibulatkan ke bawah, jadi totalnya kurang{' '}
            <span className="font-semibold tabular-nums">{formatRupiah(totals.remainder)}</span> dari
            total dibayar. Pilih siapa yang menalangi di atas supaya jelas siapa yang menanggungnya.
          </p>
        )
      )}
    </section>
  )
}
