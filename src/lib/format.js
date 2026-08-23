/**
 * Pemformatan dan parsing angka Rupiah.
 * Dipakai ulang seluruh komponen — jangan format angka inline di JSX.
 */

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const plain = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** `34140` -> `"Rp 34.140"`. Nilai tak hingga / NaN jadi `"Rp 0"`. */
export function formatRupiah(value) {
  if (!Number.isFinite(value)) return rupiah.format(0)
  return rupiah.format(Math.round(value))
}

/** `34140` -> `"34.140"`. Untuk isi field input dan angka tanpa prefiks. */
export function formatNumber(value) {
  if (!Number.isFinite(value)) return '0'
  return plain.format(Math.round(value))
}

const percent = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** `0.125` -> `"12,5%"`. Maksimal 2 desimal. */
export function formatPercent(ratio) {
  if (!Number.isFinite(ratio)) return '0%'
  return `${percent.format(ratio * 100)}%`
}

/**
 * Ambil angka dari apa pun yang diketik user: `"Rp 150.000"` -> `150000`.
 * Selalu mengembalikan angka berhingga — kosong jadi `0`, tidak pernah NaN.
 */
export function parseRupiah(input) {
  if (typeof input === 'number') return Number.isFinite(input) ? input : 0
  const digits = String(input ?? '').replace(/\D/g, '')
  if (digits === '') return 0
  const parsed = Number(digits)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Nominal polos untuk disalin ke m-banking: `34100` -> `"34100"`. */
export function toPlainAmount(value) {
  if (!Number.isFinite(value)) return '0'
  return String(Math.round(value))
}
