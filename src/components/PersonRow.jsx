import MoneyInput from './MoneyInput'

export const initialOf = (name) => (name.trim()[0] ?? '?').toUpperCase()

/** Nomor urut bergaya kode barang di struk: 01, 02, 03. */
export const itemCode = (index) => String(index + 1).padStart(2, '0')

export default function PersonRow({
  person,
  index,
  canRemove,
  onNameChange,
  onFoodChange,
  onRemove,
}) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className="text-faint w-6 shrink-0 text-xs font-semibold tabular-nums">
        {itemCode(index)}
      </span>

      <input
        type="text"
        value={person.name}
        aria-label={`Nama orang ke-${index + 1}`}
        placeholder={`Orang ${index + 1}`}
        onChange={(event) => onNameChange(person.id, event.target.value)}
        className="bg-field border-edge text-ink placeholder:text-faint/60 min-w-0 flex-1 rounded border px-3 py-2.5 text-sm font-semibold transition outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500/40"
      />

      <MoneyInput
        value={person.food}
        onChange={(value) => onFoodChange(person.id, value)}
        ariaLabel={`Nominal pesanan ${person.name}`}
        className="w-28 shrink-0 sm:w-36"
      />

      <button
        type="button"
        onClick={() => onRemove(person.id)}
        disabled={!canRemove}
        aria-label={`Hapus ${person.name}`}
        title={canRemove ? `Hapus ${person.name}` : 'Minimal satu orang'}
        className="text-faint shrink-0 rounded px-2 py-2 text-sm font-bold transition hover:text-red-600 disabled:pointer-events-none disabled:opacity-25"
      >
        X
      </button>
    </li>
  )
}
