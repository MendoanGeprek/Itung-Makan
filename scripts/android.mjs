/**
 * Menjalankan aplikasi ke HP Android yang tersambung kabel.
 *
 * Kenapa tidak memakai `npx cap run android`: Capacitor CLI memanggil
 * `./gradlew` — skrip shell Unix — tanpa memeriksa sistem operasi, sehingga
 * selalu gagal di Windows dengan pesan "'gradlew' is not recognized".
 * Skrip ini memanggil `gradlew.bat` secara langsung.
 *
 * Pemakaian:
 *   node scripts/android.mjs run     pasang versi terbangun ke HP
 *   node scripts/android.mjs live    pasang versi yang menunjuk dev server
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

const ROOT = resolve(import.meta.dirname, '..')
const CONFIG = join(ROOT, 'capacitor.config.json')

// Vite naik ke porta berikutnya kalau 5173 sedang dipakai, jadi porta tidak
// boleh ditulis tetap: HP bisa diarahkan ke server yang salah tanpa peringatan.
const PORT_RANGE = [5173, 5174, 5175, 5176, 5177]

const mode = process.argv[2] ?? 'run'
if (!['run', 'live'].includes(mode)) {
  fail(`Mode tidak dikenal: ${mode}. Pakai "run" atau "live".`)
}

function fail(message) {
  console.error(`\n  GAGAL: ${message}\n`)
  process.exit(1)
}

function step(message) {
  console.log(`\n  ${message}`)
}

/**
 * Jalankan berkas .exe langsung, tanpa shell.
 *
 * Argumen sengaja tidak dilewatkan melalui shell: Node memperingatkan bahwa
 * argumen yang digabung ke baris perintah tidak di-escape, dan jalur di Windows
 * penuh spasi ("Program Files") yang rawan salah pecah.
 */
function runExe(exe, args, options = {}) {
  const result = spawnSync(exe, args, { stdio: 'inherit', cwd: ROOT, ...options })
  if (result.error) fail(`${exe} tidak bisa dijalankan: ${result.error.message}`)
  if (result.status !== 0) fail(`${exe} keluar dengan kode ${result.status}`)
}

/** Jalankan .exe dan kembalikan keluarannya sebagai teks. */
function captureExe(exe, args, options = {}) {
  const result = spawnSync(exe, args, { encoding: 'utf8', cwd: ROOT, ...options })
  return (result.stdout ?? '').trim()
}

/**
 * Jalankan lewat shell. Diperlukan untuk .bat dan .cmd (npm, npx, gradlew.bat)
 * karena Node menolak menjalankannya langsung. Perintahnya ditulis sebagai satu
 * baris utuh, bukan pasangan perintah + array argumen, supaya tidak memicu
 * peringatan penggabungan argumen.
 */
function runShell(commandLine, options = {}) {
  const result = spawnSync(commandLine, { stdio: 'inherit', cwd: ROOT, shell: true, ...options })
  if (result.error) fail(`Perintah gagal dijalankan: ${result.error.message}`)
  if (result.status !== 0) fail(`Perintah keluar dengan kode ${result.status}: ${commandLine}`)
}

// --- Prasyarat ---------------------------------------------------------------

const javaHome = process.env.JAVA_HOME ?? 'C:\\Program Files\\Android\\Android Studio\\jbr'
if (!existsSync(join(javaHome, 'bin', 'java.exe'))) {
  fail(
    `JDK tidak ditemukan di ${javaHome}.\n` +
      `  Setel JAVA_HOME ke folder jbr milik Android Studio.`,
  )
}
process.env.JAVA_HOME = javaHome

const androidHome =
  process.env.ANDROID_HOME ?? join(process.env.LOCALAPPDATA ?? '', 'Android', 'Sdk')
const adb = join(androidHome, 'platform-tools', 'adb.exe')
if (!existsSync(adb)) fail(`adb tidak ditemukan di ${adb}. Setel ANDROID_HOME.`)

const gradlew = join(ROOT, 'android', 'gradlew.bat')
if (!existsSync(gradlew)) fail('android/gradlew.bat tidak ada. Jalankan `npx cap add android` dulu.')

// --- Cari HP -----------------------------------------------------------------

const devices = captureExe(adb, ['devices'])
  .split('\n')
  .slice(1)
  .map((line) => line.trim())
  .filter((line) => line.endsWith('\tdevice'))
  .map((line) => line.split('\t')[0])

if (devices.length === 0) {
  const unauthorized = captureExe(adb, ['devices']).includes('unauthorized')
  fail(
    unauthorized
      ? 'HP terbaca tapi belum diizinkan. Setujui dialog "Izinkan USB debugging?" di layar HP.'
      : 'Tidak ada HP tersambung.\n' +
          '  Nyalakan USB debugging di Opsi Pengembang, lalu colok kabelnya.',
  )
}
const target = devices[0]
console.log(`\n  HP: ${target}${devices.length > 1 ? `  (dari ${devices.length}, dipakai yang pertama)` : ''}`)

// --- Siapkan aset ------------------------------------------------------------

const originalConfig = readFileSync(CONFIG, 'utf8')
let configPatched = false

try {
  if (mode === 'live') {
    // Dev server harus sudah jalan; kita cuma menunjuk ke sana. Porta dicari,
    // bukan diasumsikan, karena Vite bergeser kalau 5173 sudah terpakai.
    const override = Number(process.env.DEV_PORT)
    const candidates = Number.isInteger(override) ? [override] : PORT_RANGE

    let devPort = null
    for (const port of candidates) {
      const ok = await fetch(`http://localhost:${port}/`)
        .then((r) => r.ok)
        .catch(() => false)
      if (ok) {
        devPort = port
        break
      }
    }

    if (devPort === null) {
      fail(
        `Dev server tidak ditemukan di porta ${candidates.join(', ')}.\n` +
          '  Jalankan `npm run dev` di terminal lain dulu, baru ulangi perintah ini.\n' +
          '  Kalau dev server-mu memakai porta lain, setel DEV_PORT=<porta>.',
      )
    }

    step(`Dev server ditemukan di porta ${devPort}, diteruskan lewat kabel USB`)
    runExe(adb, ['-s', target, 'reverse', `tcp:${devPort}`, `tcp:${devPort}`])

    // Arahkan WebView ke dev server, bukan ke aset yang terbungkus.
    const config = JSON.parse(originalConfig)
    config.server = { url: `http://localhost:${devPort}`, cleartext: true }
    writeFileSync(CONFIG, JSON.stringify(config, null, 2) + '\n')
    configPatched = true

    step('Menyalin konfigurasi ke proyek Android')
    runShell('npx cap sync android')
  } else {
    step('Membangun aset web')
    runShell('npm run build')

    step('Menyalin ke proyek Android')
    runShell('npx cap sync android')
  }

  step('Membangun dan memasang APK')
  runShell(`"${gradlew}" installDebug --no-daemon`, { cwd: join(ROOT, 'android') })
} finally {
  // Konfigurasi asli dikembalikan apa pun yang terjadi, supaya repo tidak
  // ketinggalan alamat dev server yang cuma berlaku sesaat.
  if (configPatched) writeFileSync(CONFIG, originalConfig)
}

// --- Jalankan ----------------------------------------------------------------

const appId = JSON.parse(originalConfig).appId
step('Membuka aplikasi')
runExe(adb, ['-s', target, 'shell', 'am', 'start', '-n', `${appId}/.MainActivity`])

console.log(
  mode === 'live'
    ? '\n  Siap. Ubah kode, tampilan di HP ikut berubah tanpa build ulang.\n' +
        '  Kalau HP kehilangan sambungan, ulangi perintah ini.\n'
    : '\n  Siap. Aplikasi berjalan dari aset yang terbungkus, tanpa perlu komputer.\n',
)
