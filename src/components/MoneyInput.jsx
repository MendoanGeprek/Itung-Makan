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
    <div className={`group relative ${className}`}>
      <span className="text-faint pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-semibold">
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
        className="bg-field border-edge text-ink placeholder:text-faint/60 w-full rounded border py-2.5 pr-3 pl-9 text-right text-base font-bold tabular-nums transition outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500/40"
      />
    </div>
  )
}
