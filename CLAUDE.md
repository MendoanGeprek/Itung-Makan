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

- **Pemilih "Yang menalangi"** — karena pembulatan ke bawah selalu menyisakan
  kekurangan, seseorang harus menanggungnya. Orang ini ditandai "menerima
  transfer" alih-alih diberi nominal kirim.
- **Metode bisa diganti** — panel pembanding bukan cuma menampilkan angka, tapi
  bisa dipakai mengganti metode aktif antara 50/50 dan Proporsional Penuh.
  Bawaannya tetap 50/50 sesuai spec.
- **Dark mode** — pilihan Terang / Gelap / Sistem, tersimpan di `localStorage`.

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
