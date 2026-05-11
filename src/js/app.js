/*
  app.js — otak aplikasi (SPA router)
  
  Tugasnya:
  - Memuat halaman (Dashboard / Registrasi) ke dalam #main-content
  - Memuat komponen navbar
  - Mengatur navigasi antar halaman tanpa reload
*/

// Ambil file HTML dari server, lalu taruh isinya ke dalam elemen tertentu
// Contoh: loadComponent('navbar.html', 'navbar-container') -> isi navbar-container dengan navbar.html
async function loadComponent(url, targetId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        document.getElementById(targetId).innerHTML = html;
        return true;
    } catch (error) {
        console.error(`Gagal memuat ${url}:`, error);
        return false;
    }
}

// Sebelum ganti halaman, hapus dulu script-script lama yang tertinggal di <body>
// Biar gak numpuk dan bentrok ama script baru
function cleanupPageScripts() {
    document.querySelectorAll('script[data-page-script]').forEach(s => s.remove());
}

// Fungsi utama: ganti halaman (Dashboard atau Registrasi) tanpa reload
// Cara kerja:
// 1. Fetch file HTML dari server
// 2. Ambil CSS-nya, tambahin ke <head> kalo belum ada
// 3. Isi #main-content dengan HTML body-nya
// 4. Jalankan ulang semua <script> biar event listener-nya kepasang
async function loadPage(url) {
    const contentDiv = document.getElementById('main-content');
    contentDiv.innerHTML = '<div class="text-center text-gray-500 py-20">Memuat...</div>';
    cleanupPageScripts();
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Ambil semua CSS dari halaman target, tambahin ke <head> kalo belom ada
        const styles = doc.head.querySelectorAll('link[rel="stylesheet"]');
        styles.forEach(style => {
            const href = style.href;
            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
            }
        });
        
        // Isi #main-content dengan HTML dari halaman yang dimuat
        contentDiv.innerHTML = doc.body.innerHTML;

        // Jalankan ulang semua script (eksternal maupun inline)
        // Script yang dimasukin lewat innerHTML gak otomatis jalan,
        // jadi kita bikin elemen <script> baru trus ditambahin ke <body>
        const scripts = contentDiv.querySelectorAll('script');
        for (let script of scripts) {
            if (script.src) {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.async = false;
                newScript.setAttribute('data-page-script', '');
                script.remove();
                document.body.appendChild(newScript);
            } else if (script.textContent) {
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                newScript.setAttribute('data-page-script', '');
                script.remove();
                document.body.appendChild(newScript);
            }
        }
        
        scrollToTop();
    } catch (error) {
        contentDiv.innerHTML = '<div class="text-center text-red-500 py-20">Gagal memuat halaman.</div>';
        console.error(error);
    }
}

// Biar fungsi loadPage bisa dipanggil dari file JS lain
window.loadPage = loadPage;

// Gulir halaman ke atas dengan efek smooth
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Nunggu elemen muncul di DOM, baru jalanin callback
// Dipake buat nge-pasang event listener ke link navbar
// yang dimuat secara asinkron (belum tentu ada pas script jalan)
function waitForElement(id, callback, timeout = 5000) {
    const start = Date.now();
    const interval = setInterval(() => {
        const el = document.getElementById(id);
        if (el) {
            clearInterval(interval);
            callback(el);
        } else if (Date.now() - start > timeout) {
            clearInterval(interval);
            console.warn(`Timeout menunggu #${id}`);
        }
    }, 50);
}

// Persiapan awal aplikasi: muat navbar, pasang event ke menu, buka Dashboard
async function initApp() {
    // 1. Muat dulu navbar-nya ke #navbar-container
    await loadComponent('./src/components/navbarComponents.html', 'navbar-container');

    // 2. Baru load script navbar-nya (biar DOM navbar udah siap)
    const navbarScript = document.createElement('script');
    navbarScript.src = './src/js/navbar.js';
    document.body.appendChild(navbarScript);

    // 3. Pasang event listener ke menu Dashboard sama Registrasi
    // Pake waitForElement soalnya link-nya dimuat async
    waitForElement('nav-dashboard', (link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage('./src/pages/DashboardPages.html');
            const menu = document.getElementById('menu');
            if (menu && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
            }
        });
    });
    waitForElement('nav-login', (link) => { 
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage('./src/pages/loginPages.html');
            const menu = document.getElementById('menu');
            if (menu && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
            }
        });
    });

    // 4. Buka halaman Dashboard sebagai halaman pertama
    loadPage('./src/pages/DashboardPages.html');
}

// Jalankan initApp setelah DOM siap
document.addEventListener('DOMContentLoaded', initApp);
