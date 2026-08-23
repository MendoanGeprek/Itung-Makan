import MoneyInput from './MoneyInput'

export default function PersonRow({ person, index, canRemove, onNameChange, onFoodChange, onRemove }) {
  return (
    <li className="flex items-center gap-2">
      <span className="hidden w-6 shrink-0 text-center text-sm font-semibold text-slate-300 tabular-nums sm:block dark:text-slate-600">
        {index + 1}
      </span>

      <input
        type="text"
        value={person.name}
        aria-label={`Nama orang ke-${index + 1}`}
        placeholder={`Orang ${index + 1}`}
        onChange={(event) => onNameChange(person.id, event.target.value)}
        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm transition outline-none placeholder:text-slate-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-indigo-500"
      />

      <MoneyInput
        value={person.food}
        onChange={(value) => onFoodChange(person.id, value)}
        ariaLabel={`Nominal pesanan ${person.name}`}
        className="w-36 shrink-0 sm:w-44"
      />

      <button
        type="button"
        onClick={() => onRemove(person.id)}
        disabled={!canRemove}
        aria-label={`Hapus ${person.name}`}
        title={canRemove ? `Hapus ${person.name}` : 'Minimal satu orang'}
        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.75 1a1 1 0 0 0-.96.71L7.4 3H4a1 1 0 0 0 0 2h12a1 1 0 1 0 0-2h-3.4l-.39-1.29A1 1 0 0 0 11.25 1h-2.5ZM5.06 6.5a.5.5 0 0 0-.5.54l.67 9A1.5 1.5 0 0 0 6.72 17.5h6.56a1.5 1.5 0 0 0 1.5-1.46l.66-9a.5.5 0 0 0-.5-.54H5.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </li>
  )
}
