# Itung Makan

Kalkulator patungan makanan: membagi tagihan food delivery secara adil dengan
memisahkan diskon proporsional dari biaya tambahan.

Aplikasi web React 19 + Vite 7 + Tailwind v4, dijalankan lokal. UI bahasa
Indonesia, format Rupiah, dirancang untuk dipakai di layar HP saat pesan
makanan bareng.

> Berkas ini dimuat sebagai instruksi proyek di setiap sesi. Spesifikasi asli
> yang melahirkan proyek ini ada di riwayat git pada commit `b1723f6`.

## Rumus inti

Ini jantung aplikasinya. Jangan diubah tanpa permintaan eksplisit.

1. `trueFoodTotal` = jumlah semua harga makanan individu
2. `extraFees` = `grossTotal - trueFoodTotal`
3. `discountedFoodTotal` = `netPaid - extraFees`
4. `discountRatio` = `discountedFoodTotal / trueFoodTotal`
5. `individualShare` = `(food * discountRatio) + (extraFees / jumlahOrang)`

Dasarnya: tagihan punya dua komponen yang berperilaku beda. Harga makanan kena
diskon sehingga porsinya proporsional ke pesanan; biaya tambahan (ongkir, biaya
layanan, pajak) tidak kena diskon dan tidak adil kalau dibebankan proporsional
ke yang pesan banyak.

**Invariant:** jumlah seluruh `exact` SELALU sama persis dengan `netPaid`, untuk
kedua metode pembagian. Kalau ada perubahan yang merusak ini, perubahan itulah
yang salah — bukan invariant-nya. `totals.matchesNetPaid` memeriksa ini saat
berjalan, dan ada tes yang mengunci.

## Keputusan yang menyimpang dari spesifikasi asli

Semua ini disengaja dan diminta user. Jangan "diperbaiki" balik ke spec.

### Pembulatan ke BAWAH, bukan ke terdekat

Spec asli menulis "nearest hundred". Yang dipakai adalah `Math.floor` ke
kelipatan 100, dan sisa kekurangannya ditampilkan eksplisit.

Perhatikan jebakannya: contoh di spec (`34.140` → `34.100`) menghasilkan angka
yang sama baik dibulatkan ke bawah maupun ke terdekat, jadi contoh itu tidak
bisa dipakai untuk membedakan keduanya. Bedanya baru muncul di `34.160`
(ke bawah → `34.100`, ke terdekat → `34.200`). Kalau tergoda mengganti
`roundDownTo` jadi `Math.round`, jangan — dan kalau tes yang menghalangi,
tesnya benar.

### Proyek lokal, bukan Claude Artifact

Spec meminta Artifact. User memilih proyek Vite lokal supaya bisa dikembangkan
dan dijalankan sendiri.

### UI bahasa Indonesia

Termasuk nama field: "Total Sebelum Diskon" (gross) dan "Total Setelah Diskon"
(net). Nama variabel di kode tetap `grossTotal` / `netPaid`.

### Tambahan di luar spec

- **Metode bisa diganti** — panel pembanding bukan cuma menampilkan angka, tapi
  bisa dipakai mengganti metode aktif antara 50/50 dan Proporsional Penuh.
  Bawaannya tetap 50/50 sesuai spec.
- **Dark mode** — pilihan Terang / Gelap / Sistem, tersimpan di `localStorage`.

### Pernah ada, sudah dicabut

Pemilih **"Yang menalangi"** sempat ada: satu orang ditandai penerima transfer
alih-alih diberi nominal kirim, dan aplikasi menghitung berapa dia nombok akibat
pembulatan. User meminta dihapus. Jangan dihidupkan lagi tanpa diminta.

Sisa pembulatan tetap ditampilkan di rincian biaya, cuma tidak lagi dikaitkan ke
orang tertentu.

## Struktur

```
src/
  lib/
    split.js        Seluruh rumus. Fungsi murni, NOL impor React.
    format.js       Format dan parsing Rupiah. Satu-satunya tempat angka diformat.
    theme.js        Baca/simpan/terapkan pilihan tema.
  components/
    receipt.jsx     Elemen dasar struk: Rule, DoubleRule, SectionTitle, LeaderLine.
    ...             Sisanya komponen tampilan, tanpa logika hitung.
  App.jsx           Seluruh state aplikasi.
```

Aturan pemisahan: **`split.js` tidak boleh mengimpor React.** Semua rumus hidup
di sana sebagai fungsi murni supaya bisa diuji langsung tanpa merender apa pun.
Komponen hanya menampilkan hasilnya.

Jangan memformat angka inline di JSX — pakai `formatRupiah` / `formatNumber` /
`formatPercent` dari `format.js`.

## Tampilan

Arah desainnya **struk termal**: seluruh halaman satu lembar struk memanjang di
atas latar meja, monospace (IBM Plex Mono), tepi sobek bergerigi, titik
penyambung antara nama dan nominal, cap LUNAS saat perhitungan cocok.

Warna dikelola sebagai token Tailwind yang menunjuk ke variabel CSS runtime
(`--color-paper: var(--paper)` dan seterusnya). Efeknya `bg-paper` otomatis ikut
berganti saat tema diubah, tanpa perlu menulis pasangan `dark:` di tiap
komponen. Kalau menambah warna baru, ikuti pola ini — jangan kembali menulis
`dark:` manual.

Font IBM Plex Mono dibungkus ke dalam proyek di `src/assets/fonts/`, bukan
diambil dari Google Fonts, supaya APK Android tetap benar tampilannya tanpa
internet. Hanya subset latin dan empat bobot yang dipakai (400, 500, 600, 700),
total 59 kB. Kalau menambah kelas bobot lain seperti `font-extrabold`, bobotnya
belum ada — peramban akan memalsukannya dan hasilnya jelek. Unduh dulu bobot itu
dan tambahkan blok `@font-face`-nya.

Varian `dark:` sengaja dialihkan dari `prefers-color-scheme` ke atribut
`[data-theme='dark']`, supaya pilihan manual user bisa mengalahkan setelan
sistem. Ada skrip kecil di `<head>` yang menerapkan tema sebelum React
menggambar; tanpa itu mode gelap berkedip terang setiap muat ulang.

## Menjalankan

```
npm install     # sekali saja setelah clone
npm run dev     # http://localhost:5173
npm test        # 29 tes
npm run build   # ke dist/
```

Node.js wajib ada. Di Windows, kalau `npm` tidak dikenali padahal Node sudah
terpasang, tutup dan buka ulang VS Code — terminal mewarisi PATH lama dari
proses induknya.

## Menguji

Logika hitung adalah seluruh nilai aplikasi ini, jadi diuji terpisah dari UI.

- `src/lib/split.test.js` — rumus, invariant, kasus tepi (pembagian nol, biaya
  tambahan negatif, input rusak).
- `src/lib/theme.test.js` — nilai asing di `localStorage`, penyimpanan diblokir.
- `src/components/render.test.jsx` — memastikan angka benar-benar sampai ke
  layar, bukan cuma benar di fungsinya.

Vektor uji utama, hafalkan kalau perlu memeriksa cepat:

```
gross 100.000 | net 90.000 | A: 60.000, B: 20.000
  biaya tambahan 20.000, discountRatio 0,875
  50/50        A 62.500  B 27.500   (jumlah 90.000)
  proporsional A 67.500  B 22.500   (jumlah 90.000)
```

## Kasus tepi yang sudah ditangani

Jangan hilangkan pagar-pagar ini saat menyunting `split.js`:

| Kondisi | Perlakuan |
|---|---|
| `trueFoodTotal` = 0 | Blokir hitung, langkah 4 akan membagi nol |
| daftar orang kosong | Blokir hitung, langkah 5 akan membagi nol |
| `extraFees` negatif | Tetap hitung, munculkan peringatan |
| `discountRatio` > 1 atau < 0 | Tetap hitung, munculkan peringatan |
| input kosong / non-angka | Diperlakukan sebagai 0, tidak pernah `NaN` |

## Aplikasi Android

Dibungkus dengan Capacitor: kode web yang sama persis dijalankan di dalam
WebView native. Tidak ada kode UI terpisah untuk Android.

- `appId` = `com.mendoangeprek.itungmakan`. Jangan diubah setelah dipublikasikan
  ke Play Store, karena itu identitas permanen aplikasinya di sana.
- Ikon dan layar pembuka dihasilkan dari `assets/icon-source.svg`. Kalau
  ikonnya diubah, jalankan ulang `npm run android:icons` supaya semua
  kerapatan layar ikut diperbarui, jangan menyunting berkas di `res/` satu per
  satu.
- `src/lib/native.js` menyamakan warna bilah status dengan tema. Impor
  Capacitor di sana sengaja dinamis supaya tidak ikut masuk bundel web.

### Menjalankan ke HP lewat kabel

```
npm run android:run     # pasang versi mandiri, jalan tanpa komputer
npm run android:live     # live reload; jalankan `npm run dev` dulu di terminal lain
npm run android:sync     # cuma build + salin, tanpa memasang
npm run android:open     # buka di Android Studio
```

**Jangan pakai `npx cap run android` di Windows.** Capacitor CLI memanggil
`./gradlew` — skrip shell Unix — tanpa memeriksa sistem operasi, jadi selalu
gagal dengan "'gradlew' is not recognized". Pindah ke Git Bash tidak menolong
karena Node tetap memakai `cmd.exe` untuk spawn. `scripts/android.mjs`
menggantikannya dengan memanggil `gradlew.bat` langsung, sekaligus mengurus
`adb reverse`, pemasangan, dan peluncuran.

Mode `live` mencari dev server di porta 5173-5177, bukan mengasumsikan 5173,
karena Vite bergeser ke porta berikutnya kalau yang pertama terpakai. Paksa
dengan `DEV_PORT=<porta>` kalau perlu. Setelah sync, `capacitor.config.json`
selalu dikembalikan ke isi asli supaya alamat dev server tidak ikut ter-commit.

`android/app/src/debug/AndroidManifest.xml` mengizinkan HTTP polos **hanya untuk
varian debug**, karena live reload berjalan tanpa TLS. Jangan pindahkan flag itu
ke manifest utama — build release harus tetap menolak lalu lintas tidak
terenkripsi.

Prasyarat sekali seumur mesin: `JAVA_HOME` menunjuk ke `jbr/` milik Android
Studio, `ANDROID_HOME` ke folder SDK. Setelah menyetelnya, tutup dan buka ulang
VS Code.

APK hasil build ada di `android/app/build/outputs/apk/debug/app-debug.apk`.

### APK release untuk dibagikan langsung

```
npm run android:release
```

Menghasilkan `android/app/build/outputs/apk/release/app-release.apk`, sekitar
3,3 MB — 28% lebih kecil dari debug, tanpa penanda `debuggable` maupun izin
HTTP polos. Kalau ada HP tersambung, langsung dipasang sekalian; kalau tidak,
berkasnya tinggal disalin ke HP dan dibuka dari sana.

Penandatanganan dibaca dari `android/keystore.properties`, yang menunjuk
`android/itung-makan.keystore`. **Keduanya tidak pernah di-commit** dan harus
dicadangkan sendiri. Kalau hilang, pembaruan berikutnya tidak bisa menimpa
pemasangan yang sudah ada — penggunanya harus mencopot aplikasi lama dulu.

Kalau `keystore.properties` tidak ada, build release tetap berjalan tapi
menghasilkan APK tak tertandatangan. Ini disengaja supaya orang lain bisa
meng-clone repo dan membangun versi debug tanpa perlu kunci milikmu.

Dua jebakan yang sudah kena sekali:

- Di dalam modul `app`, `file()` menunjuk ke `android/app/`, bukan `android/`.
  Jalur keystore memakai `rootProject.file()`.
- Tanda tangan release berbeda dari debug, jadi Android menolak menimpa
  pemasangan debug yang sudah ada. Skripnya mendeteksi
  `INSTALL_FAILED_UPDATE_INCOMPATIBLE` lalu mencopot versi lama dan memasang
  ulang.

R8 sengaja dibiarkan mati mengikuti bawaan Capacitor. Menyalakannya tanpa aturan
proguard yang benar bisa membuang kelas yang cuma dipanggil lewat jembatan
JavaScript, dan gagalnya baru terlihat saat aplikasi dijalankan.
