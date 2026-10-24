document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".nav-menu a");
    const loginBtn = document.querySelector(".btn-login");
    const bookingBtn = document.querySelector(".btn-primary");
    const serviceBtns = document.querySelectorAll(".btn-service");
    const ctaBtn = document.querySelector(".btn-cta");

    // TAMPILKAN NAMA PENGGUNA SETELAH LOGIN
    const savedUser = JSON.parse(
        sessionStorage.getItem("griyaresikUser") || "null"
    );

    const userName = document.getElementById("userName");

    if (savedUser && userName) {
        userName.textContent = savedUser.name;
    }

    // DETEKSI HALAMAN SETELAH LOGIN
    const namaHalaman = decodeURIComponent(
    window.location.pathname.split("/").pop()
).toLowerCase();

const setelahLogin = namaHalaman === "beranda after login.html";

    // NAVBAR MENU AKTIF
    navLinks.forEach(function (link) {
        const namaMenu = link.textContent.trim().toLowerCase();

        if (setelahLogin) {
            // SETELAH LOGIN: IKUTI LINK PADA HTML
            link.addEventListener("click", function () {
                navLinks.forEach(function (item) {
                    item.classList.remove("active");
                });

                link.classList.add("active");
            });
        } else {
            // SEBELUM LOGIN: PERTAHANKAN PERILAKU LAMA
            if (namaMenu === "beranda") {
                link.href = "#beranda";
            } else {
                link.href = "login.html";
            }

            link.addEventListener("click", function (event) {
                navLinks.forEach(function (item) {
                    item.classList.remove("active");
                });

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
        }
    });

    // BERANDA AKTIF SAAT HALAMAN DIBUKA
    const berandaLink = Array.from(navLinks).find(function (link) {
        return link.textContent.trim().toLowerCase() === "beranda";
    });

    if (berandaLink) {
        berandaLink.classList.add("active");
    }

    // TOMBOL MASUK / AKUN
    if (loginBtn && !setelahLogin) {
        loginBtn.href = "login.html";
    }

    // TOMBOL BOOKING SEKARANG
    if (bookingBtn && !setelahLogin) {
        bookingBtn.href = "login.html";
    }

    // TOMBOL PILIH LAYANAN
    if (!setelahLogin) {
        serviceBtns.forEach(function (button) {
            button.href = "login.html";
        });
    }

    // TOMBOL JADWALKAN SEKARANG
    if (ctaBtn && !setelahLogin) {
        ctaBtn.href = "login.html";
    }
});