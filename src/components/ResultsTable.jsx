import { useState } from 'react'
import { formatRupiah, toPlainAmount } from '../lib/format'

function CopyButton({ amount, label }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toPlainAmount(amount))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard diblokir (konteks tidak aman / izin ditolak) — biarkan
      // user menyalin manual, jangan sampai UI ikut rusak.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Salin nominal ${label}`}
      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      {copied ? (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-500" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4L8.5 12.1l6.8-6.8a1 1 0 0 1 1.4 0Z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path d="M7 3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7Z" />
          <path d="M4 6a2 2 0 0 0-1 1.7V15a2 2 0 0 0 2 2h6.3A2 2 0 0 0 13 16H5a1 1 0 0 1-1-1V6Z" />
        </svg>
      )}
    </button>
  )
}

export default function ResultsTable({ result, payerId }) {
  const methodLabel = result.method === 'proportional' ? 'Proporsional Penuh' : '50/50'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          Hasil
        </h2>
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
          Biaya tambahan dibagi {methodLabel}
        </span>
      </header>

      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {result.rows.map((row) => {
          const isPayer = row.id === payerId

          return (
            <li key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium text-slate-900 dark:text-slate-100">
                  {row.name}
                  {isPayer && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      menalangi
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                  Pesan {formatRupiah(row.food)} · persisnya {formatRupiah(row.exact)}
                </p>
              </div>

              {isPayer ? (
                <div className="text-right">
                  <p className="text-lg font-semibold text-amber-600 tabular-nums dark:text-amber-400">
                    menerima transfer
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">tidak perlu transfer</p>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900 tabular-nums dark:text-slate-50">
                      {formatRupiah(row.transferReady)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">siap transfer</p>
                  </div>
                  <CopyButton amount={row.transferReady} label={row.name} />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 text-sm dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">Jumlah nominal persis</span>
        <span className="flex items-center gap-2 font-semibold text-slate-900 tabular-nums dark:text-slate-100">
          {formatRupiah(result.totals.exact)}
          {result.totals.matchesNetPaid && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              cocok dengan total dibayar
            </span>
          )}
        </span>
      </footer>
    </section>
  )
}
