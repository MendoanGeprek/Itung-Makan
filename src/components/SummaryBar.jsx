import { formatPercent, formatRupiah } from '../lib/format'
import { LeaderLine, Rule, SectionTitle } from './receipt'

export default function SummaryBar({ result }) {
  const { extraFees, feePerPerson, discountRatio, trueFoodTotal, totals, payer } = result
  const discount = 1 - discountRatio

  return (
    <section>
      <SectionTitle>Rincian Biaya</SectionTitle>

      <Rule />

      <div className="space-y-1.5 py-3 text-[11px]">
        <LeaderLine label="Total pesanan" value={formatRupiah(trueFoodTotal)} />
        <LeaderLine label="Biaya tambahan" value={formatRupiah(extraFees)} />
        <LeaderLine muted label="  per orang" value={formatRupiah(feePerPerson)} />
        <LeaderLine
          label={discount >= 0 ? 'Diskon makanan' : 'Kelebihan bayar'}
          value={formatPercent(Math.abs(discount))}
        />
        <LeaderLine label="Sisa pembulatan" value={formatRupiah(totals.remainder)} />
      </div>

      <Rule />

      {payer ? (
        <p className="py-3 text-[11px] leading-relaxed">
          <span className="font-bold">{payer.name}</span> menalangi{' '}
          <span className="font-bold tabular-nums">{formatRupiah(payer.pays)}</span> dan menerima{' '}
          <span className="font-bold tabular-nums">{formatRupiah(payer.collects)}</span> dari yang
          lain, jadi nombok{' '}
          <span className="font-bold tabular-nums">{formatRupiah(payer.absorbs)}</span> karena
          pembulatan ke bawah.
        </p>
      ) : (
        totals.remainder !== 0 && (
          <p className="text-faint py-3 text-[11px] leading-relaxed">
            Nominal transfer dibulatkan ke bawah, jadi totalnya kurang{' '}
            <span className="text-ink font-bold tabular-nums">
              {formatRupiah(totals.remainder)}
            </span>{' '}
            dari total setelah diskon. Pilih siapa yang menalangi di atas supaya jelas siapa yang
            menanggungnya.
          </p>
        )
      )}
    </section>
  )
}
