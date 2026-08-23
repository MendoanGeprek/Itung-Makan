# Itung Makan

Kalkulator patungan makanan yang membagi diskon dan biaya tambahan secara adil. Harga makanan tetap dihitung proporsional terhadap pesanan masing-masing, sedangkan ongkir, biaya layanan, dan pajak dapat dibagi rata.

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white)

## Fitur

- Menghitung bagian setiap orang berdasarkan harga pesanannya.
- Memisahkan diskon makanan dari biaya tambahan.
- Dua metode pembagian biaya tambahan:
  - **50/50 (rata):** biaya tambahan dibagi sama rata.
  - **Proporsional penuh:** biaya tambahan mengikuti porsi harga pesanan.
- Membandingkan hasil kedua metode sebelum memilih.
- Membulatkan nominal transfer ke bawah pada kelipatan Rp100 dan menampilkan sisanya.
- Menangani jumlah peserta secara dinamis.
- Tema terang, gelap, atau mengikuti sistem.
- Antarmuka responsif bergaya struk belanja.
- Dapat digunakan sebagai aplikasi web maupun APK Android.

## Cara perhitungan

Misalkan:

- `grossTotal` = total tagihan sebelum diskon
- `netPaid` = total yang benar-benar dibayar
- `foodTotal` = jumlah harga makanan seluruh peserta
- `n` = jumlah peserta

Untuk metode pembagian rata, perhitungannya adalah:

```text
biayaTambahan       = grossTotal - foodTotal
totalMakananDiskon  = netPaid - biayaTambahan
rasioDiskon         = totalMakananDiskon / foodTotal

bagianOrang = (hargaPesanan × rasioDiskon) + (biayaTambahan / n)
```

Dengan begitu, diskon mengikuti besar pesanan, tetapi biaya tambahan tidak otomatis membebani orang yang memesan lebih banyak.

Contoh:

| Keterangan | Nilai |
|---|---:|
| Total sebelum diskon | Rp100.000 |
| Total setelah diskon | Rp90.000 |
| Pesanan User A | Rp60.000 |
| Pesanan User B | Rp20.000 |
| Biaya tambahan | Rp20.000 |

| Metode | User A | User B | Total |
|---|---:|---:|---:|
| Biaya dibagi rata | Rp62.500 | Rp27.500 | Rp90.000 |
| Proporsional penuh | Rp67.500 | Rp22.500 | Rp90.000 |

## Menjalankan secara lokal

### Prasyarat

- [Node.js](https://nodejs.org/) `^20.19.0` atau `>=22.12.0`
- npm

### Instalasi

```bash
git clone https://github.com/MendoanGeprek/Itung-Makan.git
cd Itung-Makan
npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

## Perintah yang tersedia

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Membuat build produksi ke folder `dist/` |
| `npm run preview` | Meninjau build produksi secara lokal |
| `npm test` | Menjalankan seluruh test satu kali |
| `npm run test:watch` | Menjalankan test dalam watch mode |
| `npm run android:sync` | Build web lalu sinkronkan ke proyek Android |
| `npm run android:open` | Membuka proyek di Android Studio |
| `npm run android:run` | Build, pasang, dan jalankan APK debug di perangkat |
| `npm run android:live` | Menjalankan aplikasi di perangkat dengan live reload |
| `npm run android:release` | Membuat APK release |
| `npm run android:icons` | Membuat ulang ikon dan splash screen Android |

## Menjalankan di Android

Proyek Android menggunakan [Capacitor](https://capacitorjs.com/) dan membutuhkan:

- Android Studio beserta Android SDK
- JDK dari Android Studio atau JDK yang kompatibel
- `JAVA_HOME` yang menunjuk ke direktori JDK
- `ANDROID_HOME` yang menunjuk ke direktori Android SDK
- Perangkat Android dengan USB debugging aktif untuk pemasangan langsung

### APK debug

Sambungkan perangkat melalui USB, izinkan USB debugging, lalu jalankan:

```bash
npm run android:run
```

APK debug dihasilkan di:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Live reload di perangkat

Jalankan dua perintah ini di terminal terpisah:

```bash
npm run dev
```

```bash
npm run android:live
```

Skrip akan mencari server Vite pada port `5173` sampai `5177`. Untuk menentukan port sendiri, set variabel `DEV_PORT` sebelum menjalankan perintah.

### APK release

```bash
npm run android:release
```

Hasilnya tersedia di:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Untuk APK yang ditandatangani, buat `android/keystore.properties` dengan format berikut dan simpan berkas keystore di luar version control:

```properties
storeFile=nama-keystore.keystore
storePassword=kata-sandi-store
keyAlias=alias-kunci
keyPassword=kata-sandi-kunci
```

Tanpa konfigurasi tersebut, proses release tetap dapat menghasilkan APK, tetapi APK tidak ditandatangani.

## Pengujian

```bash
npm test
```

Test mencakup:

- rumus pembagian dan invariant bahwa jumlah hasil sama dengan total pembayaran;
- pembulatan, input tidak valid, dan kasus tepi;
- penyimpanan serta penerapan tema;
- render hasil perhitungan pada komponen UI.

Saat README ini dibuat, seluruh **28 test** lulus.

## Struktur proyek

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

## Teknologi

- React 19
- Vite 7
- Tailwind CSS 4
- Vitest
- Capacitor 8

## Catatan

- Nominal transfer sengaja dibulatkan **ke bawah**, bukan ke nilai terdekat.
- Semua font disimpan secara lokal agar tampilan APK tetap konsisten tanpa koneksi internet.
- Application ID Android adalah `com.mendoangeprek.itungmakan`; jangan mengubahnya setelah aplikasi dipublikasikan.
