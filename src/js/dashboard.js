/*
  dashboard.js — halaman utama dasbor data mahasiswa
  
  Tugasnya:
  - Menampilkan tabel data mahasiswa dari localStorage
  - Search & filter berdasarkan jenis kelamin
  - Pagination (5 data per halaman)
  - CRUD: Tambah, Edit, Hapus data mahasiswa lewat modal
  - Export ke Excel (XLSX) dan Word (DOCX)
  - Kartu statistik (total, laki-laki, perempuan, NIM unik)
  - Notifikasi toast tiap ada aksi
*/

// ------ VARIABEL GLOBAL ------

// Semua data mahasiswa disimpan di sini, diambil dari localStorage
let dataMahasiswa = [];

// Filter: "all" | "laki" | "perempuan"
let currentFilter = "all";
// Kata kunci pencarian (diketik di kolom search)
let searchKeyword = "";
// Halaman yang lagi aktif (pagination)
let currentPage = 1;
// Jumlah data per halaman
const rowsPerPage = 5;
// Data yang udah difilter + dicari (siap ditampilin)
let filteredData = [];
// Lagi loading atau nggak (biar gak dobel load)
let isLoading = false;
let allDataLoaded = false;

// Referensi ke elemen-elemen HTML yang sering dipake
const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const statsContainer = document.getElementById("statsCards");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const form = document.getElementById("mahasiswaForm");
const editNimHidden = document.getElementById("editNim");
const nimInput = document.getElementById("nim");
const namaInput = document.getElementById("nama");
const alamatInput = document.getElementById("alamat");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const tglSelect = document.getElementById("tgl");
const thnSelect = document.getElementById("thn");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const exportWordBtn = document.getElementById("exportWordBtn");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const loadingIndicator = document.getElementById("loadingIndicator");
const endMessage = document.getElementById("endMessage");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageIndicator = document.getElementById("pageIndicator");
const infoJumlah = document.getElementById("infoJumlah");
const dashboardNotification = document.getElementById("dashboardNotification");


// ------ FUNGSI-FUNGSI ------

// Isi dropdown tanggal (1-31) dan tahun (1970-sekarang) di modal
function initDateDropdowns() {
    for (let i = 1; i <= 31; i++) {
        let opt = document.createElement("option");
        opt.value = i.toString().padStart(2, "0");
        opt.textContent = i;
        tglSelect.appendChild(opt);
    }
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1970; i--) {
        let opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        thnSelect.appendChild(opt);
    }
}

// Simpen array dataMahasiswa ke localStorage biar awet
function saveToLocalStorage() {
    localStorage.setItem("mahasiswaList", JSON.stringify(dataMahasiswa));
}

// Ambil data dari localStorage. Kalo belum ada, bikin array kosong
function loadData() {
    const stored = localStorage.getItem("mahasiswaList");
    if (stored) {
        dataMahasiswa = JSON.parse(stored);
    } else {
        dataMahasiswa = [];
        saveToLocalStorage();
    }
    refreshData();
}

// Tambah data mahasiswa baru
// Kalo NIM udah ada, tolak dengan pesan error
function addMahasiswa(mhs) {
    if (dataMahasiswa.some(m => m.nim === mhs.nim)) {
        return { success: false, message: "NIM sudah terdaftar!" };
    }
    dataMahasiswa.push(mhs);
    saveToLocalStorage();
    refreshData();
    return { success: true, message: `Mahasiswa ${mhs.nama} berhasil ditambahkan!` };
}

// Update data mahasiswa yang udah ada (berdasarkan NIM lama)
// Kalo NIM-nya diganti dan udah ada yang punya, tolak
function updateMahasiswa(nimLama, newData) {
    const idx = dataMahasiswa.findIndex(m => m.nim === nimLama);
    if (idx === -1) return { success: false, message: "Data tidak ditemukan!" };
    if (newData.nim !== nimLama && dataMahasiswa.some(m => m.nim === newData.nim)) {
        return { success: false, message: "NIM baru sudah terdaftar!" };
    }
    dataMahasiswa[idx] = newData;
    saveToLocalStorage();
    refreshData();
    return { success: true, message: `Data ${newData.nama} berhasil diperbarui!` };
}

// Hapus data mahasiswa berdasarkan NIM, tanya dulu pake confirm()
function deleteMahasiswa(nim) {
    if (confirm("Yakin hapus data mahasiswa ini?")) {
        const namaMhs = dataMahasiswa.find(m => m.nim === nim)?.nama || 'Mahasiswa';
        dataMahasiswa = dataMahasiswa.filter(m => m.nim !== nim);
        saveToLocalStorage();
        refreshData();
        showNotification(`${namaMhs} berhasil dihapus!`, true);
    }
}

// Terapkan filter (all/laki-laki/perempuan) dan keyword pencarian
// Hasilnya disimpan di variable filteredData (global)
function applyFilterAndSearch() {
    let result = [...dataMahasiswa];
    if (currentFilter === "laki") result = result.filter(m => m.jk === "Laki-laki");
    else if (currentFilter === "perempuan") result = result.filter(m => m.jk === "Perempuan");
    if (searchKeyword.trim() !== "") {
        const kw = searchKeyword.toLowerCase();
        result = result.filter(m => m.nim.toLowerCase().includes(kw) || m.nama.toLowerCase().includes(kw));
    }
    return result;
}

// Tempelin baris-baris tabel (dari array rows) ke dalam <tbody>
// Data dilewatin fungsi escapeHtml() biar aman dari XSS
function appendRows(rows) {
    let html = "";
    rows.forEach(m => {
        html += `<tr class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">${escapeHtml(m.nim)}</td>
            <td class="px-6 py-4 text-sm text-gray-600">${escapeHtml(m.nama)}</td>
            <td class="px-6 py-4 text-sm text-gray-600">${escapeHtml(m.alamat)}</td>
            <td class="px-6 py-4 text-sm text-center">${escapeHtml(m.jk)}</td>
            <td class="px-6 py-4 text-sm text-center">${escapeHtml(m.ttl)}</td>
            <td class="px-6 py-4 text-center space-x-2">
                <button class="edit-btn text-indigo-600 hover:text-indigo-800 text-sm" data-nim="${escapeHtml(m.nim)}">Edit</button>
                <button class="delete-btn text-red-600 hover:text-red-800 text-sm" data-nim="${escapeHtml(m.nim)}">Hapus</button>
            </td>
        </tr>`;
    });
    tableBody.insertAdjacentHTML('beforeend', html);
}

// Ambil data halaman tertentu dari filteredData, terus tampilin di tabel
// Pake setTimeout 300ms biar ada efek loading (simulasi)
function loadMoreData() {
    if (isLoading || filteredData.length === 0) return;
    isLoading = true;
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    
    setTimeout(() => {
        const totalItems = filteredData.length;
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = filteredData.slice(start, end);
        
        if (tableBody) tableBody.innerHTML = '';
        if (pageData.length > 0) {
            appendRows(pageData);
        } else {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-gray-400">Tidak ada data</td></tr>';
        }
        
        updatePaginationInfo();
        
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        isLoading = false;
    }, 300);
}

// Update teks info jumlah data, indikator halaman, dan aktif/nonaktif tombol prev/next
function updatePaginationInfo() {
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    
    if (infoJumlah) {
        if (totalItems === 0) {
            infoJumlah.textContent = 'Tidak ada data';
        } else {
            const start = (currentPage - 1) * rowsPerPage + 1;
            const end = Math.min(currentPage * rowsPerPage, totalItems);
            infoJumlah.textContent = `Menampilkan ${start} sampai ${end} dari ${totalItems} data`;
        }
    }
    
    if (pageIndicator) {
        pageIndicator.textContent = `Halaman ${currentPage} dari ${totalPages || 1}`;
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 1;
    }
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages || totalItems === 0;
    }
}

// Pindah ke halaman sebelumnya
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadMoreData();
    }
}

// Pindah ke halaman berikutnya
function nextPage() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        loadMoreData();
    }
}

// Reset halaman ke 1, terus muat ulang data (dengan filter & search terbaru)
function resetAndReload() {
    if (tableBody) tableBody.innerHTML = '';
    currentPage = 1;
    allDataLoaded = false;
    if (endMessage) endMessage.classList.add('hidden');
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    filteredData = applyFilterAndSearch();
    if (filteredData.length > 0) {
        loadMoreData();
    } else {
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-10 text-gray-400">Tidak ada data</td></tr>';
        updatePaginationInfo();
    }
}

// Update 4 kartu statistik di atas tabel (total, laki-laki, perempuan, NIM unik)
function updateStatsCards() {
    if (!statsContainer) return;
    const total = dataMahasiswa.length;
    const laki = dataMahasiswa.filter(m => m.jk === "Laki-laki").length;
    const perempuan = dataMahasiswa.filter(m => m.jk === "Perempuan").length;
    const unique = new Set(dataMahasiswa.map(m => m.nim)).size;
    statsContainer.innerHTML = `
        <div class="bg-white rounded-xl shadow p-5 border"><p class="text-gray-500 text-sm">Total Mahasiswa</p><p class="text-3xl font-bold" style="text-align: center;">${total}</p></div>
        <div class="bg-white rounded-xl shadow p-5 border"><p class="text-gray-500 text-sm">Laki-laki</p><p class="text-3xl font-bold" style="text-align: center;">${laki}</p></div>
        <div class="bg-white rounded-xl shadow p-5 border"><p class="text-gray-500 text-sm">Perempuan</p><p class="text-3xl font-bold" style="text-align: center;">${perempuan}</p></div>
        <div class="bg-white rounded-xl shadow p-5 border"><p class="text-gray-500 text-sm">Total NIM Unik</p><p class="text-3xl font-bold" style="text-align: center;">${unique}</p></div>
    `;
}

// Refresh semuanya: kartu statistik + tabel
function refreshData() {
    updateStatsCards();
    resetAndReload();
}


// ------ MODAL (TAMBAH / EDIT DATA) ------

// Buka modal untuk nambah data mahasiswa baru
function openAddModal() {
    modalTitle.innerText = "Tambah Mahasiswa";
    editNimHidden.value = "";
    nimInput.disabled = false;
    form.reset();
    document.querySelector('input[name="jk"][value="Laki-laki"]').checked = true;
    tglSelect.value = "01";
    document.getElementById("bln").value = "01";
    thnSelect.value = new Date().getFullYear();
    modal.classList.remove("hidden");
}

// Buka modal untuk edit data mahasiswa (isi form dengan data lama)
function openEditModal(nim) {
    const mhs = dataMahasiswa.find(m => m.nim === nim);
    if (!mhs) return;
    modalTitle.innerText ="Edit Mahasiswa";
    editNimHidden.value = nim;
    nimInput.value = mhs.nim;
    nimInput.disabled = true;
    namaInput.value = mhs.nama;
    alamatInput.value = mhs.alamat;
    if (mhs.jk === "Laki-laki") document.querySelector('input[name="jk"][value="Laki-laki"]').checked = true;
    else document.querySelector('input[name="jk"][value="Perempuan"]').checked = true;
    const parts = mhs.ttl.split(" ");
    if (parts.length === 3) {
        if (tglSelect.querySelector(`option[value="${escapeHtml(parts[0])}"]`)) {
            tglSelect.value = parts[0];
        }
        const bulanMap = {Jan:"01",Feb:"02",Mar:"03",Apr:"04",Mei:"05",Jun:"06",Jul:"07",Ags:"08",Sep:"09",Okt:"10",Nov:"11",Des:"12"};
        const blnNum = bulanMap[parts[1]];
        if (blnNum) document.getElementById("bln").value = blnNum;
        if (thnSelect.querySelector(`option[value="${escapeHtml(parts[2])}"]`)) {
            thnSelect.value = parts[2];
        }
    }
    passwordInput.value = mhs.password;
    modal.classList.remove("hidden");
}

// Tutup modal
function closeModal() {
    modal.classList.add("hidden");
}


// ------ NOTIFIKASI (TOAST) ------

// Inject CSS toast sekali
(function injectToastCSS() {
    if (document.getElementById('toast-css')) return;
    const style = document.createElement('style');
    style.id = 'toast-css';
    style.textContent = `
        .t-visible { transform: translateY(-120%); opacity: 0; }
        .t-enter { animation: tSlideDown 0.45s cubic-bezier(0.16,1,0.3,1) forwards; }
        .t-exit { animation: tSlideUp 0.3s ease-in forwards; }
        .t-progress { animation: tShrink 3.5s linear forwards; }
        .t-enter > * { pointer-events: auto; }
        .t-exit > * { pointer-events: none; }
        @keyframes tSlideDown { from { transform: translateY(-120%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes tSlideUp { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-120%); opacity: 0; } }
        @keyframes tShrink { from { width: 100%; } to { width: 0%; } }
    `;
    document.head.appendChild(style);
})();

function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function showNotification(message, isSuccess = true) {
    const container = document.getElementById('dashboardNotification');
    const accentColor = isSuccess ? 'border-l-emerald-500' : 'border-l-red-500';
    const progressColor = isSuccess ? 'bg-emerald-500' : 'bg-red-500';

    container.innerHTML = `
        <div class="flex items-start gap-3.5 bg-white ${accentColor} border-l-4 p-4 rounded-xl shadow-lg backdrop-blur-md min-w-85 max-w-100 w-fit mx-auto t-visible">
            <div class="flex-1 min-w-0 pt-0.5">
                <p class="text-sm font-semibold text-gray-800 leading-snug">${escapeHtml(message)}</p>
                <div class="mt-2.5 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div class="h-full ${progressColor} rounded-full t-progress" style="width:100%"></div>
                </div>
            </div>
            <button class="text-gray-300 hover:text-gray-500 transition shrink-0 p-0.5 t-close">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `;

    clearTimeout(Number(container.dataset.tid));
    container.classList.remove('hidden');
    const toast = container.firstElementChild;

    requestAnimationFrame(() => toast.classList.add('t-enter'));

    const closeBtn = toast.querySelector('.t-close');
    const timeout = setTimeout(() => dismissToast(container), 3500);
    container.dataset.tid = timeout;
    closeBtn.addEventListener('click', () => {
        clearTimeout(Number(container.dataset.tid));
        dismissToast(container);
    });
}

function dismissToast(container) {
    const toast = container.firstElementChild;
    if (!toast) return;
    toast.classList.remove('t-enter');
    toast.classList.add('t-exit');
    setTimeout(() => {
        container.classList.add('hidden');
        container.innerHTML = '';
    }, 300);
}


// ------ EVENT LISTENERS ------

// Submit form di modal (tambah / edit)
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const editNim = editNimHidden.value;
        const nim = nimInput.value.trim();
        const nama = namaInput.value.trim();
        const alamat = alamatInput.value.trim();
        const jk = document.querySelector('input[name="jk"]:checked').value;
        const tgl = tglSelect.value;
        const blnVal = document.getElementById("bln").value;
        const thn = thnSelect.value;
        const bulanNama = {"01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"Mei","06":"Jun","07":"Jul","08":"Ags","09":"Sep","10":"Okt","11":"Nov","12":"Des"};
        const ttl = `${tgl} ${bulanNama[blnVal]} ${thn}`;
        const password = passwordInput.value;
        if (!nim || !nama || !alamat || !password) {
            showNotification('Semua field harus diisi!', false);
            return;
        }
        if (password.length < 6) {
            showNotification('Password minimal 6 karakter!', false);
            return;
        }
        if (!/^\d{8,}$/.test(nim)) {
            showNotification('NIM harus berupa angka minimal 8 digit!', false);
            return;
        }
        const newData = { nim, nama, alamat, jk, ttl, password };
        let result;
        if (editNim === "") {
            result = addMahasiswa(newData);
        } else {
            result = updateMahasiswa(editNim, newData);
        }
        if (result.success) {
            showNotification(result.message, true);
            closeModal();
        } else {
            showNotification(result.message, false);
        }
    });
}

// Kolom pencarian: setiap kali user ngetik, filter & reload tabel
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchKeyword = e.target.value;
        resetAndReload();
    });
}

// Tombol filter (Semua / Laki-laki / Perempuan)
document.querySelectorAll(".tab-filter").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-filter").forEach(b => {
            b.classList.remove("tab-filter-active");
        });
        btn.classList.add("tab-filter-active");
        currentFilter = btn.dataset.filter;
        resetAndReload();
    });
});

// Tombol export Excel: bikin file .xlsx dari data mahasiswa pake SheetJS (XLSX)
if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", () => {
        try {
            if (typeof XLSX === 'undefined') {
                showNotification("Library XLSX belum siap. Silakan coba beberapa detik lagi.", false);
                return;
            }
            if (dataMahasiswa.length === 0) {
                showNotification("Tidak ada data untuk diekspor!", false);
                return;
            }
            const exportData = dataMahasiswa.map(m => ({
                NIM: m.nim, Nama: m.nama, Alamat: m.alamat, JK: m.jk, "Tanggal Lahir": m.ttl, Password: m.password
            }));
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Mahasiswa");
            const filename = `Data_Mahasiswa_${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}_${String(new Date().getHours()).padStart(2,'0')}${String(new Date().getMinutes()).padStart(2,'0')}${String(new Date().getSeconds()).padStart(2,'0')}.xlsx`;
            XLSX.writeFile(wb, filename);
            showNotification("Ekspor Excel berhasil!", true);
        } catch (error) {
            showNotification("Gagal mengekspor Excel: " + error.message, false);
            console.error(error);
        }
    });
}

// Tombol export Word: bikin file .docx dari data mahasiswa pake Blob + FileSaver
// Isinya HTML yang ditulis manual, dibungkus sebagai document Word
if (exportWordBtn) {
    exportWordBtn.addEventListener("click", () => {
        try {
            if (typeof saveAs === 'undefined') {
                showNotification("Library FileSaver belum siap. Silakan coba beberapa detik lagi.", false);
                return;
            }
            if (dataMahasiswa.length === 0) {
                showNotification("Tidak ada data untuk diekspor!", false);
                return;
            }
            let html = `<html><head><meta charset="UTF-8"><title>Data Mahasiswa</title><style>body{font-family:Arial,sans-serif;margin:20px;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #000;padding:10px;text-align:left;}th{background-color:#d3d3d3;font-weight:bold;}h2{color:#333;}</style></head><body><h2>Data Daftar Mahasiswa</h2><table><thead><tr><th>NIM</th><th>Nama</th><th>Alamat</th><th>JK</th><th>Tanggal Lahir</th><th>Password</th></tr></thead><tbody>`;
            dataMahasiswa.forEach(m => {
                html += `<tr><td>${escapeHtml(m.nim)}</td><td>${escapeHtml(m.nama)}</td><td>${escapeHtml(m.alamat)}</td><td>${escapeHtml(m.jk)}</td><td>${escapeHtml(m.ttl)}</td><td>${escapeHtml(m.password)}</td></tr>`;
            });
            html += `</tbody></table><p style="margin-top:20px;color:#666;font-size:12px;">Generated: ${new Date().toLocaleString()}</p></body></html>`;
            const blob = new Blob([html], { type: "application/msword" });
            const filename = `Data_Mahasiswa_${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}_${String(new Date().getHours()).padStart(2,'0')}${String(new Date().getMinutes()).padStart(2,'0')}${String(new Date().getSeconds()).padStart(2,'0')}.docx`;
            saveAs(blob, filename);
            showNotification("Ekspor Word berhasil!", true);
        } catch (error) {
            showNotification("Gagal mengekspor Word: " + error.message, false);
            console.error(error);
        }
    });
}

// Toggle show/hide password di modal edit
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePasswordBtn.innerHTML = isPassword
            ? `<svg xmlns="http://www.w3.org/2000/svg" class="icon-eye" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" class="icon-eye" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>`;
    });
}

// Tombol "Tambah Mahasiswa" di header dashboard: navigasi ke halaman registrasi
// Pake SPA router (window.loadPage) biar gak reload
if (openModalBtn) openModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof window.loadPage === 'function') {
        window.loadPage('./src/pages/loginPages.html');
    }
});

if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);


// Tombol pagination (Sebelumnya / Selanjutnya)
if (prevPageBtn) {
    prevPageBtn.addEventListener("click", prevPage);
}
if (nextPageBtn) {
    nextPageBtn.addEventListener("click", nextPage);
}


// ------ INISIALISASI ------

// Isi dropdown tanggal & tahun di modal
initDateDropdowns();
// Ambil data dari localStorage, refresh tampilan
loadData();


// AbortController agar listener tidak menumpuk saat navigasi
const controller = new AbortController();
window.__pageController = controller;
const signal = controller.signal;

// Klik di luar modal → tutup modal
window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); }, { signal });

// DELEGASI EVENT: nangkep klik tombol Edit & Hapus di tabel
document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const nim = e.target.getAttribute('data-nim');
        openEditModal(nim);
    }
    if (e.target.classList.contains('delete-btn')) {
        const nim = e.target.getAttribute('data-nim');
        deleteMahasiswa(nim);
    }
}, { signal });
