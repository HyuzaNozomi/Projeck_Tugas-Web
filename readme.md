# Sistem Informasi Mahasiswa

Aplikasi web **Sistem Informasi Mahasiswa** adalah platform sederhana untuk mengelola data mahasiswa. Dibangun dengan **HTML, Tailwind CSS, dan JavaScript murni (vanilla)**.

Aplikasi ini memiliki halaman **Registrasi** untuk menambah mahasiswa baru, dan **Dashboard** untuk melihat, mencari, mengedit, menghapus, serta mengekspor data mahasiswa ke Excel/Word. Navbar-nya unik: **awalnya tersembunyi, lalu muncul seperti kaca bening (glassmorphism) saat kursor mendekati area atas layar atau ketika scroll ke atas**.

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Registrasi Mahasiswa** | Form lengkap (NIM, nama, alamat, jenis kelamin, tanggal lahir, password) dengan validasi client-side. Data tersimpan di `localStorage`. |
| **Dashboard CRUD** | Tampilkan daftar mahasiswa, tambah (via modal), edit (via modal dengan data terisi), hapus (dengan konfirmasi). |
| **Pencarian & Filter** | Cari berdasarkan NIM/nama secara real-time. Filter berdasarkan jenis kelamin (Laki-laki/Perempuan). |
| **Pagination** | Data ditampilkan per halaman (5 baris) dengan tombol Sebelumnya/Berikutnya. |
| **Kartu Statistik** | 4 kartu ringkasan: Total Mahasiswa, Laki-laki, Perempuan, Total NIM Unik. |
| **Ekspor Excel** | Export semua data ke file `.xlsx` menggunakan SheetJS (XLSX). |
| **Ekspor Word** | Export semua data ke file `.docx` menggunakan FileSaver.js. |
| **Navbar Glassmorphism** | Navbar transparan seperti kaca, muncul saat kursor di area atas (<=100px) atau saat scroll ke atas. Otomatis sembunyi setelah 1,5 detik. |
| **Notifikasi Toast** | Popup notifikasi sukses/gagal dengan animasi bounce dan fade-out. |
| **Responsif** | Tampilan menyesuaikan layar HP, tablet, dan desktop. |
| **SPA Sederhana** | Navigasi antar halaman tanpa reload - konten di-fetch dan di-inject ke halaman utama. |
| **XSS Prevention** | Fungsi `escapeHtml()` untuk sanitasi output data di tabel. |

## Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| HTML5 | Struktur halaman |
| Tailwind CSS v4.2.4 | Utility-first CSS framework |
| JavaScript ES6+ | Vanilla JS, tanpa framework |
| SheetJS (XLSX) | Library export Excel dari CDN |
| FileSaver.js | Library download file dari CDN |
| localStorage | Penyimpanan data client-side |

## Struktur Folder

```
project_UTS/
├── index.html                       # Entry point SPA
├── package.json                     # Dependencies npm (Tailwind CSS)
├── readme.md
├── src/
│   ├── components/
│   │   └── navbarComponents.html    # Komponen navbar glassmorphism
│   ├── pages/
│   │   ├── DashboardPages.html      # Halaman dashboard (CRUD, tabel, export)
│   │   └── loginPages.html          # Halaman registrasi mahasiswa
│   ├── js/
│   │   ├── app.js                   # Router SPA, loader halaman
│   │   ├── dashboard.js             # Logic CRUD, search, filter, pagination, export
│   │   ├── login.js                 # Handler form registrasi, validasi
│   │   └── navbar.js                # Logic show/hide navbar
│   └── style/
│       ├── input.css                # Entry Tailwind CSS v4
│       ├── output.css               # Compiled Tailwind CSS
│       ├── navbar.css               # Styling glassmorphism navbar
│       ├── login.css                # Styling form registrasi
│       └── dashboard.css            # Styling dashboard
```

## Cara Menjalankan

1. **Compile Tailwind CSS** (jika ada perubahan):
   ```bash
   npx @tailwindcss/cli -i ./src/style/input.css -o ./src/style/output.css --watch
   ```

2. **Jalankan dengan Live Server** (misal ekstensi VS Code "Live Server"):
   - Buka `index.html` dengan Live Server
   - Aplikasi akan berjalan di `http://localhost:5500`

3. **Coba fitur**:
   - Klik menu **Registrasi** → isi data → Submit
   - Klik **Dashboard** → lihat semua mahasiswa, cari, filter, edit, hapus
   - Klik **Export Excel** atau **Export Word** untuk mengekspor data
   - Gerakkan kursor ke pojok atas layar → navbar meluncur turun

## Cara Kerja Source Code

### Routing SPA (app.js)
- `loadPage(url)` mengambil file HTML halaman dengan `fetch()`, lalu memasukkan konten ke `<main id="main-content">`.
- CSS dari halaman target ditambahkan ke `<head>`.
- Semua `<script>` (eksternal maupun inline) dieksekusi ulang dengan membuat elemen `<script>` baru.

### Navbar Glassmorphism (navbar.css & navbar.js)
- Navbar tersembunyi secara default (`transform: translateY(-150%)`).
- Kelas `.show-navbar` mengubahnya menjadi `translateY(0)`.
- Background semi-transparan + `backdrop-filter: blur(12px)` menciptakan efek kaca.
- Muncul saat: kursor di area atas (<=100px) ATAU scroll ke atas.
- Timer 1,5 detik untuk otomatis menghilang.

### LocalStorage
- Data mahasiswa disimpan di `localStorage` dengan kunci `mahasiswaList`.
- Setiap operasi (tambah, edit, hapus) langsung memanggil `saveToLocalStorage()`.
- Data berupa JSON: `{ nim, nama, alamat, jk, ttl, password }`.

### Ekspor Excel & Word
- **Excel**: SheetJS (XLSX) mengubah array data menjadi worksheet, lalu ditulis sebagai file `.xlsx`.
- **Word**: String HTML berisi tabel, disimpan sebagai blob dengan tipe `application/msword`, di-download via FileSaver.js.

### Keamanan (XSS Prevention)
- Fungsi `escapeHtml()` di `dashboard.js` mengganti karakter `<`, `>`, `&` dengan entitas HTML untuk mencegah injeksi kode melalui input pengguna.
