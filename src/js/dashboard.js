// Data Mahasiswa (localStorage)
let dataMahasiswa = [];

let currentFilter = "all";
let searchKeyword = "";
let currentPage = 1;
const rowsPerPage = 5;
let filteredData = [];
let isLoading = false;
let allDataLoaded = false;

// DOM Elements
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
const tglSelect = document.getElementById("tgl");
const thnSelect = document.getElementById("thn");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const exportWordBtn = document.getElementById("exportWordBtn");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const loadingIndicator = document.getElementById("loadingIndicator");
const endMessage = document.getElementById("endMessage");

// Inisialisasi dropdown
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

function saveToLocalStorage() {
    localStorage.setItem("mahasiswaList", JSON.stringify(dataMahasiswa));
}

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

function addMahasiswa(mhs) {
    if (dataMahasiswa.some(m => m.nim === mhs.nim)) {
        alert("NIM sudah terdaftar!");
        return false;
    }
    dataMahasiswa.push(mhs);
    saveToLocalStorage();
    refreshData();
    return true;
}

function updateMahasiswa(nimLama, newData) {
    const idx = dataMahasiswa.findIndex(m => m.nim === nimLama);
    if (idx === -1) return false;
    if (newData.nim !== nimLama && dataMahasiswa.some(m => m.nim === newData.nim)) {
        alert("NIM baru sudah terdaftar!");
        return false;
    }
    dataMahasiswa[idx] = newData;
    saveToLocalStorage();
    refreshData();
    return true;
}

function deleteMahasiswa(nim) {
    if (confirm("Yakin hapus data mahasiswa ini?")) {
        dataMahasiswa = dataMahasiswa.filter(m => m.nim !== nim);
        saveToLocalStorage();
        refreshData();
    }
}

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

// helper untuk mencegah XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function loadMoreData() {
    if (isLoading || allDataLoaded || filteredData.length === 0) return;
    isLoading = true;
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    
    setTimeout(() => {
        const totalItems = filteredData.length;
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = filteredData.slice(start, end);
        
        if (pageData.length > 0) {
            appendRows(pageData);
            currentPage++;
        }
        if (end >= totalItems) {
            allDataLoaded = true;
            if (endMessage) endMessage.classList.remove('hidden');
        }
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        isLoading = false;
    }, 300);
}

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
    }
}

function initInfiniteScroll() {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const nearBottom = scrollTop + windowHeight >= docHeight - 300;
        if (nearBottom && !isLoading && !allDataLoaded && filteredData.length > 0) {
            loadMoreData();
        }
    });
}

function updateStatsCards() {
    if (!statsContainer) return;
    const total = dataMahasiswa.length;
    const laki = dataMahasiswa.filter(m => m.jk === "Laki-laki").length;
    const perempuan = dataMahasiswa.filter(m => m.jk === "Perempuan").length;
    const unique = new Set(dataMahasiswa.map(m => m.nim)).size;
    statsContainer.innerHTML = `
        <div class="bg-white rounded-xl shadow p-5 border"><p class="text-gray-500 text-sm">Total Mahasiswa</p><p class="text-3xl font-bold">${total}</p></div>
        <div class="bg-white rounded-xl shadow p-5 border"><p class="text-gray-500 text-sm">Laki-laki</p><p class="text-3xl font-bold">${laki}</p></div>
        <div class="bg-white rounded-xl shadow p-5 border"><p class="text-gray-500 text-sm">Perempuan</p><p class="text-3xl font-bold">${perempuan}</p></div>
        <div class="bg-white rounded-xl shadow p-5 border"><p class="text-gray-500 text-sm">Total NIM Unik</p><p class="text-3xl font-bold">${unique}</p></div>
    `;
}

function refreshData() {
    updateStatsCards();
    resetAndReload();
}

// Modal Handling
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

function openEditModal(nim) {
    const mhs = dataMahasiswa.find(m => m.nim === nim);
    if (!mhs) return;
    modalTitle.innerText = "Edit Mahasiswa";
    editNimHidden.value = nim;
    nimInput.value = mhs.nim;
    nimInput.disabled = true;
    namaInput.value = mhs.nama;
    alamatInput.value = mhs.alamat;
    if (mhs.jk === "Laki-laki") document.querySelector('input[name="jk"][value="Laki-laki"]').checked = true;
    else document.querySelector('input[name="jk"][value="Perempuan"]').checked = true;
    const parts = mhs.ttl.split(" ");
    if (parts.length === 3) {
        tglSelect.value = parts[0];
        const bulanMap = {Jan:"01",Feb:"02",Mar:"03",Apr:"04",Mei:"05",Jun:"06",Jul:"07",Ags:"08",Sep:"09",Okt:"10",Nov:"11",Des:"12"};
        const blnNum = bulanMap[parts[1]];
        if (blnNum) document.getElementById("bln").value = blnNum;
        thnSelect.value = parts[2];
    }
    passwordInput.value = mhs.password;
    modal.classList.remove("hidden");
}

function closeModal() {
    modal.classList.add("hidden");
}

// Event Listeners
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
            alert("Semua field harus diisi!");
            return;
        }
        const newData = { nim, nama, alamat, jk, ttl, password };
        if (editNim === "") {
            addMahasiswa(newData);
        } else {
            updateMahasiswa(editNim, newData);
        }
        closeModal();
    });
}

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchKeyword = e.target.value;
        resetAndReload();
    });
}

document.querySelectorAll(".tab-filter").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-filter").forEach(b => {
            b.classList.remove("bg-indigo-600", "text-white");
            b.classList.add("text-gray-600");
        });
        btn.classList.remove("text-gray-600");
        btn.classList.add("bg-indigo-600", "text-white");
        currentFilter = btn.dataset.filter;
        resetAndReload();
    });
});

if (exportExcelBtn) {
    exportExcelBtn.addEventListener("click", () => {
        const exportData = dataMahasiswa.map(m => ({
            NIM: m.nim, Nama: m.nama, Alamat: m.alamat, JK: m.jk, "Tanggal Lahir": m.ttl, Password: m.password
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Mahasiswa");
        XLSX.writeFile(wb, `Data_Mahasiswa_${new Date().toISOString().slice(0,19)}.xlsx`);
    });
}
if (exportWordBtn) {
    exportWordBtn.addEventListener("click", () => {
        let html = `<html><head><meta charset="UTF-8"><title>Data Mahasiswa</title><style>table,th,td{border:1px solid #aaa;border-collapse:collapse;padding:8px;}th{background:#f2f2f2;}</style></head><body><h2>Data Mahasiswa</h2><table><thead><tr><th>NIM</th><th>Nama</th><th>Alamat</th><th>JK</th><th>Tanggal Lahir</th><th>Password</th></tr></thead><tbody>`;
        dataMahasiswa.forEach(m => {
            html += `<tr><td>${escapeHtml(m.nim)}</td><td>${escapeHtml(m.nama)}</td><td>${escapeHtml(m.alamat)}</td><td>${escapeHtml(m.jk)}</td><td>${escapeHtml(m.ttl)}</td><td>${escapeHtml(m.password)}</td></tr>`;
        });
        html += `</tbody></table><p>Generated: ${new Date()}</p></body></html>`;
        const blob = new Blob([html], { type: "application/msword" });
        saveAs(blob, `Data_Mahasiswa_${new Date().toISOString().slice(0,19)}.doc`);
    });
}

if (openModalBtn) openModalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof window.loadPage === 'function') {
        window.loadPage('./src/pages/loginPages.html');
    }
});
if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// Inisialisasi
initDateDropdowns();
loadData();
initInfiniteScroll();

// Event delegation untuk edit/delete
document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
        const nim = e.target.getAttribute('data-nim');
        openEditModal(nim);
    }
    if (e.target.classList.contains('delete-btn')) {
        const nim = e.target.getAttribute('data-nim');
        deleteMahasiswa(nim);
    }
});