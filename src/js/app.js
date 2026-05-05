// ===================== app.js =====================
// Fungsi: memuat file HTML ke dalam elemen target
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

// Fungsi: memuat halaman (dashboard atau login) ke main-content
async function loadPage(url) {
    const contentDiv = document.getElementById('main-content');
    contentDiv.innerHTML = '<div class="text-center text-gray-500 py-20">Memuat...</div>';
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Load CSS dari head
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
        
        // Insert body content
        contentDiv.innerHTML = doc.body.innerHTML;

        // Jalankan script dari halaman yang dimuat
        const scripts = contentDiv.querySelectorAll('script');
        for (let script of scripts) {
            if (script.src) {
                // External script
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.async = false;
                script.remove();
                document.body.appendChild(newScript);
            } else if (script.textContent) {
                // Inline scripts
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                script.remove();
                document.body.appendChild(newScript);
            }
        }
        
        // Scroll ke atas setelah halaman dimuat
        scrollToTop();
    } catch (error) {
        contentDiv.innerHTML = '<div class="text-center text-red-500 py-20">Gagal memuat halaman.</div>';
        console.error(error);
    }
}

// Expose loadPage ke global scope untuk akses dari component scripts
window.loadPage = loadPage;

// Fungsi untuk scroll ke atas
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Fungsi: menunggu elemen muncul (untuk event listener)
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

// Inisialisasi aplikasi
async function initApp() {
    // 1. Muat navbar ke container
    await loadComponent('./src/components/navbarComponents.html', 'navbar-container');

    // 2. Setelah navbar terpasang, muat script navbar.js
    const navbarScript = document.createElement('script');
    navbarScript.src = './src/js/navbar.js';
    document.body.appendChild(navbarScript);

    // 3. Pasang event listener ke menu (Dashboard & Registrasi)
    waitForElement('nav-dashboard', (link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadPage('./src/pages/DashboardPages.html');
            // Close mobile menu
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
            // Close mobile menu
            const menu = document.getElementById('menu');
            if (menu && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
            }
        });
    });

    // 4. Muat halaman default: Dashboard
    loadPage('./src/pages/DashboardPages.html');
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', initApp);