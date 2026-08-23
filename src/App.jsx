import { useMemo, useRef, useState } from 'react'
import { computeSplit } from './lib/split'
import BillInputs from './components/BillInputs'
import ComparisonPanel from './components/ComparisonPanel'
import PersonRow from './components/PersonRow'
import ResultsTable from './components/ResultsTable'
import SummaryBar from './components/SummaryBar'

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const defaultName = (index) =>
  index < 26 ? `User ${String.fromCharCode(65 + index)}` : `Orang ${index + 1}`

const initialPeople = () => [
  { id: newId(), name: defaultName(0), food: 0 },
  { id: newId(), name: defaultName(1), food: 0 },
]

export default function App() {
  const [grossTotal, setGrossTotal] = useState(0)
  const [netPaid, setNetPaid] = useState(0)
  const [people, setPeople] = useState(initialPeople)
  const [method, setMethod] = useState('even')
  const [payerId, setPayerId] = useState('')
  const [hasCalculated, setHasCalculated] = useState(false)
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const resultsRef = useRef(null)

  const result = useMemo(
    () => computeSplit({ grossTotal, netPaid, people, method, payerId: payerId || null }),
    [grossTotal, netPaid, people, method, payerId],
  )

  const addPerson = () =>
    setPeople((prev) => [...prev, { id: newId(), name: defaultName(prev.length), food: 0 }])

  const removePerson = (id) => {
    if (people.length <= 1) return
    // Kalau si penalang yang dihapus, pilihannya ikut dikosongkan.
    if (id === payerId) setPayerId('')
    setPeople((prev) => prev.filter((person) => person.id !== id))
  }

  const updatePerson = (id, patch) =>
    setPeople((prev) =>
      prev.map((person) => (person.id === id ? { ...person, ...patch } : person)),
    )

  const calculate = () => {
    setHasCalculated(true)
    // Di layar HP hasilnya ada di bawah lipatan — bawa user ke sana.
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const reset = () => {
    setGrossTotal(0)
    setNetPaid(0)
    setPeople(initialPeople())
    setMethod('even')
    setPayerId('')
    setHasCalculated(false)
    setComparisonOpen(false)
  }

  const errors = result.warnings.filter((warning) => warning.level === 'error')
  const notices = result.warnings.filter((warning) => warning.level === 'warn')
  const showResults = hasCalculated && result.valid

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-indigo-50/40 px-4 py-8 sm:py-12 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20">
      <main className="mx-auto w-full max-w-2xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
            Itung Makan
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Patungan yang adil: diskon dibagi menurut pesanan, biaya tambahan dibagi terpisah.
            Hasilnya langsung berupa nominal siap-transfer.
          </p>
        </header>

        <BillInputs
          grossTotal={grossTotal}
          netPaid={netPaid}
          onGrossChange={setGrossTotal}
          onNetChange={setNetPaid}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
              Pesanan
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {people.length} orang
            </span>
          </div>

          <ul className="mt-4 space-y-2">
            {people.map((person, index) => (
              <PersonRow
                key={person.id}
                person={person}
                index={index}
                canRemove={people.length > 1}
                onNameChange={(id, name) => updatePerson(id, { name })}
                onFoodChange={(id, food) => updatePerson(id, { food })}
                onRemove={removePerson}
              />
            ))}
          </ul>

          <button
            type="button"
            onClick={addPerson}
            className="mt-3 w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            + Tambah orang
          </button>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <label
              htmlFor="payer"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Yang menalangi
            </label>
            <select
              id="payer"
              value={payerId}
              onChange={(event) => setPayerId(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">— belum ditentukan —</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        {errors.length > 0 && hasCalculated && (
          <ul className="space-y-2">
            {errors.map((error) => (
              <li
                key={error.message}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
              >
                {error.message}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={calculate}
            className="flex-1 rounded-xl bg-indigo-600 px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none active:bg-indigo-800"
          >
            Hitung Patungan
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Reset
          </button>
        </div>

        <div ref={resultsRef} className="scroll-mt-6 space-y-5">
          {showResults && (
            <>
              {notices.map((notice) => (
                <p
                  key={notice.message}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  {notice.message}
                </p>
              ))}

              <ResultsTable result={result} payerId={payerId} />
              <SummaryBar result={result} />
              <ComparisonPanel
                result={result}
                open={comparisonOpen}
                onToggle={() => setComparisonOpen((open) => !open)}
                onMethodChange={setMethod}
              />
            </>
          )}
        </div>

        <footer className="pt-2 pb-6 text-center text-xs text-slate-400 dark:text-slate-600">
          Nominal siap-transfer dibulatkan ke bawah ke kelipatan Rp 100.
        </footer>
      </main>
    </div>
  )
}
