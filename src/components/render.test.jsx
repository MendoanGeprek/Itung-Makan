import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import App from '../App.jsx'
import ComparisonPanel from './ComparisonPanel.jsx'
import ResultsTable from './ResultsTable.jsx'
import SummaryBar from './SummaryBar.jsx'
import { computeSplit } from '../lib/split.js'

// Intl memakai spasi tak-terpisah di antara "Rp" dan angkanya.
const render = (element) => renderToString(element).replace(/ /g, ' ')

const vector = (method = 'even') =>
  computeSplit({
    grossTotal: 100000,
    netPaid: 90000,
    people: [
      { id: 'a', name: 'User A', food: 60000 },
      { id: 'b', name: 'User B', food: 20000 },
    ],
    method,
  })

describe('render awal', () => {
  it('menampilkan form tanpa crash', () => {
    const html = render(<App />)
    expect(html).toContain('Total Sebelum Diskon')
    expect(html).toContain('Total Setelah Diskon')
    expect(html).toContain('User A')
    expect(html).toContain('User B')
    expect(html).toContain('Hitung Patungan')
  })

  it('belum menampilkan hasil sebelum dihitung', () => {
    const html = render(<App />)
    expect(html).not.toContain('Rincian Patungan')
    expect(html).not.toContain('Jumlah pas')
  })
})

describe('hasil sampai ke layar', () => {
  it('menampilkan nominal siap-transfer tiap orang', () => {
    const html = render(<ResultsTable result={vector()} />)
    expect(html).toContain('Rp 62.500')
    expect(html).toContain('Rp 27.500')
    expect(html).toContain('cocok dengan total setelah diskon')
  })


  it('merinci biaya tambahan dan diskon', () => {
    const html = render(<SummaryBar result={vector()} />)
    expect(html).toContain('Rp 20.000') // biaya tambahan
    expect(html).toContain('Rp 10.000') // per orang
    expect(html).toContain('12,5%') // diskon
  })

  it('menyandingkan kedua metode beserta selisihnya', () => {
    const html = render(
      <ComparisonPanel result={vector()} open onToggle={() => {}} onMethodChange={() => {}} />,
    )
    expect(html).toContain('Rp 62.500')
    expect(html).toContain('Rp 67.500')
    expect(html).toContain('Rp 22.500')
    expect(html).toContain('Rp 5.000') // selisih
  })

  it('mengikuti metode terpilih saat diganti ke proporsional', () => {
    const html = render(<ResultsTable result={vector('proportional')} />)
    expect(html).toContain('Rp 67.500')
    expect(html).toContain('Rp 22.500')
    expect(html).toContain('Proporsional Penuh')
  })
})
