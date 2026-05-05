# 🎓 Sistem Informasi Mahasiswa

Aplikasi web **Sistem Informasi Mahasiswa** adalah platform sederhana untuk mengelola data mahasiswa. Dibangun dengan **HTML, Tailwind CSS, dan JavaScript murni (vanilla)**. Aplikasi ini memiliki halaman **Registrasi** untuk menambah mahasiswa baru, dan **Dashboard** untuk melihat, mencari, mengedit, menghapus, serta mengekspor data mahasiswa ke Excel/Word. Navbar-nya unik: **awalnya tersembunyi, lalu muncul seperti kaca bening (glassmorphism) saat kursor mendekati area atas layar atau ketika scroll ke atas**.

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|------------|
| **Registrasi Mahasiswa** | Form lengkap (NIM, nama, alamat, jenis kelamin, tanggal lahir, password) dengan validasi dan notifikasi sukses. Data langsung tersimpan di `localStorage`. |
| **Dashboard CRUD** | Tampilkan daftar mahasiswa, tambah, edit, hapus. Pencarian berdasarkan NIM/nama. Filter berdasarkan jenis kelamin. |
| **Ekspor Data** | Tombol **Export Excel** (file `.xlsx`) dan **Export Word** (file `.doc`) – semua data mahasiswa diekspor. |
| **Infinite Scroll** | Di halaman dashboard, data dimuat secara bertahap saat pengguna scroll ke bawah (tidak perlu tombol paginasi). |
| **Navbar Glassmorphism** | Navbar transparan seperti kaca, muncul saat kursor di area atas (≤100px) atau saat scroll ke atas. Setelah 1,5 detik tanpa interaksi, navbar menghilang kembali. |
| **Responsif** | Tampilan menyesuaikan layar HP, tablet, dan desktop. |
| **SPA Sederhana** | Navigasi antar halaman (Dashboard / Registrasi) terjadi tanpa reload – konten di‑fetch dan di‑inject ke halaman utama. |

## 🗂️ Struktur Folder



## ⚙️ Cara Menjalankan

-  **Pastikan Tailwind CSS sudah di‑compile**  
   Buka terminal di folder `PROJECT_UTS`, jalankan:
   ```bash
   npx @tailwindcss/cli -i ./src/style/input.css -o ./src/style/output.css --watch

Gunakan Live Server (misalnya ekstensi VS Code "Live Server")
Buka index.html dengan Live Server – aplikasi akan berjalan di http://localhost:5500.

Coba fitur

    - Klik menu Registrasi → isi data → Submit → data tersimpan.

    - Klik Dashboard → lihat semua mahasiswa, cari, filter, edit, hapus.

    - Scroll ke bawah → data tambahan dimuat otomatis (infinite scroll).

    - Gerakkan kursor ke pojok atas layar → navbar meluncur turun seperti kaca.




Penjelasan Penting dari Source Code
    Routing SPA tanpa reload (app.js)
    Menggunakan fetch() untuk mengambil file HTML halaman (DashboardPages.html atau loginPages.html).
    Hasil fetch dimasukkan ke <main id="main-content">, kemudian semua <script> di halaman tersebut dieksekusi ulang.
    Mengapa perlu dieksekusi ulang? Karena script yang dimuat secara dinamis tidak berjalan otomatis; kita harus membuat elemen <script> baru dan menambahkannya ke DOM.
    CSS dari halaman yang dimuat juga ditambahkan ke <head> agar styling ikut terbawa.

        // app.js (potongan)
    async function loadPage(url) {
        const res = await fetch(url);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        // ambil CSS dari head halaman target
        doc.head.querySelectorAll('link[rel="stylesheet"]').forEach(style => {
            if (!document.querySelector(`link[href="${style.href}"]`))
                document.head.appendChild(style.cloneNode());
        });
        contentDiv.innerHTML = doc.body.innerHTML;
        // Jalankan ulang script ...
    }

    Navbar glassmorphism dengan efek muncul/hilang (navbar.css & navbar.js)
    CSS : .navbar-scrolled diubah namanya menjadi .show-navbar. Saat kelas ini ada, transform: translateY(0) → navbar turun. Saat kelas tidak ada, transform: translateY(-150%) → tersembunyi di atas.
    Background: rgba(255,255,255,0.25) + backdrop-filter: blur(12px) menghasilkan efek kaca buram.
    Bentuk kapsul: border-radius: 9999px.
    JavaScript : showNavbar() menambah kelas show-navbar dan mengatur timer 1,5 detik untuk menghapusnya.
    Trigger muncul : mousemove dengan e.clientY <= 100 (kursor di area atas) atau scroll ke atas (window.scrollY < lastScrollY).

    Infinite Scroll di Dashboard (dashboard.js)
    Prinsip : Mengamati posisi scroll. Saat scrollTop + windowHeight >= document.documentElement.scrollHeight - 300, panggil loadMoreData().
    loadMoreData() mengambil data berikutnya dari filteredData (hasil filter/search) berdasarkan currentPage dan rowsPerPage, lalu menambahkan baris ke tabel dengan appendRows().
    Setelah semua data dimuat, tampilkan pesan "Semua data sudah ditampilkan".
    Keuntungan : Pengalaman pengguna lebih mulus, tidak perlu mengklik tombol paginasi.

    LocalStorage sebagai "database" sementara
    Data mahasiswa disimpan di localStorage dengan kunci mahasiswaList.
    Fungsi loadData() membaca dari localStorage; jika kosong, inisialisasi array kosong.
    Setiap operasi tambah, edit, hapus akan memanggil saveToLocalStorage().
    Catatan : Karena localStorage hanya bisa menyimpan string, kita gunakan JSON.stringify() dan JSON.parse().

    Ekspor Excel dan Word
    Excel : menggunakan library SheetJS (XLSX). Data diubah menjadi worksheet, lalu disimpan sebagai file .xlsx.
    Word : membuat string HTML berisi tabel, lalu disimpan sebagai blob dengan tipe application/msword. Menggunakan FileSaver.js untuk trigger download.
    Penting : Kedua library diambil dari CDN, jadi pastikan koneksi internet aktif.

    Keamanan sederhana (XSS prevention)
    Di dashboard.js ada fungsi escapeHtml() yang mengganti karakter <, >, & dengan entitas HTML. Ini mencegah pengguna jahat menyisipkan kode HTML/JavaScript melalui input (misalnya nama <script>alert('xss')</script>).

    Kesimpulan:
    Proyek ini menunjukkan bagaimana membangun web aplikasi fungsional yang modern, responsif, dan mudah dikelola hanya dengan HTML, CSS (Tailwind), dan JavaScript vanilla. Tanpa framework berat, namun fitur yang dihasilkan sudah cukup mumpuni untuk kebutuhan manajemen data sederhana.
    Jika ada pertanyaan lebih lanjut atau ingin mengembangkan fitur lain (misalnya autentikasi, koneksi ke backend), struktur kode ini sudah sangat siap untuk dikembangkan lebih lanjut.


