/**
 * Penyesuaian khusus saat aplikasi berjalan sebagai APK Android.
 *
 * Semua impor Capacitor dilakukan secara dinamis di dalam fungsi, bukan di
 * puncak berkas. Dua alasannya: modulnya tidak ikut masuk bundel web, dan
 * render di Node (dipakai tes) tidak menyentuhnya sama sekali.
 */

const CHROME_COLOR = {
  light: '#c8bda9',
  dark: '#0a0908',
}

/**
 * Samakan warna bilah status dengan tema yang sedang dipakai. Tanpa ini,
 * mode gelap menyisakan garis krem menyala di atas layar.
 *
 * @param {'light'|'dark'} resolvedTheme  Tema konkret, bukan 'system'.
 */
export async function syncNativeChrome(resolvedTheme) {
  if (typeof window === 'undefined') return

  try {
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return

    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setBackgroundColor({ color: CHROME_COLOR[resolvedTheme] ?? CHROME_COLOR.light })
    // Penamaan Capacitor terbalik dari dugaan: Style.Dark berarti teks terang
    // untuk latar gelap, Style.Light berarti teks gelap untuk latar terang.
    await StatusBar.setStyle({ style: resolvedTheme === 'dark' ? Style.Dark : Style.Light })
  } catch {
    // Berjalan di peramban biasa, atau plugin tidak tersedia. Bukan masalah.
  }
}
