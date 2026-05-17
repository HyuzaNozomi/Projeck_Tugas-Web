/*
  navbar.js — mengontrol tampilan navbar (muncul/sembunyi)
  
  Cara kerjanya:
  - Navbar selalu keliatan di posisi paling atas (scrollY < 50)
  - Navbar otomatis muncul saat mouse masuk 100px dari atas layar
  - Atau saat user scroll ke atas
  - Navbar gak bakal sembunyi kalo menu mobile lagi kebuka
  - Efeknya pake CSS transition (glassmorphism)
*/

const navbar = document.getElementById('navbar');
let hideTimeout;

function isMobileMenuOpen() {
    const menu = document.getElementById('menu');
    return menu && menu.classList.contains('open');
}

function scheduleHide() {
    clearTimeout(hideTimeout);
    if (isMobileMenuOpen()) return;
    hideTimeout = setTimeout(() => {
        if (window.scrollY < 50) return;
        if (isMobileMenuOpen()) return;
        navbar.classList.remove('show-navbar');
    }, 3000);
}

function showNavbar() {
    navbar.classList.add('show-navbar');
    clearTimeout(hideTimeout);
    scheduleHide();
}

document.addEventListener('mousemove', (e) => {
    if (e.clientY <= 100) {
        showNavbar();
    }
});

let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    if (window.scrollY < lastScrollY) {
        showNavbar();
    }
    if (window.scrollY < 50) {
        navbar.classList.add('show-navbar');
    }
    lastScrollY = window.scrollY;
});

// Saat halaman dimuat, kalo di posisi atas, tampilkan navbar
if (window.scrollY < 50) {
    navbar.classList.add('show-navbar');
} else {
    navbar.classList.remove('show-navbar');
}
