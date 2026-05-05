// login.js - Handle form registrasi dengan notifikasi

// Isi dropdown tanggal dan tahun otomatis
function initDateSelects() {
    const tanggalSelect = document.getElementById('tanggal');
    const tahunSelect = document.getElementById('tahun');
    
    // Tanggal 1-31
    for (let i = 1; i <= 31; i++) {
        let option = document.createElement('option');
        option.value = i.toString().padStart(2, '0');
        option.textContent = i;
        tanggalSelect.appendChild(option);
    }
    
    // Tahun 1970 - sekarang
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1970; i--) {
        let option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        tahunSelect.appendChild(option);
    }
}

// Fungsi untuk menampilkan notifikasi (toast)
function showNotification(message, isSuccess = true) {
    const notifDiv = document.getElementById('notification');
    notifDiv.textContent = message;
    notifDiv.className = `mt-6 text-center text-sm p-3 rounded-lg ${
        isSuccess ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
    }`;
    notifDiv.classList.remove('hidden');
    
    // Sembunyikan setelah 4 detik
    setTimeout(() => {
        notifDiv.classList.add('hidden');
    }, 4000);
}

// Handle submit form
function handleSubmit(event) {
    event.preventDefault();
    
    // Ambil nilai dari form
    const nim = document.getElementById('nim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const alamat = document.getElementById('alamat').value.trim();
    const jk = document.querySelector('input[name="jk"]:checked').value;
    const tanggal = document.getElementById('tanggal').value;
    const bulan = document.getElementById('bulan').value;
    const tahun = document.getElementById('tahun').value;
    const password = document.getElementById('password').value;
    
    // Validasi sederhana
    if (!nim || !nama || !alamat || !tanggal || !bulan || !tahun || !password) {
        showNotification('Semua bidang harus diisi!', false);
        return;
    }
    if (password.length < 6) {
        showNotification('Password minimal 6 karakter!', false);
        return;
    }
    if (isNaN(nim) || nim.length < 8) {
        showNotification('NIM harus berupa angka minimal 8 digit!', false);
        return;
    }
    
    // Format tanggal lahir (contoh: 01 Jan 2000)
    const bulanMap = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun',
        '07': 'Jul', '08': 'Ags', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
    };
    const ttl = `${tanggal} ${bulanMap[bulan]} ${tahun}`;
    
    // Data mahasiswa
    const dataMahasiswa = { nim, nama, alamat, jk, ttl, password };
    
    // Simpan ke localStorage (opsional) atau tampilkan di console
    console.log('Data berhasil disubmit:', dataMahasiswa);
    
    // Simpan ke localStorage (agar data tidak hilang saat refresh)
    let allData = localStorage.getItem('mahasiswaList');
    allData = allData ? JSON.parse(allData) : [];
    allData.push(dataMahasiswa);
    localStorage.setItem('mahasiswaList', JSON.stringify(allData));
    
    // Tampilkan notifikasi sukses
    showNotification(`Registrasi berhasil! Selamat datang, ${nama} (NIM: ${nim})`, true);
    
    // Reset form (opsional, komentar jika tidak ingin direset)
    // document.getElementById('registerForm').reset();
    // Reset dropdown tanggal ke default
    document.getElementById('tanggal').value = '';
    document.getElementById('bulan').value = '';
    document.getElementById('tahun').value = '';
}

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    initDateSelects();
    const form = document.getElementById('registerForm');
    if (form) form.addEventListener('submit', handleSubmit);
});