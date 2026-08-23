/**
 * Pengelolaan tema. Pilihan user disimpan di localStorage, lalu diterapkan
 * sebagai atribut `data-theme` di elemen <html>.
 *
 * Kenapa atribut, bukan mengandalkan prefers-color-scheme langsung: user
 * harus bisa memaksa terang/gelap terlepas dari setelan sistemnya. Mode
 * 'system' tetap ada dan diterjemahkan ke nilai konkret saat diterapkan.
 */

export const STORAGE_KEY = 'itung-makan-theme'

/** Pilihan yang boleh dipegang user. */
export const THEME_CHOICES = ['light', 'dark', 'system']

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

/** Buang nilai asing (localStorage bisa diisi apa saja). */
export function normalizeChoice(value) {
  return THEME_CHOICES.includes(value) ? value : 'system'
}

/** Tema yang sedang dipakai sistem operasi. */
export function systemTheme() {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** 'system' diterjemahkan ke nilai konkret; sisanya diteruskan apa adanya. */
export function resolveTheme(choice) {
  const normalized = normalizeChoice(choice)
  return normalized === 'system' ? systemTheme() : normalized
}

/** Baca pilihan tersimpan. Aman dipanggil saat render di Node (SSR/tes). */
export function readStoredChoice() {
  if (!isBrowser()) return 'system'
  try {
    return normalizeChoice(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    // Mode penyamaran atau penyimpanan situs diblokir — jatuh ke bawaan.
    return 'system'
  }
}

export function storeChoice(choice) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, normalizeChoice(choice))
  } catch {
    // Gagal menyimpan bukan alasan untuk merusak halaman.
  }
}

/** Terapkan ke DOM. Mengembalikan tema konkret yang jadi dipakai. */
export function applyTheme(choice) {
  const resolved = resolveTheme(choice)
  if (isBrowser()) {
    document.documentElement.setAttribute('data-theme', resolved)
  }
  return resolved
}
