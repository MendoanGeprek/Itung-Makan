import { useState } from 'react'
import { formatRupiah, toPlainAmount } from '../lib/format'
import { itemCode } from './PersonRow'
import { DoubleRule, LeaderLine, Rule, SectionTitle } from './receipt'

function CopyButton({ amount, label }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toPlainAmount(amount))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard diblokir (konteks tidak aman / izin ditolak) - biarkan
      // user menyalin manual, jangan sampai UI ikut rusak.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Salin nominal ${label}`}
      className={`border-edge shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase transition ${
        copied ? 'text-emerald-600 dark:text-emerald-400' : 'text-faint hover:text-ink'
      }`}
    >
      {copied ? 'tersalin' : 'salin'}
    </button>
  )
}

export default function ResultsTable({ result }) {
  const methodLabel = result.method === 'proportional' ? 'Proporsional Penuh' : '50/50'

  return (
    <section>
      <SectionTitle>Rincian Patungan</SectionTitle>

      <p className="text-faint pb-3 text-center text-[11px]">
        biaya tambahan dibagi {methodLabel}
      </p>

      <Rule />

      <ul className="py-1">
        {result.rows.map((row, index) => (
            <li key={row.id} className="py-3">
              <div className="flex items-baseline gap-2">
                <span aria-hidden="true" className="text-faint shrink-0 text-xs tabular-nums">
                  {itemCode(index)}
                </span>
                <span className="text-ink min-w-0 flex-1 truncate text-sm font-bold">
                  {row.name}
                </span>
                <CopyButton amount={row.transferReady} label={row.name} />
              </div>

              <div className="mt-1.5 pl-8 text-[11px]">
                <LeaderLine muted label="pesan" value={formatRupiah(row.food)} />
                <LeaderLine muted label="hitungan pas" value={formatRupiah(row.exact)} />
              </div>

              <div className="mt-1.5 pl-8 text-sm">
                <LeaderLine bold label="TRANSFER" value={formatRupiah(row.transferReady)} />
              </div>
            </li>
        ))}
      </ul>

      <DoubleRule />

      <div className="py-3 text-sm">
        <LeaderLine bold label="Jumlah pas" value={formatRupiah(result.totals.exact)} />
      </div>

      {result.totals.matchesNetPaid && (
        <div className="flex justify-center pt-1 pb-5">
          <span className="stamp rounded px-5 py-1.5 text-base font-bold tracking-[0.3em]">
            LUNAS
          </span>
        </div>
      )}

      {result.totals.matchesNetPaid && (
        <p className="text-faint pb-4 text-center text-[10px] tracking-wider">
          cocok dengan total setelah diskon
        </p>
      )}
    </section>
  )
}
