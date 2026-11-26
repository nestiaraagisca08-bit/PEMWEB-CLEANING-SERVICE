// ===============================
// ADMIN ADD-ONS
// ===============================

// Cek login admin
const token = sessionStorage.getItem("token");
const user = JSON.parse(sessionStorage.getItem("griyaresikUser") || "{}");

if (!token || user.role?.toLowerCase() !== "admin") {
    alert("Akses ditolak. Silakan login sebagai admin.");
    window.location.href = "login.html";
}

// ===============================
// DATA
// ===============================

// Data layanan
const SERVICES = [
    { id: 1, name: "Kamar Tidur" },
    { id: 2, name: "Ruang Tamu" },
    { id: 3, name: "Dapur (Kitchen)" },
    { id: 4, name: "Kamar Mandi" },
    { id: 5, name: "Ruang Makan" },
    { id: 6, name: "Ruang Kerja" },
    { id: 7, name: "Ruang Belajar" },
    { id: 8, name: "Ruang Laundry" },
    { id: 9, name: "Teras Rumah" },
    { id: 10, name: "Garasi / Carport" },
    { id: 11, name: "Gudang Penyimpanan" }
];

// Data add-on diambil dari database
let addons = [];

// ===============================
// ELEMENT
// ===============================

const addonTableBody = document.getElementById("addonTableBody");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("statusFilter");

const addonModal = document.getElementById("addonModal");
const addonForm = document.getElementById("addonForm");

const addonIdInput = document.getElementById("addonId");
const addonNameInput = document.getElementById("addonName");
const addonPriceInput = document.getElementById("addonPrice");
const addonDescriptionInput = document.getElementById("addonDescription");

const serviceCheckboxContainer = document.getElementById("serviceCheckboxes");

const modalTitle = document.getElementById("modalTitle");

// ===============================
// API
// ===============================

const API_URL = "http://localhost:3000/api/admin/addons";

// ===============================
// FORMAT RUPIAH
// ===============================

function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}

// ===============================
// LOAD DATA ADD-ON
// ===============================

async function loadAddons() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Gagal mengambil data add-on");
        }

        const result = await response.json();

        // Sesuaikan jika backend mengirim data dalam bentuk berbeda
        addons = result.addons || [];

        renderAddons();
        updateSummary();

    } catch (error) {
        console.error("Error load addons:", error);

        addonTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Gagal mengambil data add-on dari database.</p>
                        <small>
                            Pastikan backend sudah berjalan dan endpoint add-on tersedia.
                        </small>
                    </div>
                </td>
            </tr>
        `;
    }
}

// ===============================
// RENDER TABLE
// ===============================

function renderAddons() {
    const keyword = searchInput?.value.toLowerCase() || "";
    const statusFilter = filterStatus?.value || "all";

    let filteredAddons = addons.filter(addon => {
        const name = addon.name || addon.addon_name || "";
        const description = addon.description || "";

        const matchesSearch =
            name.toLowerCase().includes(keyword) ||
            description.toLowerCase().includes(keyword);

        const matchesStatus =
            statusFilter === "all" ||
            String(addon.is_active) === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (filteredAddons.length === 0) {
        addonTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <p>Data add-on tidak ditemukan.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    addonTableBody.innerHTML = filteredAddons.map((addon, index) => {
        const addonId = addon.id || addon.addon_id;
        const addonName = addon.name || addon.addon_name;
        const addonPrice = addon.price || addon.addon_price || 0;

        const isActive =
            addon.is_active === true ||
            addon.is_active === 1 ||
            addon.is_active === "true";

        const services = addon.services || [];

        const serviceNames = services.length > 0
            ? services.map(service => {
                if (typeof service === "string") {
                    return service;
                }

                return service.name || service.service_name;
            }).join(", ")
            : "-";

        return `
            <tr>
                <td>${index + 1}</td>

                <td>
                    <div class="addon-name">
                        <strong>${addonName}</strong>
                    </div>
                </td>

                <td>
                    ${formatRupiah(addonPrice)}
                </td>

                <td>
                    ${serviceNames}
                </td>

                <td>
                    <span class="status-badge ${isActive ? "active" : "inactive"}">
                        ${isActive ? "Aktif" : "Nonaktif"}
                    </span>
                </td>

                <td>
                    ${addon.description || "-"}
                </td>

                <td>
                    <div class="action-buttons">
                        <button
                            class="btn-edit"
                            onclick="editAddon(${addonId})"
                            title="Edit Add-on"
                        >
                            <i class="fas fa-edit"></i>
                        </button>

                        <button
                            class="btn-toggle"
                            onclick="toggleAddon(${addonId})"
                            title="${isActive ? "Nonaktifkan" : "Aktifkan"}"
                        >
                            <i class="fas ${isActive ? "fa-toggle-on" : "fa-toggle-off"}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ===============================
// SUMMARY
// ===============================

function updateSummary() {
    const totalAddon = addons.length;

    const activeAddon = addons.filter(addon =>
        addon.is_active === true ||
        addon.is_active === 1 ||
        addon.is_active === "true"
    ).length;

    const inactiveAddon = totalAddon - activeAddon;

    const totalPrice = addons.reduce((total, addon) => {
        return total + Number(addon.price || addon.addon_price || 0);
    }, 0);

    const totalAddonElement = document.getElementById("totalAddons");
    const activeAddonElement = document.getElementById("activeAddons");
    const inactiveAddonElement = document.getElementById("inactiveAddons");
    const averagePriceElement = document.getElementById("averageAddonPrice");

    if (totalAddonElement) {
        totalAddonElement.textContent = totalAddon;
    }

    if (activeAddonElement) {
        activeAddonElement.textContent = activeAddon;
    }

    if (inactiveAddonElement) {
        inactiveAddonElement.textContent = inactiveAddon;
    }

    if (averagePriceElement) {
        averagePriceElement.textContent =
            totalAddon > 0
                ? formatRupiah(totalPrice / totalAddon)
                : formatRupiah(0);
    }
}

// ===============================
// SERVICE CHECKBOX
// ===============================

function renderServiceCheckboxes(selectedServices = []) {
    serviceCheckboxContainer.innerHTML = SERVICES.map(service => {
        const checked = selectedServices.some(selected => {
            const selectedId = typeof selected === "object"
                ? selected.id || selected.service_id
                : selected;

            return Number(selectedId) === service.id;
        });

        return `
            <label class="service-checkbox">
                <input
                    type="checkbox"
                    name="services"
                    value="${service.id}"
                    ${checked ? "checked" : ""}
                >

                <span>${service.name}</span>
            </label>
        `;
    }).join("");
}

// ===============================
// OPEN MODAL
// ===============================

function openAddonModal() {
    addonForm.reset();

    addonIdInput.value = "";

    modalTitle.textContent = "Tambah Add-on";

    renderServiceCheckboxes([]);

    addonModal.classList.add("show");
}

// ===============================
// CLOSE MODAL
// ===============================

function closeAddonModal() {
    addonModal.classList.remove("show");
}

// ===============================
// EDIT ADD-ON
// ===============================

function editAddon(id) {
    const addon = addons.find(item =>
        Number(item.id || item.addon_id) === Number(id)
    );

    if (!addon) {
        alert("Data add-on tidak ditemukan.");
        return;
    }

    addonIdInput.value = addon.id || addon.addon_id;

    addonNameInput.value =
        addon.name || addon.addon_name || "";

    addonPriceInput.value =
        addon.price || addon.addon_price || 0;

    addonDescriptionInput.value =
        addon.description || "";

    modalTitle.textContent = "Edit Add-on";

    renderServiceCheckboxes(addon.services || []);

    addonModal.classList.add("show");
}

// ===============================
// GET SELECTED SERVICES
// ===============================

function getSelectedServices() {
    const checkedCheckboxes = document.querySelectorAll(
        'input[name="services"]:checked'
    );

    return Array.from(checkedCheckboxes).map(checkbox =>
        Number(checkbox.value)
    );
}

// ===============================
// SAVE ADD-ON
// ===============================

addonForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = addonIdInput.value;

    const name = addonNameInput.value.trim();
    const price = Number(addonPriceInput.value);
    const description = addonDescriptionInput.value.trim();

    const services = getSelectedServices();

    if (!name) {
        alert("Nama add-on harus diisi.");
        return;
    }

    if (price < 0) {
        alert("Harga tidak boleh kurang dari 0.");
        return;
    }

    if (services.length === 0) {
        alert("Pilih minimal satu layanan untuk add-on.");
        return;
    }

    const payload = {
        name,
        price,
        description,
        services
    };

    try {
        let response;

        if (id) {
            // EDIT
            response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        } else {
            // TAMBAH
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Gagal menyimpan add-on");
        }

        alert(
            id
                ? "Add-on berhasil diperbarui."
                : "Add-on berhasil ditambahkan."
        );

        closeAddonModal();

        await loadAddons();

    } catch (error) {
        console.error("Error save addon:", error);
        alert(error.message || "Terjadi kesalahan saat menyimpan add-on.");
    }
});

// ===============================
// TOGGLE STATUS
// ===============================

async function toggleAddon(id) {
    const addon = addons.find(item =>
        Number(item.id || item.addon_id) === Number(id)
    );

    if (!addon) return;

    const currentStatus =
        addon.is_active === true ||
        addon.is_active === 1 ||
        addon.is_active === "true";

    const newStatus = !currentStatus;

    const confirmation = confirm(
        `Apakah kamu yakin ingin ${newStatus ? "mengaktifkan" : "menonaktifkan"} add-on ini?`
    );

    if (!confirmation) return;

    try {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                is_active: newStatus
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Gagal mengubah status add-on");
        }

        await loadAddons();

    } catch (error) {
        console.error("Error toggle addon:", error);
        alert(error.message || "Gagal mengubah status add-on.");
    }
}

// ===============================
// SEARCH
// ===============================

if (searchInput) {
    searchInput.addEventListener("input", renderAddons);
}

// ===============================
// FILTER STATUS
// ===============================

if (filterStatus) {
    filterStatus.addEventListener("change", renderAddons);
}

// ===============================
// LOGOUT
// ===============================

function logout() {
    const confirmation = confirm("Apakah kamu yakin ingin logout?");

    if (!confirmation) return;

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("griyaresikUser");

    window.location.href = "login.html";
}

// ===============================
// BUTTON EVENTS
// ===============================

const addAddonBtn = document.getElementById("addAddonBtn");

if (addAddonBtn) {
    addAddonBtn.addEventListener("click", openAddonModal);
}

const refreshBtn = document.getElementById("refreshBtn");

if (refreshBtn) {
    refreshBtn.addEventListener("click", loadAddons);
}

const closeModalBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeAddonModal);
}

if (cancelBtn) {
    cancelBtn.addEventListener("click", closeAddonModal);
}


// ===============================
// INITIALIZATION
// ===============================

document.addEventListener("DOMContentLoaded", function() {
    loadAddons();
});