/*
  app.js — otak aplikasi (SPA router)
  
  Tugasnya:
  - Memuat halaman (Dashboard / Registrasi) ke dalam #main-content
  - Memuat komponen navbar
  - Mengatur navigasi antar halaman tanpa reload
*/

// Ambil file HTML dari server, lalu taruh isinya ke dalam elemen tertentu
async function loadComponent(url, targetId) {
    try {
        const response = await fetch(url + '?t=' + Date.now());
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        document.getElementById(targetId).innerHTML = html;
        return true;
    } catch (error) {
        console.error(`Gagal memuat ${url}:`, error);
        return false;
    }
}

// Hapus script lama yang tertinggal di <body>
// dan batalkan semua event listener dari halaman sebelumnya
function cleanupPageScripts() {
    document.querySelectorAll('script[data-page-script]').forEach(s => s.remove());
    if (window.__pageController) {
        window.__pageController.abort();
    }
    window.__pageController = null;
}

// Hapus CSS khusus halaman sebelumnya (yang ditandai data-page-css)
function cleanupPageCSS() {
    document.querySelectorAll('link[data-page-css]').forEach(el => el.remove());
}

// Fungsi utama: ganti halaman tanpa reload
async function loadPage(url) {
    const contentDiv = document.getElementById('main-content');
    contentDiv.style.opacity = '0';
    contentDiv.style.transition = 'opacity 0.2s ease';
    contentDiv.innerHTML = '<div style="text-align: center; padding: 5rem 0;"><div class="spinner" style="margin: 0 auto 1rem;"></div><p style="color: var(--gray-500);">Memuat...</p></div>';

    cleanupPageScripts();
    cleanupPageCSS();

    try {
        const response = await fetch(url + '?t=' + Date.now());
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Ambil CSS khusus halaman, tambahkan dengan tanda data-page-css
        // CSS global (styles.css, navbar.css) dari index.html tidak diutak-atik
        const globalCSS = ['styles.css', 'navbar.css'];
        doc.head.querySelectorAll('link[rel="stylesheet"]').forEach(style => {
            const href = style.getAttribute('href');
            if (globalCSS.some(c => href && href.includes(c))) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href + '?t=' + Date.now();
            link.setAttribute('data-page-css', '');
            document.head.appendChild(link);
        });

        contentDiv.innerHTML = doc.body.innerHTML;

        // Jalankan ulang semua script dari halaman yang dimuat
        contentDiv.querySelectorAll('script').forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src + '?t=' + Date.now();
                newScript.async = false;
            } else if (script.textContent) {
                newScript.textContent = script.textContent;
            }
            newScript.setAttribute('data-page-script', '');
            script.remove();
            document.body.appendChild(newScript);
        });

        // Fade in konten baru
        requestAnimationFrame(() => { contentDiv.style.opacity = '1'; });

        scrollToTop();
    } catch (error) {
        contentDiv.innerHTML = '<div style="text-align: center; color: var(--red-500); padding: 5rem 0;">Gagal memuat halaman.</div>';
        contentDiv.style.opacity = '1';
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
