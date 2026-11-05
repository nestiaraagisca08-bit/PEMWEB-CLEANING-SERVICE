// ==================================================
// GRIYARESIK - DATA PETUGAS KEBERSIHAN
// ==================================================

const STORAGE_KEY = "griyaresikStaff";

let staffList = [];

try {
    staffList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch (error) {
    console.error("Gagal membaca data petugas:", error);
    staffList = [];
}

const regionNames = {
    SB: "Surabaya Barat",
    ST: "Surabaya Timur",
    SU: "Surabaya Utara",
    SS: "Surabaya Selatan",
    SP: "Surabaya Pusat"
};

const tableBody = document.getElementById("staffTableBody");
const modal = document.getElementById("staffModal");
const form = document.getElementById("staffForm");


// ==================================================
// 1. CEK LOGIN ADMIN
// ==================================================

let user = null;

try {
    user = JSON.parse(sessionStorage.getItem("griyaresikUser"));
} catch (error) {
    console.error("Data pengguna tidak valid:", error);
}

if (!user) {
    window.location.href = "login.html";
} else {
    const adminName =
        user.name ||
        user.nama ||
        user.fullName ||
        "Administrator";

    document.getElementById("adminName").textContent = adminName;

    document.getElementById("adminAvatar").textContent =
        adminName.charAt(0).toUpperCase();
}


// ==================================================
// 2. SIMPAN DATA
// ==================================================

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(staffList)
    );
}


// ==================================================
// 3. TAMPILKAN DATA PETUGAS
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
            staff.name.toLowerCase().includes(keyword) ||
            staff.email.toLowerCase().includes(keyword);

        const matchRegion =
            !selectedRegion || staff.region === selectedRegion;

        const matchStatus =
            !selectedStatus || staff.status === selectedStatus;

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
            const initial = staff.name.charAt(0).toUpperCase();

            const photo = staff.photo
                ? `<img src="${escapeHTML(staff.photo)}" alt="Foto Petugas">`
                : initial;

            const statusClass =
                staff.status === "Aktif" ? "active" : "inactive";

            const availabilityClass =
                staff.availability === "Tersedia"
                    ? "available"
                    : "busy";

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>
                    <div class="person">
                        <div class="person-avatar">
                            ${photo}
                        </div>
                        <div>
                            <strong>${escapeHTML(staff.name)}</strong>
                            <small>${escapeHTML(staff.email)}</small>
                        </div>
                    </div>
                </td>

                <td>${escapeHTML(staff.phone)}</td>

                <td>${regionNames[staff.region] || "-"}</td>

                <td>${staff.packages.map(escapeHTML).join(", ")}</td>

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
                        <button class="btn-edit"
                            onclick="editStaff(${staff.id})">
                            Edit
                        </button>

                        <button class="btn-delete"
                            onclick="deleteStaff(${staff.id})">
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
// 4. STATISTIK PETUGAS
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
// 5. MODAL TAMBAH DAN EDIT
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

document.getElementById("addBtn").addEventListener("click", () => {
    form.reset();

    document.getElementById("staffId").value = "";

    document.getElementById("modalTitle").textContent =
        "Tambah Petugas";

    openModal();
});

document.getElementById("closeModal")
    .addEventListener("click", closeModal);

document.getElementById("cancelBtn")
    .addEventListener("click", closeModal);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeModal();
    }
});


// ==================================================
// 6. VALIDASI PAKET CLEANING
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
        alert("Petugas harus memiliki minimal dua kemampuan paket.");
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
// 7. TAMBAH DAN EDIT PETUGAS
// ==================================================

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = document.getElementById("staffId").value;
    const packages = getSelectedPackages();

    if (!validatePackages(packages)) return;

    const email = document
        .getElementById("email")
        .value.trim()
        .toLowerCase();

    // Cek email duplikat
    const duplicateEmail = staffList.some(staff =>
        staff.email.toLowerCase() === email &&
        String(staff.id) !== String(id)
    );

    if (duplicateEmail) {
        alert("Email tersebut sudah digunakan oleh petugas lain.");
        return;
    }

    const staffData = {
        id: id ? Number(id) : Date.now(),

        name: document.getElementById("name").value.trim(),

        email: email,

        phone: document.getElementById("phone").value.trim(),

        photo: document.getElementById("photo").value.trim(),

        address: document.getElementById("address").value.trim(),

        region: document.getElementById("region").value,

        packages: packages,

        status: document.getElementById("status").value,

        availability: document.getElementById("availability").value
    };

    if (id) {
        const index = staffList.findIndex(
            staff => staff.id === Number(id)
        );

        if (index !== -1) {
            staffList[index] = staffData;
        }
    } else {
        staffList.push(staffData);
    }

    saveData();
    renderStaff();
    closeModal();

    alert(
        id
            ? "Data petugas berhasil diperbarui."
            : "Petugas berhasil ditambahkan."
    );
});


// ==================================================
// 8. EDIT PETUGAS
// ==================================================

function editStaff(id) {
    const staff = staffList.find(
        item => item.id === id
    );

    if (!staff) return;

    document.getElementById("staffId").value = staff.id;
    document.getElementById("name").value = staff.name;
    document.getElementById("email").value = staff.email;
    document.getElementById("phone").value = staff.phone;
    document.getElementById("photo").value = staff.photo || "";
    document.getElementById("address").value = staff.address;
    document.getElementById("region").value = staff.region;
    document.getElementById("status").value = staff.status;
    document.getElementById("availability").value =
        staff.availability;

    document.querySelectorAll('input[name="packages"]')
        .forEach(input => {
            input.checked = staff.packages.includes(input.value);
        });

    document.getElementById("modalTitle").textContent =
        "Edit Data Petugas";

    openModal();
}


// ==================================================
// 9. HAPUS PETUGAS
// ==================================================

function deleteStaff(id) {
    const confirmation = confirm(
        "Apakah kamu yakin ingin menghapus data petugas ini?"
    );

    if (!confirmation) return;

    staffList = staffList.filter(
        staff => staff.id !== id
    );

    saveData();
    renderStaff();

    alert("Data petugas berhasil dihapus.");
}


// ==================================================
// 10. PENCARIAN DAN FILTER
// ==================================================

document.getElementById("searchInput")
    .addEventListener("input", renderStaff);

document.getElementById("regionFilter")
    .addEventListener("change", renderStaff);

document.getElementById("statusFilter")
    .addEventListener("change", renderStaff);


// ==================================================
// 11. LOGOUT
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
// 12. SIDEBAR RESPONSIVE
// ==================================================

document.getElementById("mobileToggle")
    .addEventListener("click", function() {
        document.getElementById("sidebar")
            .classList.toggle("show");
    });


// ==================================================
// 13. KEAMANAN TAMPILAN TEKS
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
// 14. TAMPILKAN DATA SAAT HALAMAN DIBUKA
// ==================================================

renderStaff();