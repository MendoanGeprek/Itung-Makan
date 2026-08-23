const OPTIONS = [
  { value: 'light', label: 'Terang', short: 'TRG' },
  { value: 'dark', label: 'Gelap', short: 'GLP' },
  { value: 'system', label: 'Sistem', short: 'SYS' },
]

/**
 * Pemilih tema bergaya tombol mesin kasir. Dibuat dari token kertas/tinta
 * supaya kontrasnya benar di kedua tema tanpa aturan `dark:` tambahan.
 */
export default function ThemeToggle({ choice, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Pilih tema tampilan"
      className="border-edge bg-paper flex shrink-0 overflow-hidden rounded border shadow-sm"
    >
      {OPTIONS.map(({ value, label, short }) => {
        const active = choice === value

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(value)}
            className={`px-2.5 py-1.5 text-[10px] font-bold tracking-wider transition ${
              active ? 'bg-ink text-paper' : 'text-faint hover:text-ink'
            }`}
          >
            {short}
          </button>
        )
      })}
    </div>
  )
}
