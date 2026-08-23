import { formatNumber, parseRupiah } from '../lib/format'

/**
 * Input uang terkendali: state menyimpan angka mentah, yang tampil versi
 * berpemisah titik. User mengetik `150000`, langsung terbaca `150.000`.
 */
export default function MoneyInput({
  value,
  onChange,
  id,
  placeholder = '0',
  ariaLabel,
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 dark:text-slate-500">
        Rp
      </span>
      <input
        id={id}
        aria-label={ariaLabel}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value ? formatNumber(value) : ''}
        placeholder={placeholder}
        onChange={(event) => onChange(parseRupiah(event.target.value))}
        onFocus={(event) => event.target.select()}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-right text-base font-semibold tabular-nums text-slate-900 shadow-sm transition outline-none placeholder:font-normal placeholder:text-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-indigo-500"
      />
    </div>
  )
}
