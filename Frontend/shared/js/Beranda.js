document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".nav-menu a");
    const loginBtn = document.querySelector(".btn-login");
    const bookingBtn = document.querySelector(".btn-primary");
    const serviceBtns = document.querySelectorAll(".btn-service");
    const ctaBtn = document.querySelector(".btn-cta");

    const sessionKey = "griyaresikUser";

function readSession() {
    try {
        const user = JSON.parse(sessionStorage.getItem(sessionKey) || "null");
        const email = typeof user?.email === "string" ? user.email.trim() : "";
        return /^[^\s@]+@[^\s@]+$/.test(email) ? { ...user, email } : null;
    } catch {
        return null;
    }
}

const savedUser = readSession();
const setelahLogin = Boolean(savedUser);
const userName = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const profile = document.getElementById("accountProfile");

if (savedUser && userName && logoutBtn && profile && loginBtn) {
    const localPart = savedUser.email.split("@")[0];
    const name = localPart.split("+")[0]
        .replace(/\d+$/, "")
        .replace(/[._-]+/g, " ")
        .trim() || localPart;

    const form = profile.querySelector("form");
    const { profileName, profileEmail, profilePhone } = form.elements;
    const status = document.getElementById("profileStatus");
    const phoneKey = "griyaresikPhone:" + savedUser.email.toLowerCase();

    loginBtn.href = "#accountProfile";
    profileName.value = name;
    profileEmail.value = savedUser.email;
    profilePhone.value = localStorage.getItem(phoneKey) || "";

    loginBtn.addEventListener("click", event => {
        event.preventDefault();
        status.textContent = "";
        profile.showModal();
    });

    document.getElementById("closeProfile").addEventListener("click", () => {
        profile.close();
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        localStorage.setItem(phoneKey, profilePhone.value.trim());
        status.textContent = "Nomor telepon tersimpan.";
    });

    document.getElementById("copyProfile").addEventListener("click", async () => {
        if (!profilePhone.reportValidity()) return;

        try {
            await navigator.clipboard.writeText(JSON.stringify({
                format: "griyaresik-profile",
                version: 1,
                name: profileName.value,
                email: profileEmail.value,
                phone: profilePhone.value.trim()
            }));

            status.textContent = "Data profil disalin.";
        } catch {
            status.textContent = "Gagal menyalin. Coba buka lewat localhost atau HTTPS.";
        }
    });

    window.addEventListener("pageshow", event => {
        if (event.persisted && readSession()?.email !== savedUser.email) {
            window.location.reload();
        }
    });
}

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
    if (bookingBtn) {
        bookingBtn.href = "booking.html";
    }

    // TOMBOL PILIH LAYANAN
    if (!setelahLogin) {
        serviceBtns.forEach(function (button) {
            button.dataset.target = "login.html";
        });
    }

    // TOMBOL JADWALKAN SEKARANG
    if (ctaBtn && !setelahLogin) {
        ctaBtn.href = "login.html";
    }
});

// PILIH KARTU LAYANAN DI BERANDA
function initHomeServiceSelection() {
    const cards = [
        ...document.querySelectorAll("#layanan .service-card")
    ];

    if (!cards.length) return;

    function selectService(selectedCard) {
        cards.forEach(card => {
            const active = card === selectedCard;
            const icon = card.querySelector(".service-icon");
            const button = card.querySelector(".btn-service");

            card.classList.toggle("featured", active);
            icon?.classList.toggle("dark-icon", active);

            if (button) {
                button.classList.toggle("featured-button", active);
                button.setAttribute("aria-pressed", String(active));
            }
        });
    }

    cards.forEach(card => {
    card.addEventListener("click", event => {
        const serviceButton = event.target.closest(".btn-service");

        if (serviceButton) {
            event.preventDefault();

            selectService(card);
            window.location.href = serviceButton.dataset.target || "Layanan.html";
            return;
        }

        if (event.target.closest("a")) return;

        selectService(card);
    });
});

    // Standard tetap menjadi pilihan awal.
    const initialCard =
        cards.find(card => card.classList.contains("featured")) ||
        cards[0];

    selectService(initialCard);
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initHomeServiceSelection,
        { once: true }
    );
} else {
    initHomeServiceSelection();
}