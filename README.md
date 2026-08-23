# Itung Makan

Kalkulator patungan makanan yang membagi diskon dan biaya tambahan secara adil. Bisa digunakan di browser maupun sebagai aplikasi Android.

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white)

## Untuk pengguna

### Apa yang dilakukan aplikasi ini?

Itung Makan membantu membagi tagihan pesan makanan ketika diskon dan biaya tambahannya membuat perhitungan manual menjadi membingungkan.

Aplikasi akan:

- membagikan diskon sesuai harga pesanan masing-masing;
- membagi ongkir, biaya layanan, dan pajak secara rata atau proporsional;
- membulatkan nominal transfer ke bawah pada kelipatan Rp100;
- menunjukkan siapa yang perlu transfer dan berapa kekurangan akibat pembulatan;
- menghitung jumlah yang diterima oleh orang yang menalangi pembayaran.

Semua perhitungan berlangsung di perangkat. Aplikasi tidak membutuhkan akun dan tidak mengirim data tagihan ke server.

### Cara menggunakan

1. Isi **Total Sebelum Diskon** sesuai total tagihan awal.
2. Isi **Total Setelah Diskon** sesuai nominal yang benar-benar dibayar.
3. Masukkan nama dan harga pesanan setiap orang.
4. Tambahkan orang lain dengan tombol **+ Tambah Orang** bila diperlukan.
5. Pilih orang yang menalangi tagihan.
6. Tekan **Hitung Patungan**.
7. Lihat nominal transfer setiap orang dan sisa pembulatannya.

Panel perbandingan menyediakan dua metode:

- **50/50 (disarankan):** biaya tambahan dibagi sama rata, sedangkan diskon tetap mengikuti pesanan.
- **Proporsional penuh:** biaya tambahan dan diskon sama-sama mengikuti besar pesanan.

Tema aplikasi dapat diubah menjadi **Terang**, **Gelap**, atau **Sistem**.

### Memasang APK Android

1. Unduh berkas `app-release.apk` yang diberikan oleh developer atau tersedia di [halaman Releases](https://github.com/MendoanGeprek/Itung-Makan/releases).
2. Buka berkas tersebut di perangkat Android.
3. Jika diminta, izinkan pemasangan dari sumber ini.
4. Ikuti petunjuk pemasangan sampai selesai.

Android 7.0 (API 24) atau versi yang lebih baru diperlukan.

> Jika Android menolak pembaruan karena tanda tangan berbeda, hapus versi lama terlebih dahulu. Data lokal aplikasi—saat ini hanya pilihan tema—akan ikut terhapus.

## Cara kerja pembagian

Misalkan total sebelum diskon Rp100.000, total setelah diskon Rp90.000, pesanan A Rp60.000, dan pesanan B Rp20.000. Berarti terdapat biaya tambahan Rp20.000.

| Metode | User A | User B | Total |
|---|---:|---:|---:|
| Biaya dibagi rata | Rp62.500 | Rp27.500 | Rp90.000 |
| Proporsional penuh | Rp67.500 | Rp22.500 | Rp90.000 |

Pada metode rata, tiap orang memperoleh diskon sesuai harga makanannya, lalu biaya tambahan dibagi sama besar. Jumlah akhir selalu sama dengan total yang benar-benar dibayar.

---

## Untuk developer

### Teknologi

- React 19
- Vite 7
- Tailwind CSS 4
- Vitest
- Capacitor 8

### Menjalankan secara lokal

Prasyarat:

- [Node.js](https://nodejs.org/) `^20.19.0` atau `>=22.12.0`
- npm

```bash
git clone https://github.com/MendoanGeprek/Itung-Makan.git
cd Itung-Makan
npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

### Perintah npm

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Membuat build web produksi di `dist/` |
| `npm run preview` | Meninjau build produksi secara lokal |
| `npm test` | Menjalankan seluruh test satu kali |
| `npm run test:watch` | Menjalankan test dalam watch mode |
| `npm run android:sync` | Build web lalu sinkronkan ke proyek Android |
| `npm run android:open` | Membuka proyek di Android Studio |
| `npm run android:run` | Build, pasang, dan jalankan APK debug |
| `npm run android:live` | Menjalankan aplikasi di perangkat dengan live reload |
| `npm run android:release` | Membuat APK release dan memasangnya jika ada perangkat |
| `npm run android:icons` | Membuat ulang ikon dan splash screen Android |

### Rumus inti

```text
foodTotal           = jumlah seluruh harga pesanan
extraFees           = grossTotal - foodTotal
discountedFoodTotal = netPaid - extraFees
discountRatio       = discountedFoodTotal / foodTotal

bagianOrang = (hargaPesanan × discountRatio) + (extraFees / jumlahOrang)
```

Untuk metode proporsional penuh, komponen `extraFees / jumlahOrang` diganti dengan `extraFees × porsiPesanan`.

Invariant penting: jumlah bagian persis seluruh peserta harus selalu sama dengan `netPaid`. Nominal transfer baru dibulatkan setelah nilai persis diperoleh.

### Pengujian

```bash
npm test
```

Test mencakup logika pembagian, invariant total, pembulatan, input tidak valid, tema, dan render komponen. Saat dokumentasi ini diperbarui, seluruh **29 test** lulus.

### Struktur proyek

```text
Itung-Makan/
├── android/                 # Proyek native Android
├── assets/                  # Sumber ikon dan splash screen
├── scripts/
│   └── android.mjs          # Otomasi build dan pemasangan Android
├── src/
│   ├── assets/fonts/        # IBM Plex Mono lokal
│   ├── components/          # Komponen antarmuka
│   ├── lib/
│   │   ├── format.js        # Parsing dan format Rupiah
│   │   ├── native.js        # Integrasi tampilan native Android
│   │   ├── split.js         # Logika inti pembagian tagihan
│   │   └── theme.js         # Pengelolaan tema
│   ├── App.jsx              # State dan komposisi aplikasi
│   ├── index.css            # Style global dan token tema
│   └── main.jsx             # Entry point React
├── capacitor.config.json
├── package.json
└── vite.config.js
```

Logika perhitungan sengaja ditempatkan di `src/lib/split.js` sebagai fungsi murni tanpa dependensi React.

### Build Android

Prasyarat tambahan:

- Android Studio dan Android SDK Platform 36
- JDK 21 atau JDK yang kompatibel
- `JAVA_HOME` menunjuk ke direktori JDK
- `ANDROID_HOME` menunjuk ke Android SDK
- USB debugging aktif untuk pemasangan langsung ke perangkat

Build dan pasang APK debug:

```bash
npm run android:run
```

Live reload di perangkat, jalankan pada dua terminal:

```bash
npm run dev
```

```bash
npm run android:live
```

Skrip live reload mencari Vite pada port `5173`–`5177`. Gunakan variabel `DEV_PORT` untuk menentukan port lain.

### Signing dan APK release

Buat keystore sendiri dan simpan cadangannya di tempat aman. Kemudian buat `android/keystore.properties`:

```properties
storeFile=nama-keystore.keystore
storePassword=kata-sandi-store
keyAlias=alias-kunci
keyPassword=kata-sandi-kunci
```

Letakkan keystore relatif terhadap direktori `android/`, lalu jalankan:

```bash
npm run android:release
```

APK bertanda tangan tersedia di:

```text
android/app/build/outputs/apk/release/app-release.apk
```

`android/keystore.properties` dan berkas `*.keystore` sudah diabaikan Git. Jangan commit kredensial signing. Kehilangan keystore berarti build berikutnya tidak dapat memperbarui aplikasi yang telah dipasang atau dipublikasikan dengan key tersebut.

Untuk build manual yang tidak otomatis memasang APK ke perangkat:

```bash
npm run build
npx cap sync android
cd android
gradlew.bat assembleRelease --no-daemon
```

### Catatan pengembangan

- Nominal transfer sengaja dibulatkan **ke bawah**, bukan ke nilai terdekat.
- Font disimpan secara lokal agar APK tampil konsisten tanpa internet.
- HTTP polos hanya diizinkan pada build debug untuk live reload.
- Application ID adalah `com.mendoangeprek.itungmakan`; jangan mengubahnya setelah aplikasi dipublikasikan.
