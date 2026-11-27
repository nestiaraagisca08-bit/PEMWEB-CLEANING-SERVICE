// ============================================
// KONFIGURASI API
// ============================================

const API_BASE = window.API_BASE + "/api";

const TOKEN_KEY = "token";
const USER_KEY = "griyaresikUser";


// ============================================
// ELEMENT HTML
// ============================================

const profileForm = document.getElementById("profileForm");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");

const sideName = document.getElementById("sideName");
const sideEmail = document.getElementById("sideEmail");
const roleBadge = document.getElementById("roleBadge");

const avatarInitial = document.getElementById("avatarInitial");
const profilePhoto = document.getElementById("profilePhoto");

const saveProfile = document.getElementById("saveProfile");
const cancelProfile = document.getElementById("cancelProfile");

const profileMessage = document.getElementById("profileMessage");

const logoutButton = document.getElementById("logoutButton");

const deleteAccountButton = document.getElementById("deleteAccountButton");
const deleteModal = document.getElementById("deleteModal");

const deletePassword = document.getElementById("deletePassword");
const deleteMessage = document.getElementById("deleteMessage");

const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");


// ============================================
// TOKEN LOGIN
// ============================================

function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
}

const token = getToken();


// ============================================
// CEK LOGIN
// ============================================

if (!token) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "login.html";
}


// ============================================
// DATA PROFIL
// ============================================

let originalProfile = {};


// ============================================
// FORMAT INISIAL
// ============================================

function getInitials(name) {

    if (!name) return "GR";

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }

    return (
        words[0][0] + words[1][0]
    ).toUpperCase();
}


// ============================================
// TAMPILKAN INISIAL
// ============================================

function showInitial(name) {

    avatarInitial.innerHTML = "";

    avatarInitial.textContent = getInitials(name);
}


// ============================================
// TAMPILKAN FOTO PROFIL
// ============================================

function showProfilePhoto(photoUrl, name) {

    avatarInitial.innerHTML = "";

    if (!photoUrl) {
        showInitial(name);
        return;
    }

    const img = document.createElement("img");

    img.src = photoUrl;
    img.alt = "Foto Profil";

    img.onerror = function () {
        showInitial(name);
    };

    avatarInitial.appendChild(img);
}


// ============================================
// TAMPILKAN PESAN
// ============================================

function showMessage(message, type = "success") {

    profileMessage.textContent = message;

    profileMessage.classList.remove("error");

    if (type === "error") {
        profileMessage.classList.add("error");
    }
}


// ============================================
// FORMAT ROLE
// ============================================

function formatRole(role) {

    if (!role) return "Customer";

    const normalizedRole = role.toLowerCase();

    const roles = {
        customer: "Customer",
        worker: "Cleaner",
        admin: "Administrator"
    };

    return roles[normalizedRole] || role;
}


// ============================================
// TAMPILKAN DATA PROFIL
// ============================================

function displayProfile(user) {

    const name = user.name || "";
    const email = user.email || "";
    const phone = user.phone || "";
    const role = user.role || "customer";
    const profilePicture = user.profile_picture || null;

    // Isi form
    profileName.value = name;
    profileEmail.value = email;
    profilePhone.value = phone;

    // Informasi samping
    sideName.textContent = name || "Nama belum diisi";
    sideEmail.textContent = email;

    // Role
    roleBadge.textContent = formatRole(role);

    // Foto atau inisial
    showProfilePhoto(profilePicture, name);

    // Data awal
    originalProfile = {
        id: user.id,
        name,
        email,
        phone,
        role,
        profile_picture: profilePicture
    };
}


// ============================================
// AMBIL DATA PROFIL DARI DATABASE
// ============================================

async function loadProfile() {

    if (!token) return;

    try {

        const response = await fetch(`${API_BASE}/profile`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                clearSession();

                alert("Sesi login telah berakhir. Silakan login kembali.");

                window.location.href = "login.html";

                return;
            }

            throw new Error(
                data.message || "Gagal mengambil data profil."
            );
        }

        const user = data.user || data.data || data;

        displayProfile(user);

        sessionStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );

    } catch (error) {

        console.error("Gagal mengambil profil:", error);

        showMessage(
            error.message || "Tidak dapat terhubung ke server.",
            "error"
        );
    }
}


// ============================================
// PREVIEW FOTO SAAT DIPILIH
// ============================================

profilePhoto.addEventListener("change", function () {

    const file = profilePhoto.files[0];

    if (!file) return;

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Format foto harus JPG, PNG, atau WEBP.");

        profilePhoto.value = "";

        return;
    }

    // Maksimal 5 MB sesuai backend
    if (file.size > 5 * 1024 * 1024) {

        alert("Ukuran foto maksimal 5 MB.");

        profilePhoto.value = "";

        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

        avatarInitial.innerHTML = "";

        const img = document.createElement("img");

        img.src = event.target.result;
        img.alt = "Preview Foto Profil";

        avatarInitial.appendChild(img);
    };

    reader.readAsDataURL(file);
});


// ============================================
// SIMPAN PROFIL + FOTO
// ============================================

profileForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = profileName.value.trim();
    const phone = profilePhone.value.trim();
    const photoFile = profilePhoto.files[0];

    // Validasi nama
    if (!name) {

        showMessage("Nama lengkap wajib diisi.", "error");

        profileName.focus();

        return;
    }

    // Validasi nomor telepon
    if (
        phone &&
        !/^[0-9+\-\s]{8,20}$/.test(phone)
    ) {

        showMessage("Format nomor telepon tidak valid.", "error");

        profilePhone.focus();

        return;
    }

    try {

        saveProfile.disabled = true;
        saveProfile.textContent = "Menyimpan...";

        profileMessage.textContent = "";

        // FormData untuk mengirim foto dan data teks
        const formData = new FormData();

        formData.append("name", name);
        formData.append("phone", phone);

        if (photoFile) {
            formData.append("profilePhoto", photoFile);
        }

        const response = await fetch(`${API_BASE}/profile`, {

            method: "PUT",

            headers: {
                Authorization: `Bearer ${token}`
            },

            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Gagal memperbarui profil."
            );
        }

        const updatedUser = data.user || data.data || data;

        // Tampilkan data baru
        displayProfile(updatedUser);

        // Update session
        sessionStorage.setItem(
            USER_KEY,
            JSON.stringify(updatedUser)
        );

        // Bersihkan input foto
        profilePhoto.value = "";

        showMessage("Profil berhasil diperbarui.");

    } catch (error) {

        console.error("Gagal menyimpan profil:", error);

        showMessage(
            error.message || "Terjadi kesalahan saat menyimpan profil.",
            "error"
        );

    } finally {

        saveProfile.disabled = false;
        saveProfile.textContent = "Simpan Perubahan";
    }
});


// ============================================
// TOMBOL BATAL
// ============================================

cancelProfile.addEventListener("click", function () {

    profileName.value = originalProfile.name || "";
    profileEmail.value = originalProfile.email || "";
    profilePhone.value = originalProfile.phone || "";

    sideName.textContent =
        originalProfile.name || "Nama belum diisi";

    sideEmail.textContent =
        originalProfile.email || "";

    roleBadge.textContent =
        formatRole(originalProfile.role);

    showProfilePhoto(
        originalProfile.profile_picture,
        originalProfile.name
    );

    profilePhoto.value = "";

    profileMessage.textContent = "";
});


// ============================================
// HAPUS SESSION
// ============================================

function clearSession() {

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}


// ============================================
// LOGOUT
// ============================================

logoutButton.addEventListener("click", function () {

    const confirmation = confirm(
        "Apakah kamu yakin ingin keluar dari akun GriyaResik?"
    );

    if (!confirmation) return;

    clearSession();

    alert("Kamu berhasil keluar dari akun.");

    window.location.href = "login.html";
});


// ============================================
// BUKA MODAL HAPUS AKUN
// ============================================

deleteAccountButton.addEventListener("click", function () {

    deleteModal.classList.add("show");

    deletePassword.value = "";
    deleteMessage.textContent = "";

    deletePassword.focus();
});


// ============================================
// TUTUP MODAL HAPUS AKUN
// ============================================

function closeDeleteModal() {

    deleteModal.classList.remove("show");

    deletePassword.value = "";
    deleteMessage.textContent = "";
}

cancelDelete.addEventListener("click", closeDeleteModal);


// Klik area luar modal

deleteModal.addEventListener("click", function (event) {

    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});


// ============================================
// KONFIRMASI HAPUS AKUN
// ============================================

confirmDelete.addEventListener("click", async function () {

    const password = deletePassword.value;

    if (!password) {

        deleteMessage.textContent =
            "Masukkan password terlebih dahulu.";

        deletePassword.focus();

        return;
    }

    const confirmation = confirm(
        "PERINGATAN: Akun akan dihapus. Tindakan ini tidak dapat dibatalkan. Lanjutkan?"
    );

    if (!confirmation) return;

    try {

        confirmDelete.disabled = true;
        confirmDelete.textContent = "Menghapus...";

        deleteMessage.textContent = "";

        const response = await fetch(`${API_BASE}/profile`, {

            method: "DELETE",

            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Gagal menghapus akun."
            );
        }

        clearSession();

        alert("Akun GriyaResik berhasil dihapus.");

        window.location.href = "register.html";

    } catch (error) {

        console.error("Gagal menghapus akun:", error);

        deleteMessage.textContent =
            error.message || "Terjadi kesalahan saat menghapus akun.";

    } finally {

        confirmDelete.disabled = false;
        confirmDelete.textContent = "Ya, Hapus Akun";
    }
});


// ============================================
// INISIALISASI HALAMAN
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    if (token) {
        loadProfile();
    }
});