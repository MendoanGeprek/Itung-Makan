import { useEffect, useMemo, useRef, useState } from 'react'
import { computeSplit } from './lib/split'
import { applyTheme, readStoredChoice, storeChoice } from './lib/theme'
import { syncNativeChrome } from './lib/native'
import BillInputs from './components/BillInputs'
import ComparisonPanel from './components/ComparisonPanel'
import PersonRow from './components/PersonRow'
import ResultsTable from './components/ResultsTable'
import SummaryBar from './components/SummaryBar'
import ThemeToggle from './components/ThemeToggle'
import { Rule, SectionTitle } from './components/receipt'

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

/** Tanggal dan jam cetak, seperti kepala struk kasir sungguhan. */
function printedAt() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
  return `${date}  ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export default function App() {
  const [grossTotal, setGrossTotal] = useState(0)
  const [netPaid, setNetPaid] = useState(0)
  const [people, setPeople] = useState(initialPeople)
  const [method, setMethod] = useState('even')
  const [hasCalculated, setHasCalculated] = useState(false)
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const [themeChoice, setThemeChoice] = useState(readStoredChoice)
  // Dihitung sekali saat halaman dibuka supaya jamnya tidak berubah tiap render.
  const [stampedAt] = useState(printedAt)
  const resultsRef = useRef(null)

  // Terapkan dan simpan pilihan tema setiap kali berubah.
  useEffect(() => {
    const resolved = applyTheme(themeChoice)
    storeChoice(themeChoice)
    syncNativeChrome(resolved)
  }, [themeChoice])

  // Saat memilih 'Sistem', tampilan harus ikut berubah kalau setelan OS
  // diubah selagi halaman terbuka.
  useEffect(() => {
    if (themeChoice !== 'system' || typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => syncNativeChrome(applyTheme('system'))
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [themeChoice])

  const result = useMemo(
    () => computeSplit({ grossTotal, netPaid, people, method }),
    [grossTotal, netPaid, people, method],
  )

  const addPerson = () =>
    setPeople((prev) => [...prev, { id: newId(), name: defaultName(prev.length), food: 0 }])

  const removePerson = (id) => {
    if (people.length <= 1) return
    setPeople((prev) => prev.filter((person) => person.id !== id))
  }

  const updatePerson = (id, patch) =>
    setPeople((prev) =>
      prev.map((person) => (person.id === id ? { ...person, ...patch } : person)),
    )

  const calculate = () => {
    setHasCalculated(true)
    // Di layar HP hasilnya ada di bawah lipatan, bawa user ke sana.
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const reset = () => {
    setGrossTotal(0)
    setNetPaid(0)
    setPeople(initialPeople())
    setMethod('even')
    setHasCalculated(false)
    setComparisonOpen(false)
  }

  const errors = result.warnings.filter((warning) => warning.level === 'error')
  const notices = result.warnings.filter((warning) => warning.level === 'warn')
  const showResults = hasCalculated && result.valid

  return (
    <div className="min-h-screen px-3 py-6 font-sans sm:py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-3 flex justify-end">
          <ThemeToggle choice={themeChoice} onChange={setThemeChoice} />
        </div>

        {/* Satu lembar struk memanjang: sobek di atas, sobek di bawah. */}
        <div className="tear rotate-180" aria-hidden="true" />

        <main className="bg-paper paper-texture text-ink px-6 text-sm">
          <header className="pt-6 pb-5 text-center">
            <h1 className="text-lg font-bold tracking-[0.35em]">ITUNG MAKAN</h1>
            <p className="text-faint mt-1.5 text-[10px] tracking-[0.2em] uppercase">
              patungan makanan yang adil
            </p>
            <p className="text-faint mt-3 text-[11px] tabular-nums">{stampedAt}</p>
          </header>

          <Rule />

          <BillInputs
            grossTotal={grossTotal}
            netPaid={netPaid}
            onGrossChange={setGrossTotal}
            onNetChange={setNetPaid}
          />

          <Rule />

          <section>
            <SectionTitle>Pesanan</SectionTitle>

            <ul className="space-y-2 pb-3">
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
              className="border-edge text-faint hover:text-ink w-full rounded border border-dashed py-2.5 text-[11px] font-semibold tracking-wider uppercase transition"
            >
              + tambah orang
            </button>

          </section>

          <Rule />

          {hasCalculated &&
            errors.map((error) => (
              <p
                key={error.message}
                className="text-stamp border-stamp mt-4 rounded border border-double px-3 py-2 text-center text-[11px] font-semibold"
              >
                {error.message}
              </p>
            ))}

          <div className="flex gap-2 py-5">
            <button
              type="button"
              onClick={calculate}
              className="bg-ink text-paper flex-1 rounded py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition hover:opacity-85 active:translate-y-px"
            >
              Hitung Patungan
            </button>
            <button
              type="button"
              onClick={reset}
              className="border-edge text-faint hover:text-ink rounded border px-4 py-3.5 text-xs font-bold tracking-wider uppercase transition"
            >
              Reset
            </button>
          </div>

          <div ref={resultsRef} className="scroll-mt-4">
            {showResults && (
              <>
                <Rule />

                {notices.map((notice) => (
                  <p
                    key={notice.message}
                    className="text-faint py-3 text-[11px] leading-relaxed"
                  >
                    ! {notice.message}
                  </p>
                ))}

                <ResultsTable result={result} />

                <Rule />

                <SummaryBar result={result} />

                <Rule />

                <ComparisonPanel
                  result={result}
                  open={comparisonOpen}
                  onToggle={() => setComparisonOpen((open) => !open)}
                  onMethodChange={setMethod}
                />
              </>
            )}
          </div>

          <Rule />

          <footer className="text-faint py-6 text-center text-[10px] leading-relaxed tracking-wider">
            <p>nominal transfer dibulatkan ke bawah</p>
            <p>ke kelipatan Rp 100</p>
            <p className="mt-3 tracking-[0.3em]">*** TERIMA KASIH ***</p>
          </footer>
        </main>

        <div className="tear" aria-hidden="true" />
      </div>
    </div>
  )
}
