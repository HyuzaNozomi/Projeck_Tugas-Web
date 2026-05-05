// Navbar: muncul saat kursor di area atas (≤100px) atau scroll ke atas
const navbar = document.getElementById('navbar');
let hideTimeout;

function showNavbar() {
    navbar.classList.add('show-navbar');
    clearTimeout(hideTimeout);
    // Sembunyikan kembali setelah 1,5 detik
    hideTimeout = setTimeout(() => {
        navbar.classList.remove('show-navbar');
    }, 1500);
}

// Deteksi pergerakan mouse di area atas layar
document.addEventListener('mousemove', (e) => {
    if (e.clientY <= 100) {
        showNavbar();
    }
});

// Deteksi scroll ke atas
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    if (window.scrollY < lastScrollY) {
        showNavbar();
    }
    lastScrollY = window.scrollY;
});

// Pastikan navbar tersembunyi saat halaman dimuat
navbar.classList.remove('show-navbar');