
document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".nav-menu a");
    const loginBtn = document.querySelector(".btn-login");
    const bookingBtn = document.querySelector(".btn-primary");
    const serviceBtns = document.querySelectorAll(".btn-service");
    const ctaBtn = document.querySelector(".btn-cta");

    // NAVBAR MENU AKTIF
    navLinks.forEach(function (link) {
        const namaMenu = link.textContent.trim().toLowerCase();

        // Atur tujuan menu
        if (namaMenu === "beranda") {
            link.href = "#beranda";
        } else {
            link.href = "login.html";
        }

        // Aksi ketika menu diklik
        link.addEventListener("click", function (event) {
            // Hapus warna aktif dari semua menu
            navLinks.forEach(function (item) {
                item.classList.remove("active");
            });

            // Tambahkan warna aktif pada menu yang diklik
            link.classList.add("active");

            if (namaMenu === "beranda") {
                event.preventDefault();

                const beranda = document.getElementById("beranda");

                if (beranda) {
                    beranda.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            } else {
                event.preventDefault();
                window.location.href = "login.html";
            }
        });
    });

    // BERANDA AKTIF SAAT HALAMAN PERTAMA DIBUKA
    const berandaLink = Array.from(navLinks).find(function (link) {
        return link.textContent.trim().toLowerCase() === "beranda";
    });

    if (berandaLink) {
        berandaLink.classList.add("active");
    }

    // TOMBOL MASUK / AKUN
    if (loginBtn) {
        loginBtn.href = "login.html";
    }

    // TOMBOL BOOKING SEKARANG DI HERO
    if (bookingBtn) {
        bookingBtn.href = "login.html";
    }

    // TOMBOL PILIH LAYANAN
    serviceBtns.forEach(function (button) {
        button.href = "login.html";
    });

    // TOMBOL JADWALKAN SEKARANG
    if (ctaBtn) {
        ctaBtn.href = "login.html";
    }
});
