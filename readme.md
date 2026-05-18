# Sistem Informasi Mahasiswa

Aplikasi web ini dibuat buat ngelola data mahasiswa dengan gampang. Dibangun pake **HTML, CSS murni, dan JavaScript vanilla**

Ada dua halaman utama: **Registrasi** buat nambah mahasiswa baru, dan **Dashboard** buat liat, nyari, ngubah, ngapus, sampe ngekspor data ke Excel/Word. Navbar-nya juga unik: **awahnya ngumpet, terus muncul transparan kayak kaca (glassmorphism) pas cursor diarahin ke pojok atas layar atau pas di-scroll ke atas**.

## Yang Bisa Dilakukan

- **Registrasi Mahasiswa** — Form lengkap (NIM, nama, alamat, jenis kelamin, tanggal lahir, password) lengkap validasi. Data disimpen di localStorage.
- **Dashboard CRUD** — Liat daftar mahasiswa, nambah (pake modal), ngubah (modal udah keisi datanya), hapus (ada konfirmasi).
- **Cari & Filter** — Cari real-time pake NIM/nama. Filter berdasarkan jenis kelamin.
- **Pagination** — Tiap halaman isinya 5 data, lengkap tombol Sebelumnya/Berikutnya.
- **Kartu Statistik** — 4 kartu ringkasan: Total Mahasiswa, Laki-laki, Perempuan, Total NIM Unik.
- **Ekspor Excel** — Data bisa didownload dalam format `.xlsx` pake SheetJS.
- **Ekspor Word** — Data bisa didownload dalam format `.docx` pake FileSaver.js.
- **Navbar Glassmorphism** — Navbar transparan, muncul pas cursor di 100px atas layar atau pas scroll ke atas. Ngumpet otomatis 1,5 detik.
- **Notifikasi Toast** — Notifikasi sukses/gagal dengan animasi bounce.
- **Responsif** — Bisa dipake di HP, tablet, dan desktop.
- **SPA Sederhana** — Pindah halaman tanpa reload — konten di-fetch dari file HTML terpisah.
- **Anti XSS** — Fungsi `escapeHtml()` buat ngamanin data yang ditampilin di tabel.
- **Docker Support** — Tinggal `docker build` dan jalan pake Nginx.

## Teknologi yang Dipake

| Teknologi | Buat Apa |
|-----------|----------|
| HTML5 | Struktur halaman |
| CSS3 (Custom) | Styling — **menggantikan Tailwind CSS** dengan utility classes buatan sendiri |
| JavaScript ES6+ | Vanilla JS, tanpa framework |
| SheetJS (XLSX) | Export Excel |
| FileSaver.js | Download file |
| localStorage | Nyimpen data di browser |
| Docker + Nginx | Deployment kontainer |

> **Catatan:** Projek ini awalnya pake Tailwind CSS, tapi udah diganti total pake CSS murni. Semua utility kayak `.flex`, `.text-sm`, `.bg-white`, `.rounded-lg`, `.shadow` didefinisikan manual di `src/style/styles.css`. Jadi **nggak perlu install atau compile Tailwind sama sekali**.

## Struktur File

```
my-website/
├── index.html                       # Halaman utama SPA
├── Dockerfile                       # Docker build
├── nginx.conf                       # Konfigurasi Nginx
├── readme.md
├── src/
│   ├── components/
│   │   └── navbarComponents.html    # Komponen navbar
│   ├── pages/
│   │   ├── DashboardPages.html      # Halaman dashboard
│   │   └── loginPages.html          # Halaman registrasi
│   ├── js/
│   │   ├── app.js                   # Router SPA
│   │   ├── dashboard.js             # Logic CRUD, search, export
│   │   ├── login.js                 # Logic form registrasi
│   │   └── navbar.js                # Logic navbar
│   └── style/
│       ├── styles.css               # Utility CSS pengganti Tailwind
│       ├── navbar.css               # Styling navbar glassmorphism
│       ├── login.css                # Styling form registrasi
│       └── dashboard.css            # Styling dashboard
```

## Cara Pake

1. **Buka langsung pake Live Server** (ekstensi VS Code "Live Server"):
   - Buka `index.html` pake Live Server
   - Ntar jalan di `http://localhost:5500`

2. **Atau pake Docker:**
   ```bash
   docker build -t my-website .
   docker run -p 8080:80 my-website
   ```
   Terus buka `http://localhost:8080`

3. **Coba fitur**:
   - Klik menu **Registrasi** → isi data → Submit
   - Klik **Dashboard** → liat semua mahasiswa, cari, filter, edit, hapus
   - Klik **Export Excel** atau **Export Word** buat download data
   - Gerakin cursor ke pojok atas layar → navbar turun

## Penjelasan Kode Penting

Berikut penjelasan bagian-bagian kode yang penting dalam bahasa manusia:

### 1. Routing SPA (`src/js/app.js`)

Aplikasi ini pake sistem SPA (Single Page Application) buatan sendiri. Gak pake React atau Vue.

**Cara kerjanya:**
- Fungsi `loadPage(url)` memanggil `fetch()` buat ngambil file HTML dari folder `src/pages/`.
- Begitu HTML-nya diterima, kontennya dimasukin ke elemen `<main id="main-content">`.
- CSS khusus halaman (misal `login.css`) ditambahin ke `<head>` secara otomatis. CSS global kayak `styles.css` dan `navbar.css` gak diutak-atik.
- Semua `<script>` yang ada di halaman tujuan dijalankan ulang pake elemen `<script>` baru — ini penting soalnya kalo cuma `innerHTML`, script-nya gak bakal jalan.
- Ada sistem **cleanup**: sebelum halaman baru dimuat, script dan CSS halaman sebelumnya dibersihin. Ada juga `AbortController` (`window.__pageController`) buat ngebatalin event listener yang gak kepake.

**Kenapa pake `?t=` + Date.now()?** Biar browser selalu ambil file versi terbaru, bukan dari cache lama.

**Fungsi `waitForElement()`** nungguin elemen navbar muncul di DOM (soalnya navbar dimuat secara async), baru pasang event listener ke link navigasi.

### 2. Dua Halaman yang Dimuat SPA

- **Halaman pertama** yang dibuka adalah `loginPages.html` (form registrasi), bukan dashboard. Cocok buat pengguna baru.
- User bisa pindah ke **Dashboard** lewat link di navbar tanpa reload halaman.

### 3. Navbar Glassmorphism (`src/js/navbar.js` & `src/style/navbar.css`)

Navbar-nya unik: **ngumpet secara default**, terus muncul kalo:
- Mouse masuk area 100px dari atas layar (dicek pake `mousemove`).
- Atau pas user **scroll ke atas** (dicek dari perubahan `scrollY`).

**Cara kerjanya di kode:**
- CSS navbar pake `transform: translateY(-150%)` biar ngumpet di atas layar.
- Begitu kelas `.show-navbar` ditambahin, `translateY` jadi `0` — navbar muncul dengan animasi smooth.
- Ada **throttle 100ms** di event `mousemove` biar gak berat.
- Begitu muncul, **timer 1,5 detik** langsung jalan buat nyembunyiin navbar lagi.
- Efek kaca (glassmorphism) dicapai pake `background-color: rgba(255, 255, 255, 0.25)` + `backdrop-filter: blur(12px)`.

### 4. CSS Tanpa Tailwind (`src/style/styles.css`)

Ini file CSS yang paling penting. Isinya utility classes yang **meniru Tailwind CSS** tapi ditulis manual.

**Yang ada di sini:**
- **Warna global** pake CSS variables (`--gray-100`, `--indigo-600`, dll).
- **Utility classes** kayak `.flex`, `.text-sm`, `.bg-white`, `.p-4`, `.rounded-lg`, `.shadow` — semuanya didefinisikan sendiri.
- **Styling dasar** buat input, select, textarea, button, table — jadi konsisten di seluruh halaman.
- **Media queries** buat responsive (breakpoint sm: 640px, md: 768px, lg: 1024px).
- **Animasi** kayak `.spinner` (loading) dan keyframes `spin`.

Karena pake utility classes sendiri, projek ini **gak perlu npm install, gak perlu compile, gak perlu node_modules** — tinggal buka di browser.

### 5. CRUD Dashboard (`src/js/dashboard.js`)

Ini file terbesar. Semua logic buat ngelola data mahasiswa ada di sini.

**Poin-poin penting:**

- **Data disimpan di `localStorage`** pake kunci `mahasiswaList`. Setiap nambah/edit/hapus, data langsung disimpen ulang.
- **Filter dan Search**: Ada 3 tab filter (Semua/Laki-laki/Perempuan). Kolom search nyari berdasarkan NIM atau nama secara real-time (tiap kali user ngetik, tabel langsung diperbarui).
- **Pagination**: 5 data per halaman. Ada tombol Sebelumnya/Berikutnya dan indikator halaman.
- **Modal**: Form modal yang sama dipake buat **nambah** dan **edit**. Bedanya: pas edit, NIM dikunci (gak bisa diganti), dan form diisi data lama. Pas nambah, form kosong.
- **Export Excel**: Pake library SheetJS (`XLSX`). Data diubah dari array JSON ke worksheet, terus di-download sebagai file `.xlsx`.
- **Export Word**: Dari data mahasiswa dibuat tabel HTML, dibungkus sebagai Blob bertipe `application/msword`, terus di-download pake FileSaver.js (`saveAs`).
- **Event Delegation**: Tombol Edit & Hapus di tabel gak pake event listener per tombol. Pake 1 event listener di `document.body` yang nangkep klik berdasarkan class `.edit-btn` / `.delete-btn`.
- **AbortController**: Dipake biar event listener gak numpuk pas pindah halaman. Waktu halaman dashboard ditinggal, controllernya di-abort.

### 6. Registrasi (`src/js/login.js`)

- Form registrasi dengan validasi lengkap: NIM minimal 8 digit angka, password minimal 6 karakter, semua field wajib diisi.
- Data disimpen ke `localStorage` pake key `mahasiswaList`.
- NIM dicek duplikat — kalo udah ada, registrasi ditolak.
- Tanggal lahir dipecah jadi 3 dropdown (tanggal, bulan, tahun) yang diisi otomatis dari JavaScript.
- Begitu submit berhasil, form di-reset dan notifikasi toast muncul.

### 7. Keamanan (XSS Prevention)

Fungsi `escapeHtml()` di `dashboard.js` dan `login.js` ngubah karakter berbahaya kayak `<`, `>`, `&`, `"`, `'` jadi entitas HTML. Ini penting soalnya data mahasiswa bisa aja berisi teks yang mengandung tag HTML atau skrip jahat. Kalo gak di-escape, kode `<script>` bisa jalan di browser orang lain.

**Cara kerjanya:**
```js
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
```
Fungsi ini manfaatin DOM API: `createTextNode()` otomatis nge-escape karakter HTML, terus `innerHTML` ngembaliin teks yang udah aman.

### 8. Notifikasi Toast

Notifikasi muncul di atas layar pake animasi slide down, ada progress bar yang mengecil selama 3,5 detik, terus ilang. Bisa juga ditutup manual pake tombol X. Injeksi CSS notifikasi dilakukan sekali pake JavaScript (biar gak perlu nambahin CSS di file terpisah).

### 9. Docker Deployment

Ada `Dockerfile` yang pake **Nginx Alpine** — ukurannya kecil, cepet jalan. File statis (HTML, CSS, JS) di-copy ke `/usr/share/nginx/html`. Konfigurasi Nginx di `nginx.conf` udah diatur biar:
- Semua request diarahin ke `index.html` (penting buat SPA).
- File CSS/JS dikasih cache 1 tahun.
- Gzip diaktifin.
- Halaman 404 dikasih halaman khusus.
