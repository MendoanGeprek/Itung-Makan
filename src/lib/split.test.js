import { describe, expect, it } from 'vitest'
import { computeSplit, roundDownTo } from './split.js'

const person = (id, name, food) => ({ id, name, food })

describe('roundDownTo', () => {
  it('membulatkan ke bawah ke kelipatan seratus', () => {
    expect(roundDownTo(34140)).toBe(34100)
    expect(roundDownTo(34160)).toBe(34100)
    expect(roundDownTo(34100)).toBe(34100)
  })

  it('tidak pecah pada nilai tak berhingga', () => {
    expect(roundDownTo(NaN)).toBe(0)
    expect(roundDownTo(Infinity)).toBe(0)
  })
})

describe('computeSplit — pesanan tidak seimbang', () => {
  const result = computeSplit({
    grossTotal: 100000,
    netPaid: 90000,
    people: [person('a', 'User A', 60000), person('b', 'User B', 20000)],
  })

  it('memisahkan makanan dari biaya tambahan', () => {
    expect(result.valid).toBe(true)
    expect(result.trueFoodTotal).toBe(80000)
    expect(result.extraFees).toBe(20000)
    expect(result.discountedFoodTotal).toBe(70000)
    expect(result.discountRatio).toBeCloseTo(0.875, 10)
    expect(result.feePerPerson).toBe(10000)
  })

  it('membagi biaya tambahan rata pada metode 50/50', () => {
    const [a, b] = result.rows
    expect(a.exactEven).toBeCloseTo(62500, 6)
    expect(b.exactEven).toBeCloseTo(27500, 6)
  })

  it('membebani pemesan besar pada metode proporsional', () => {
    const [a, b] = result.rows
    expect(a.exactProportional).toBeCloseTo(67500, 6)
    expect(b.exactProportional).toBeCloseTo(22500, 6)
    expect(a.delta).toBeCloseTo(5000, 6)
    expect(b.delta).toBeCloseTo(-5000, 6)
  })

  it('menjumlah persis ke total dibayar pada kedua metode', () => {
    const sumEven = result.rows.reduce((t, r) => t + r.exactEven, 0)
    const sumProportional = result.rows.reduce((t, r) => t + r.exactProportional, 0)
    expect(sumEven).toBeCloseTo(90000, 6)
    expect(sumProportional).toBeCloseTo(90000, 6)
    expect(result.totals.matchesNetPaid).toBe(true)
  })

  it('memakai metode terpilih untuk nominal siap-transfer', () => {
    const proportional = computeSplit({
      grossTotal: 100000,
      netPaid: 90000,
      people: [person('a', 'User A', 60000), person('b', 'User B', 20000)],
      method: 'proportional',
    })
    expect(proportional.rows[0].transferReady).toBe(67500)
    expect(proportional.rows[1].transferReady).toBe(22500)
  })
})

describe('computeSplit — sisa pembulatan', () => {
  const result = computeSplit({
    grossTotal: 100000,
    netPaid: 90000,
    people: [person('a', 'User A', 55000), person('b', 'User B', 25000)],
  })

  it('membulatkan tiap orang ke bawah dan menghitung kekurangannya', () => {
    const [a, b] = result.rows
    expect(a.exact).toBeCloseTo(58125, 6)
    expect(b.exact).toBeCloseTo(31875, 6)
    expect(a.transferReady).toBe(58100)
    expect(b.transferReady).toBe(31800)
    expect(result.totals.transferReady).toBe(89900)
    expect(result.totals.remainder).toBe(100)
  })

  it('menghitung berapa yang ditanggung si penalang', () => {
    const withPayer = computeSplit({
      grossTotal: 100000,
      netPaid: 90000,
      people: [person('a', 'User A', 55000), person('b', 'User B', 25000)],
      payerId: 'a',
    })
    expect(withPayer.payer.name).toBe('User A')
    expect(withPayer.payer.collects).toBe(31800)
    expect(withPayer.payer.pays).toBe(58200)
    expect(withPayer.payer.absorbs).toBeCloseTo(75, 6)
  })
})

describe('computeSplit — kasus tepi', () => {
  it('menolak hitung saat belum ada pesanan sama sekali', () => {
    const result = computeSplit({
      grossTotal: 100000,
      netPaid: 90000,
      people: [person('a', 'User A', 0), person('b', 'User B', 0)],
    })
    expect(result.valid).toBe(false)
    expect(result.warnings.some((w) => w.level === 'error')).toBe(true)
    expect(result.rows.every((r) => Number.isFinite(r.exact))).toBe(true)
  })

  it('menolak hitung saat daftar orang kosong', () => {
    const result = computeSplit({ grossTotal: 100000, netPaid: 90000, people: [] })
    expect(result.valid).toBe(false)
    expect(result.rows).toEqual([])
  })

  it('memperingatkan saat biaya tambahan negatif', () => {
    const result = computeSplit({
      grossTotal: 50000,
      netPaid: 45000,
      people: [person('a', 'User A', 40000), person('b', 'User B', 20000)],
    })
    expect(result.valid).toBe(true)
    expect(result.extraFees).toBe(-10000)
    expect(result.warnings.some((w) => w.level === 'warn')).toBe(true)
  })

  it('memperingatkan saat tidak ada diskon sama sekali', () => {
    const result = computeSplit({
      grossTotal: 100000,
      netPaid: 110000,
      people: [person('a', 'User A', 60000), person('b', 'User B', 20000)],
    })
    expect(result.discountRatio).toBeGreaterThan(1)
    expect(result.warnings.some((w) => w.level === 'warn')).toBe(true)
  })

  it('tetap menghasilkan angka berhingga saat ada orang tanpa pesanan', () => {
    const result = computeSplit({
      grossTotal: 100000,
      netPaid: 90000,
      people: [
        person('a', 'User A', 60000),
        person('b', 'User B', 20000),
        person('c', 'User C', 0),
      ],
    })
    expect(result.rows.every((r) => Number.isFinite(r.exact))).toBe(true)
    expect(result.rows[2].exact).toBeCloseTo(20000 / 3, 6)
    expect(result.totals.exact).toBeCloseTo(90000, 6)
  })

  it('memperlakukan input rusak sebagai nol, bukan NaN', () => {
    const result = computeSplit({
      grossTotal: '100000',
      netPaid: undefined,
      people: [person('a', '', 'abc'), person('b', 'User B', 20000)],
    })
    expect(result.rows.every((r) => Number.isFinite(r.exact))).toBe(true)
    expect(result.rows[0].food).toBe(0)
    expect(result.rows[0].name).toBe('Orang 1')
  })
})
