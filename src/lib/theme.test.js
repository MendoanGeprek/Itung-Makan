import { afterEach, describe, expect, it, vi } from 'vitest'
import { normalizeChoice, readStoredChoice, resolveTheme, systemTheme } from './theme.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeChoice', () => {
  it('menerima tiga pilihan sah', () => {
    expect(normalizeChoice('light')).toBe('light')
    expect(normalizeChoice('dark')).toBe('dark')
    expect(normalizeChoice('system')).toBe('system')
  })

  it('membuang nilai asing dari localStorage', () => {
    expect(normalizeChoice('neon')).toBe('system')
    expect(normalizeChoice(null)).toBe('system')
    expect(normalizeChoice(undefined)).toBe('system')
    expect(normalizeChoice(42)).toBe('system')
  })
})

describe('resolveTheme', () => {
  it('meneruskan pilihan eksplisit apa adanya', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })

  it('menerjemahkan system ke tema OS yang sedang aktif', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) })
    vi.stubGlobal('document', {})
    expect(resolveTheme('system')).toBe('dark')

    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) })
    expect(resolveTheme('system')).toBe('light')
  })
})

describe('ketahanan di lingkungan tanpa DOM', () => {
  it('systemTheme tidak pecah saat window tidak ada', () => {
    expect(systemTheme()).toBe('light')
  })

  it('readStoredChoice tidak pecah saat window tidak ada', () => {
    expect(readStoredChoice()).toBe('system')
  })

  it('readStoredChoice bertahan saat localStorage dilarang', () => {
    vi.stubGlobal('document', {})
    vi.stubGlobal('window', {
      get localStorage() {
        throw new Error('akses penyimpanan ditolak')
      },
    })
    expect(readStoredChoice()).toBe('system')
  })
})
