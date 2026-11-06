// ==================================================
// GRIYARESIK - DATA PETUGAS
// TERHUBUNG DENGAN POSTGRESQL
// ==================================================


// ==================================================
// 1. KONFIGURASI
// ==================================================

const API_URL = "http://localhost:3000/api/admin/workers";

const regionNames = {
    SB: "Surabaya Barat",
    ST: "Surabaya Timur",
    SU: "Surabaya Utara",
    SS: "Surabaya Selatan",
    SP: "Surabaya Pusat"
};

let staffList = [];
let user = null;


// ==================================================
// 2. AMBIL ELEMEN HTML
// ==================================================

const tableBody = document.getElementById("staffTableBody");
const modal = document.getElementById("staffModal");
const form = document.getElementById("staffForm");

const adminNameElement = document.getElementById("adminName");
const adminAvatarElement = document.getElementById("adminAvatar");


// ==================================================
// 3. CEK LOGIN DAN ROLE ADMIN
// ==================================================

try {
    user = JSON.parse(
        sessionStorage.getItem("griyaresikUser")
    );
} catch (error) {
    console.error("Data pengguna tidak valid:", error);
}

const token = sessionStorage.getItem("token");

if (!user || !token) {
    alert("Silakan login terlebih dahulu.");
    window.location.href = "login.html";
} else if (user.role !== "admin") {
    alert("Halaman ini hanya dapat diakses administrator.");
    window.location.href = "Beranda after login.html";
} else {
    const name =
        user.name ||
        user.nama ||
        user.fullName ||
        "Administrator";

    adminNameElement.textContent = name;
    adminAvatarElement.textContent = name.charAt(0).toUpperCase();
}


// ==================================================
// 4. FUNGSI REQUEST API
// ==================================================

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    let result;

    try {
        result = await response.json();
    } catch {
        result = {};
    }

    if (response.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("griyaresikUser");

        alert("Sesi login telah berakhir. Silakan login kembali.");

        window.location.href = "login.html";

        throw new Error("Sesi login berakhir.");
    }

    if (response.status === 403) {
        alert("Akses ditolak. Halaman ini khusus administrator.");

        window.location.href = "Beranda after login.html";

        throw new Error("Akses administrator ditolak.");
    }

    if (!response.ok) {
        throw new Error(
            result.message || "Terjadi kesalahan pada server."
        );
    }

    return result;
}


// ==================================================
// 5. AMBIL DATA PETUGAS DARI DATABASE
// ==================================================

async function loadStaff() {
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="empty">
                Memuat data petugas...
            </td>
        </tr>
    `;

    try {
        const result = await apiRequest(API_URL);

        staffList = result.workers || [];

        renderStaff();

    } catch (error) {
        console.error("Gagal mengambil data:", error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;
    }
}


// ==================================================
// 6. TAMPILKAN DATA PETUGAS
// ==================================================

function renderStaff() {
    const keyword = document
        .getElementById("searchInput")
        .value.toLowerCase()
        .trim();

    const selectedRegion =
        document.getElementById("regionFilter").value;

    const selectedStatus =
        document.getElementById("statusFilter").value;

    const filteredStaff = staffList.filter(staff => {

        const matchKeyword =
            String(staff.name || "").toLowerCase().includes(keyword) ||
            String(staff.email || "").toLowerCase().includes(keyword);

        const matchRegion =
            !selectedRegion ||
            staff.region === selectedRegion;

        const matchStatus =
            !selectedStatus ||
            staff.status === selectedStatus;

        return matchKeyword && matchRegion && matchStatus;
    });

    tableBody.innerHTML = "";

    if (filteredStaff.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Belum ada data petugas.
                </td>
            </tr>
        `;
    } else {

        filteredStaff.forEach(staff => {

            const initial = String(staff.name || "P")
                .charAt(0)
                .toUpperCase();

            const photo = staff.photo
                ? `<img src="${escapeHTML(staff.photo)}" alt="Foto Petugas">`
                : initial;

            const statusClass =
                staff.status === "Aktif"
                    ? "active"
                    : "inactive";

            const availabilityClass =
                staff.availability === "Tersedia"
                    ? "available"
                    : "busy";

            const packages = Array.isArray(staff.packages)
                ? staff.packages
                : [];

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <div class="person">

                        <div class="person-avatar">
                            ${photo}
                        </div>

                        <div>
                            <strong>
                                ${escapeHTML(staff.name)}
                            </strong>

                            <small>
                                ${escapeHTML(staff.email || "-")}
                            </small>
                        </div>

                    </div>
                </td>

                <td>
                    ${escapeHTML(staff.phone || "-")}
                </td>

                <td>
                    ${escapeHTML(regionNames[staff.region] || "-")}
                </td>

                <td>
                    ${packages.map(escapeHTML).join(", ")}
                </td>

                <td>
                    <span class="badge ${statusClass}">
                        ${escapeHTML(staff.status)}
                    </span>
                </td>

                <td>
                    <span class="badge ${availabilityClass}">
                        ${escapeHTML(staff.availability)}
                    </span>
                </td>

                <td>
                    <div class="actions">

                        <button
                            class="btn-edit"
                            onclick="editStaff(${Number(staff.id)})"
                        >
                            Edit
                        </button>

                        <button
                            class="btn-delete"
                            onclick="deleteStaff(${Number(staff.id)})"
                        >
                            Hapus
                        </button>

                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    document.getElementById("resultCount").textContent =
        `${filteredStaff.length} petugas ditemukan`;

    updateStatistics();
}


// ==================================================
// 7. STATISTIK PETUGAS
// ==================================================

function updateStatistics() {

    const total = staffList.length;

    const active = staffList.filter(
        staff => staff.status === "Aktif"
    ).length;

    const available = staffList.filter(
        staff =>
            staff.status === "Aktif" &&
            staff.availability === "Tersedia"
    ).length;

    document.getElementById("totalPetugas").textContent = total;

    document.getElementById("petugasAktif").textContent = active;

    document.getElementById("petugasTersedia").textContent = available;
}


// ==================================================
// 8. MODAL TAMBAH DAN EDIT
// ==================================================

function openModal() {
    modal.classList.add("show");
}

function closeModal() {

    modal.classList.remove("show");

    form.reset();

    document.getElementById("staffId").value = "";

    document.getElementById("modalTitle").textContent =
        "Tambah Petugas";
}


// Tombol tambah

document.getElementById("addBtn")
    .addEventListener("click", () => {

        form.reset();

        document.getElementById("staffId").value = "";

        document.getElementById("modalTitle").textContent =
            "Tambah Petugas";

        openModal();
    });


// Tombol tutup

document.getElementById("closeModal")
    .addEventListener("click", closeModal);


// Tombol batal

document.getElementById("cancelBtn")
    .addEventListener("click", closeModal);


// Klik area luar modal

modal.addEventListener("click", event => {

    if (event.target === modal) {
        closeModal();
    }

});


// ==================================================
// 9. VALIDASI PAKET CLEANING
// ==================================================

function getSelectedPackages() {

    return Array.from(
        document.querySelectorAll(
            'input[name="packages"]:checked'
        )
    ).map(input => input.value);
}


function validatePackages(packages) {

    if (packages.length < 2) {

        alert(
            "Petugas harus memiliki minimal dua kemampuan paket."
        );

        return false;
    }

    if (
        packages.length === 2 &&
        packages.includes("Basic") &&
        packages.includes("Deep")
    ) {

        alert(
            "Kombinasi Basic + Deep saja tidak diperbolehkan. " +
            "Petugas harus memiliki kemampuan Standard."
        );

        return false;
    }

    return true;
}


// ==================================================
// 10. TAMBAH DAN EDIT PETUGAS
// ==================================================

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const id = document.getElementById("staffId").value;

    const packages = getSelectedPackages();

    if (!validatePackages(packages)) return;

    const staffData = {

        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email")
            .value.trim().toLowerCase(),

        phone: document.getElementById("phone").value.trim(),

        photo: document.getElementById("photo").value.trim(),

        address: document.getElementById("address").value.trim(),

        region: document.getElementById("region").value,

        packages: packages,

        status: document.getElementById("status").value,

        availability: document.getElementById("availability").value

    };

    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;

    submitButton.textContent = "Menyimpan...";

    try {

        if (id) {

            // UPDATE DATA

            await apiRequest(`${API_URL}/${id}`, {
                method: "PUT",
                body: JSON.stringify(staffData)
            });

            alert("Data petugas berhasil diperbarui.");

        } else {

            // TAMBAH DATA

            await apiRequest(API_URL, {
                method: "POST",
                body: JSON.stringify(staffData)
            });

            alert("Petugas berhasil ditambahkan.");
        }

        closeModal();

        await loadStaff();

    } catch (error) {

        console.error("Gagal menyimpan petugas:", error);

        alert(error.message);

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Simpan Petugas";
    }

});


// ==================================================
// 11. EDIT PETUGAS
// ==================================================

window.editStaff = function(id) {

    const staff = staffList.find(
        item => Number(item.id) === Number(id)
    );

    if (!staff) {

        alert("Data petugas tidak ditemukan.");

        return;
    }

    document.getElementById("staffId").value = staff.id;

    document.getElementById("name").value =
        staff.name || "";

    document.getElementById("email").value =
        staff.email || "";

    document.getElementById("phone").value =
        staff.phone || "";

    document.getElementById("photo").value =
        staff.photo || "";

    document.getElementById("address").value =
        staff.address || "";

    document.getElementById("region").value =
        staff.region || "";

    document.getElementById("status").value =
        staff.status || "Aktif";

    document.getElementById("availability").value =
        staff.availability || "Tersedia";

    const packages = Array.isArray(staff.packages)
        ? staff.packages
        : [];

    document.querySelectorAll('input[name="packages"]')
        .forEach(input => {

            input.checked = packages.includes(input.value);

        });

    document.getElementById("modalTitle").textContent =
        "Edit Data Petugas";

    openModal();
};


// ==================================================
// 12. HAPUS PETUGAS
// ==================================================

window.deleteStaff = async function(id) {

    const confirmation = confirm(
        "Apakah kamu yakin ingin menghapus data petugas ini?"
    );

    if (!confirmation) return;

    try {

        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        alert("Data petugas berhasil dihapus.");

        await loadStaff();

    } catch (error) {

        console.error("Gagal menghapus petugas:", error);

        alert(error.message);

    }

};


// ==================================================
// 13. PENCARIAN DAN FILTER
// ==================================================

document.getElementById("searchInput")
    .addEventListener("input", renderStaff);

document.getElementById("regionFilter")
    .addEventListener("change", renderStaff);

document.getElementById("statusFilter")
    .addEventListener("change", renderStaff);


// ==================================================
// 14. LOGOUT
// ==================================================

document.getElementById("logoutBtn")
    .addEventListener("click", function(event) {

        event.preventDefault();

        const confirmation = confirm(
            "Apakah kamu yakin ingin keluar?"
        );

        if (!confirmation) return;

        sessionStorage.removeItem("griyaresikUser");

        sessionStorage.removeItem("token");

        window.location.href = "login.html";

    });


// ==================================================
// 15. SIDEBAR RESPONSIVE
// ==================================================

const mobileToggle = document.getElementById("mobileToggle");

const sidebar = document.getElementById("sidebar");

mobileToggle.addEventListener("click", function() {

    sidebar.classList.toggle("show");

});


// ==================================================
// 16. ESCAPE HTML
// ==================================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, char => ({

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

    })[char]);

}


// ==================================================
// 17. TUTUP SIDEBAR KETIKA KONTEN DIKLIK
// ==================================================

document.querySelector(".main").addEventListener("click", function() {

    if (window.innerWidth <= 900) {

        sidebar.classList.remove("show");

    }

});


// ==================================================
// 18. TAMPILKAN DATA AWAL
// ==================================================

loadStaff();