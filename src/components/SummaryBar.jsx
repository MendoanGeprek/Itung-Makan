import { formatPercent, formatRupiah } from '../lib/format'
import { LeaderLine, Rule, SectionTitle } from './receipt'

export default function SummaryBar({ result }) {
  const { extraFees, feePerPerson, discountRatio, trueFoodTotal, totals } = result
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

      {totals.remainder !== 0 && (
        <p className="text-faint py-3 text-[11px] leading-relaxed">
          Nominal transfer dibulatkan ke bawah, jadi jumlahnya kurang{' '}
          <span className="text-ink font-bold tabular-nums">{formatRupiah(totals.remainder)}</span>{' '}
          dari total setelah diskon. Kekurangan itu ditanggung yang menalangi tagihan.
        </p>
      )}

    </section>
  )
}
