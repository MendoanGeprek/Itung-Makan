/**
 * Logika perhitungan patungan — fungsi murni, nol impor React.
 *
 * Ide dasarnya: tagihan food delivery punya dua komponen yang berperilaku beda.
 *   - Harga makanan  -> kena diskon, jadi porsinya proporsional ke pesanan.
 *   - Biaya tambahan -> ongkir / biaya layanan / pajak, tidak kena diskon.
 * Keduanya harus dipisah dulu sebelum dibagi, kalau tidak selalu ada yang rugi.
 */

/** Pembulatan nominal transfer ke kelipatan seratus. */
export const ROUNDING_STEP = 100

const toFinite = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

/** `34140` -> `34100`. Dibulatkan ke BAWAH supaya nominal transfer selalu enak. */
export function roundDownTo(value, step = ROUNDING_STEP) {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) return 0
  return Math.floor(value / step) * step
}

/**
 * @param {object} args
 * @param {number} args.grossTotal  Total tagihan sebelum diskon.
 * @param {number} args.netPaid     Nominal yang benar-benar dibayar.
 * @param {Array<{id: string, name: string, food: number}>} args.people
 * @param {'even'|'proportional'} [args.method]  Cara membagi biaya tambahan.
 * @param {string|null} [args.payerId]  Siapa yang menalangi tagihan.
 */
export function computeSplit({
  grossTotal = 0,
  netPaid = 0,
  people = [],
  method = 'even',
  payerId = null,
} = {}) {
  const gross = toFinite(grossTotal)
  const net = toFinite(netPaid)

  const members = (Array.isArray(people) ? people : []).map((person, index) => ({
    id: person?.id ?? String(index),
    name: String(person?.name ?? '').trim() || `Orang ${index + 1}`,
    food: Math.max(0, toFinite(person?.food)),
  }))

  const count = members.length

  // Langkah 1-3: pisahkan makanan dari biaya tambahan.
  const trueFoodTotal = members.reduce((total, person) => total + person.food, 0)
  const extraFees = gross - trueFoodTotal
  const discountedFoodTotal = net - extraFees

  const warnings = []
  if (count === 0) {
    warnings.push({ level: 'error', message: 'Tambahkan minimal satu orang dulu.' })
  } else if (trueFoodTotal <= 0) {
    warnings.push({ level: 'error', message: 'Isi minimal satu nominal pesanan.' })
  }

  // Tanpa dua syarat ini, langkah 4 dan 5 membagi dengan nol.
  const valid = count > 0 && trueFoodTotal > 0

  if (!valid) {
    return {
      valid: false,
      method,
      trueFoodTotal,
      extraFees: 0,
      discountedFoodTotal: 0,
      discountRatio: 1,
      feePerPerson: 0,
      rows: members.map((person) => ({
        ...person,
        weight: 0,
        discountedFood: 0,
        exactEven: 0,
        exactProportional: 0,
        exact: 0,
        delta: 0,
        transferReady: 0,
      })),
      totals: { exact: 0, transferReady: 0, remainder: 0, matchesNetPaid: false },
      payer: null,
      warnings,
    }
  }

  // Langkah 4: berapa bagian dari harga makanan yang benar-benar dibayar.
  const discountRatio = discountedFoodTotal / trueFoodTotal
  const feePerPerson = extraFees / count

  if (extraFees < 0) {
    warnings.push({
      level: 'warn',
      message:
        'Total sebelum diskon lebih kecil daripada jumlah pesanan — cek lagi angkanya.',
    })
  }
  if (discountRatio > 1) {
    warnings.push({
      level: 'warn',
      message:
        'Total dibayar melebihi total sebelum diskon — selisihnya dihitung sebagai biaya tambahan, bukan diskon.',
    })
  }
  if (discountRatio < 0) {
    warnings.push({
      level: 'warn',
      message:
        'Total dibayar lebih kecil daripada biaya tambahan — kemungkinan angka gross dan net tertukar.',
    })
  }

  // Langkah 5: makanan setelah diskon + jatah biaya tambahan.
  const rows = members.map((person) => {
    const weight = person.food / trueFoodTotal
    const discountedFood = person.food * discountRatio
    const exactEven = discountedFood + feePerPerson
    const exactProportional = discountedFood + extraFees * weight
    const exact = method === 'proportional' ? exactProportional : exactEven

    return {
      ...person,
      weight,
      discountedFood,
      exactEven,
      exactProportional,
      exact,
      delta: exactProportional - exactEven,
      transferReady: roundDownTo(exact),
    }
  })

  const totalExact = rows.reduce((total, row) => total + row.exact, 0)
  const totalTransferReady = rows.reduce((total, row) => total + row.transferReady, 0)

  // Kalau ada yang menalangi, dia tidak transfer — dia yang menerima.
  let payer = null
  const payerRow = rows.find((row) => row.id === payerId)
  if (payerRow) {
    const collects = rows
      .filter((row) => row.id !== payerRow.id)
      .reduce((total, row) => total + row.transferReady, 0)
    const pays = net - collects
    payer = {
      id: payerRow.id,
      name: payerRow.name,
      collects,
      pays,
      fairShare: payerRow.exact,
      absorbs: pays - payerRow.exact,
    }
  }

  return {
    valid: true,
    method,
    trueFoodTotal,
    extraFees,
    discountedFoodTotal,
    discountRatio,
    feePerPerson,
    rows,
    totals: {
      exact: totalExact,
      transferReady: totalTransferReady,
      remainder: net - totalTransferReady,
      // Secara aljabar jumlah nominal persis SELALU sama dengan total dibayar.
      // Cek ini murni jaring pengaman terhadap galat floating point.
      matchesNetPaid: Math.abs(totalExact - net) < 0.01,
    },
    payer,
    warnings,
  }
}
