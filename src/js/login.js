/*
  login.js — menangani form registrasi mahasiswa
  
  Tugasnya:
  - Isi otomatis dropdown tanggal (1-31) dan tahun (1970-sekarang)
  - Validasi form sebelum disimpan
  - Simpan data ke localStorage biar gak ilang pas refresh
  - Tampilkan notifikasi (toast) sukses/gagal
*/

// Isi dropdown <select> untuk tanggal (1-31) dan tahun (1970 - tahun sekarang)
function initDateSelects() {
    const tanggalSelect = document.getElementById('tanggal');
    const tahunSelect = document.getElementById('tahun');
    
    // Tambah opsi tanggal 1 sampai 31
    for (let i = 1; i <= 31; i++) {
        let option = document.createElement('option');
        option.value = i.toString().padStart(2, '0');
        option.textContent = i;
        tanggalSelect.appendChild(option);
    }
    
    // Tambah opsi tahun dari sekarang mundur sampai 1970
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1970; i--) {
        let option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        tahunSelect.appendChild(option);
    }
}

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
    const container = document.getElementById('notification');
    clearTimeout(Number(container.dataset.tid));
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

// Jalan tiap kali user klik tombol submit di form registrasi
// Ambil data dari form, validasi, simpan ke localStorage, kasih notifikasi
function handleSubmit(event) {
    event.preventDefault();
    
    // Kumpulin semua data dari form
    const nim = document.getElementById('nim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const alamat = document.getElementById('alamat').value.trim();
    const jk = document.querySelector('input[name="jk"]:checked').value;
    const tanggal = document.getElementById('tanggal').value;
    const bulan = document.getElementById('bulan').value;
    const tahun = document.getElementById('tahun').value;
    const password = document.getElementById('password').value.trim();
    
    // Validasi: pastikan gak ada yang kosong
    if (!nim || !nama || !alamat || !tanggal || !bulan || !tahun || !password) {
        showNotification('Semua bidang harus diisi!', false);
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
    
    // Ubah bulan dari angka (01-12) jadi teks (Jan-Des)
    const bulanMap = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun',
        '07': 'Jul', '08': 'Ags', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
    };
    const ttl = `${tanggal} ${bulanMap[bulan]} ${tahun}`;
    
    const dataMahasiswa = { nim, nama, alamat, jk, ttl, password };
    
    // Simpen ke localStorage biar datanya ada meskipun halaman di-refresh
    // Ambil data lama dulu, baru tambahin data baru, simpen lagi
    let allData = localStorage.getItem('mahasiswaList');
    allData = allData ? JSON.parse(allData) : [];
    if (allData.some(m => m.nim === nim)) {
        showNotification('NIM sudah terdaftar!', false);
        return;
    }
    allData.push(dataMahasiswa);
    localStorage.setItem('mahasiswaList', JSON.stringify(allData));
    
    showNotification(`Registrasi berhasil! Selamat datang, ${nama} (NIM: ${nim})`, true);
    
    // Reset form setelah submit
    document.getElementById('registerForm').reset();
    initDateSelects();
}

// Begitu script login.js dimuat, langsung jalanin:
// 1. Isi dropdown tanggal & tahun
// 2. Pasang event listener ke form buat nangkep submit
(function init() {
    const tanggalSelect = document.getElementById('tanggal');
    const tahunSelect = document.getElementById('tahun');
    const form = document.getElementById('registerForm');
    
    if (tanggalSelect && tahunSelect) {
        initDateSelects();
    }
    
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
})();
