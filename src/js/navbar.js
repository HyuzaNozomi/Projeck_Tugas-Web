/*
  navbar.js — mengontrol tampilan navbar (muncul/sembunyi)
  
  Cara kerjanya:
  - Navbar otomatis muncul kalo mouse masuk 100px dari atas layar
  - Atau kalo user scroll ke atas
  - Setelah muncul, 1,5 detik kemudian navbar sembunyi lagi
  - Efeknya pake CSS transition (glassmorphism)
*/

const navbar = document.getElementById('navbar');
let hideTimeout;

// Munculin navbar, batalkan timeout sembunyi sebelumnya,
// lalu jadwalin buat sembunyi lagi 1,5 detik lagi
function showNavbar() {
    navbar.classList.add('show-navbar');
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
        navbar.classList.remove('show-navbar');
    }, 1500);
}

// Begitu mouse masuk area 100px dari atas, panggil showNavbar
// Pake throttle biar gak overload (cuma diproses tiap 100ms)
let lastMoveTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMoveTime < 100) return;
    lastMoveTime = now;
    if (e.clientY <= 100) {
        showNavbar();   
    }
});

// Kalo user scroll ke atas (posisi scroll sekarang < posisi sebelumnya),
// berarti dia lagi lirik ke atas, munculin navbar
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    if (window.scrollY < lastScrollY) {
        showNavbar();
    }
    lastScrollY = window.scrollY;
});

// Pas halaman pertama dimuat, pastikan navbar dalam keadaan tersembunyi
navbar.classList.remove('show-navbar');
