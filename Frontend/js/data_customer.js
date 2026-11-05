// ============================================
// KONFIGURASI API
// ============================================

// Sesuaikan dengan alamat backend GriyaResik.
const API_URL = "http://localhost:3000";

// Endpoint yang perlu disediakan oleh backend.
const CUSTOMER_ENDPOINT = "/api/admin/customers";


// ============================================
// ELEMENT HTML
// ============================================

const customerTable = document.getElementById("customerTable");

const totalCustomer = document.getElementById("totalCustomer");
const googleCustomer = document.getElementById("googleCustomer");
const emailCustomer = document.getElementById("emailCustomer");

const searchInput = document.getElementById("searchInput");
const methodFilter = document.getElementById("methodFilter");

const detailModal = document.getElementById("detailModal");


// ============================================
// DATA CUSTOMER
// ============================================

let customers = [];


// ============================================
// TOKEN AUTHENTICATION
// ============================================

function getAuthHeaders() {

    const token = sessionStorage.getItem("token");

    return {
        "Content-Type": "application/json",

        ...(token
            ? { "Authorization": `Bearer ${token}` }
            : {})
    };

}


// ============================================
// FORMAT NAMA
// ============================================

function getInitials(name) {

    if (!name) return "GR";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");

}


// ============================================
// FORMAT HTML
// ============================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, char => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[char]);

}


// ============================================
// METODE REGISTRASI
// ============================================

function getRegistrationMethod(customer) {

    if (customer.google_id) {
        return "google";
    }

    return "email";

}


// ============================================
// LOAD DATA CUSTOMER
// ============================================

async function loadCustomers() {

    customerTable.innerHTML = `
        <tr>
            <td colspan="5" class="message-row">
                Sedang mengambil data customer...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_URL}${CUSTOMER_ENDPOINT}`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );


        if (response.status === 401 || response.status === 403) {

            throw new Error(
                "Akses ditolak. Pastikan kamu login menggunakan akun admin."
            );

        }


        if (!response.ok) {

            throw new Error(
                `Gagal mengambil data customer. Status: ${response.status}`
            );

        }


        const result = await response.json();


        // Mendukung response berupa array langsung
        // atau object { customers: [...] }.

        if (Array.isArray(result)) {

            customers = result;

        } else if (Array.isArray(result.customers)) {

            customers = result.customers;

        } else {

            throw new Error("Format data dari server tidak sesuai.");

        }


        updateSummary();
        renderCustomers();

    } catch (error) {

        console.error("Error mengambil customer:", error);

        customerTable.innerHTML = `
            <tr>
                <td colspan="5" class="message-row error">
                    ${escapeHTML(error.message)}
                    <br><br>
                    Periksa koneksi backend dan endpoint API.
                </td>
            </tr>
        `;

        totalCustomer.textContent = "—";
        googleCustomer.textContent = "—";
        emailCustomer.textContent = "—";

    }

}


// ============================================
// SUMMARY CUSTOMER
// ============================================

function updateSummary() {

    const googleCount = customers.filter(customer =>
        getRegistrationMethod(customer) === "google"
    ).length;


    const emailCount = customers.filter(customer =>
        getRegistrationMethod(customer) === "email"
    ).length;


    totalCustomer.textContent = customers.length;

    googleCustomer.textContent = googleCount;

    emailCustomer.textContent = emailCount;

}


// ============================================
// TAMPILKAN CUSTOMER
// ============================================

function renderCustomers() {

    const keyword = searchInput.value
        .trim()
        .toLowerCase();

    const selectedMethod = methodFilter.value;


    const filteredCustomers = customers.filter(customer => {

        const name = String(customer.name || "").toLowerCase();

        const email = String(customer.email || "").toLowerCase();

        const method = getRegistrationMethod(customer);


        const matchSearch =
            name.includes(keyword) ||
            email.includes(keyword);


        const matchMethod =
            selectedMethod === "all" ||
            selectedMethod === method;


        return matchSearch && matchMethod;

    });


    if (filteredCustomers.length === 0) {

        customerTable.innerHTML = `
            <tr>
                <td colspan="5" class="message-row">
                    Tidak ada customer yang ditemukan.
                </td>
            </tr>
        `;

        return;

    }


    customerTable.innerHTML = filteredCustomers.map((customer, index) => {

        const method = getRegistrationMethod(customer);

        const methodLabel = method === "google"
            ? "Google"
            : "Email";

        const avatar = customer.profile_picture
            ? `
                <img
                    src="${escapeHTML(customer.profile_picture)}"
                    alt="Foto profil"
                    onerror="this.style.display='none'; this.parentElement.textContent='${escapeHTML(getInitials(customer.name))}'"
                >
            `
            : escapeHTML(getInitials(customer.name));


        return `

            <tr>

                <td>${index + 1}</td>

                <td>

                    <div class="customer-info">

                        <div class="avatar">
                            ${avatar}
                        </div>

                        <div>

                            <div class="customer-name">
                                ${escapeHTML(customer.name || "Tanpa Nama")}
                            </div>

                            <div class="customer-email">
                                ${escapeHTML(customer.email || "-")}
                            </div>

                        </div>

                    </div>

                </td>


                <td>
                    #${escapeHTML(customer.id)}
                </td>


                <td>
                    <span class="method ${method}">
                        ${methodLabel}
                    </span>
                </td>


                <td>

                    <button
                        class="btn-detail"
                        data-customer-id="${escapeHTML(customer.id)}"
                    >
                        Detail
                    </button>

                </td>

            </tr>

        `;

    }).join("");

}


// ============================================
// DETAIL CUSTOMER
// ============================================

function showCustomerDetail(id) {

    const customer = customers.find(item =>
        String(item.id) === String(id)
    );

    if (!customer) return;


    const method = getRegistrationMethod(customer);

    const avatarElement = document.getElementById("detailAvatar");


    document.getElementById("detailName").textContent =
        customer.name || "Tanpa Nama";

    document.getElementById("detailEmail").textContent =
        customer.email || "-";

    document.getElementById("detailId").textContent =
        customer.id ?? "-";

    document.getElementById("detailFullName").textContent =
        customer.name || "-";

    document.getElementById("detailEmailValue").textContent =
        customer.email || "-";

    document.getElementById("detailMethod").textContent =
        method === "google" ? "Google Login" : "Email & Password";


    avatarElement.replaceChildren();

    if (customer.profile_picture) {

        const img = document.createElement("img");

        img.src = customer.profile_picture;
        img.alt = "Foto profil customer";

        img.onerror = () => {
            avatarElement.textContent = getInitials(customer.name);
        };

        avatarElement.appendChild(img);

    } else {

        avatarElement.textContent = getInitials(customer.name);

    }


    detailModal.classList.add("show");

}


// ============================================
// EVENT DETAIL
// ============================================

customerTable.addEventListener("click", event => {

    const button = event.target.closest(".btn-detail");

    if (!button) return;

    showCustomerDetail(button.dataset.customerId);

});


// ============================================
// TUTUP MODAL
// ============================================

function closeDetailModal() {

    detailModal.classList.remove("show");

}


document.getElementById("closeModal")
    .addEventListener("click", closeDetailModal);


document.getElementById("closeDetailBtn")
    .addEventListener("click", closeDetailModal);


detailModal.addEventListener("click", event => {

    if (event.target === detailModal) {
        closeDetailModal();
    }

});


// ============================================
// SEARCH DAN FILTER
// ============================================

searchInput.addEventListener("input", renderCustomers);

methodFilter.addEventListener("change", renderCustomers);


// ============================================
// REFRESH DATA
// ============================================

document.getElementById("refreshBtn")
    .addEventListener("click", loadCustomers);


// ============================================
// LOGOUT
// ============================================

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        const confirmation = confirm(
            "Apakah kamu yakin ingin logout?"
        );

        if (!confirmation) return;

        sessionStorage.removeItem("griyaresikUser");
        sessionStorage.removeItem("token");

        window.location.href = "login.html";

    });


// ============================================
// JALANKAN
// ============================================

loadCustomers();