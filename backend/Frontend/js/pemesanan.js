// ==================================================
// GRIYARESIK - DATA PEMESANAN
// ==================================================


// ==================================================
// 1. CEK LOGIN ADMIN
// ==================================================

const userData = sessionStorage.getItem("griyaresikUser");

let currentUser = null;

try {
    currentUser = JSON.parse(userData) || {};
} catch (error) {
    currentUser = {};
}

if (!userData || !currentUser.role) {

    alert("Silakan login terlebih dahulu.");

    window.location.href = "../login.html";

}


// ==================================================
// 2. PROFIL ADMIN
// ==================================================

const adminName =

    currentUser.name ||
    currentUser.nama ||
    currentUser.fullName ||
    "Administrator";

document.getElementById("adminName").textContent = adminName;

document.getElementById("adminAvatar").textContent =
    adminName.charAt(0).toUpperCase();


// ==================================================
// 3. LOGOUT
// ==================================================

document.getElementById("logoutBtn").addEventListener("click", function() {

    const confirmation = confirm(
        "Apakah kamu yakin ingin logout?"
    );

    if (!confirmation) return;

    sessionStorage.removeItem("griyaresikUser");

    sessionStorage.removeItem("token");

    window.location.href = "../login.html";

});


// ==================================================
// 4. MOBILE SIDEBAR
// ==================================================

const sidebar = document.getElementById("sidebar");

document.getElementById("mobileToggle").addEventListener("click", function() {

    sidebar.classList.toggle("show");

});


// ==================================================
// 5. DATA PEMESANAN
// ==================================================

// Data masih kosong karena belum dihubungkan
// dengan endpoint database.

let bookings = [];


// ==================================================
// 6. FORMAT RUPIAH
// ==================================================

function formatRupiah(value) {

    return "Rp " + Number(value || 0).toLocaleString("id-ID");

}


// ==================================================
// 7. FORMAT TANGGAL
// ==================================================

function formatTanggal(date) {

    if (!date) return "-";

    const tanggal = new Date(date + "T00:00:00");

    if (isNaN(tanggal.getTime())) return date;

    return tanggal.toLocaleDateString("id-ID", {

        day: "2-digit",

        month: "long",

        year: "numeric"

    });

}


// ==================================================
// 8. UPDATE STATISTIK
// ==================================================

function updateStats() {

    document.getElementById("totalBookings").textContent =
        bookings.length;

    document.getElementById("waitingBookings").textContent =

        bookings.filter(booking =>

            booking.status === "Menunggu Konfirmasi"

        ).length;


    document.getElementById("processBookings").textContent =

        bookings.filter(booking =>

            booking.status === "Sedang Dikerjakan"

        ).length;


    document.getElementById("doneBookings").textContent =

        bookings.filter(booking =>

            booking.status === "Selesai"

        ).length;

}


// ==================================================
// 9. CLASS STATUS
// ==================================================

function getStatusClass(status) {

    switch (status) {

        case "Menunggu Konfirmasi":
            return "status-waiting";

        case "Sedang Dikerjakan":
            return "status-process";

        case "Selesai":
            return "status-done";

        case "Dibatalkan":
            return "status-cancel";

        default:
            return "";

    }

}


// ==================================================
// 10. ESCAPE HTML
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
// 11. MENAMPILKAN DATA PEMESANAN
// ==================================================

function renderBookings() {

    const tableBody = document.getElementById("bookingTableBody");

    const searchValue = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    const statusValue =
        document.getElementById("statusFilter").value;

    const dateValue =
        document.getElementById("dateFilter").value;


    const filtered = bookings.filter(booking => {

        const matchesSearch =

            String(booking.id || "")
                .toLowerCase()
                .includes(searchValue)

            ||

            String(booking.customer || "")
                .toLowerCase()
                .includes(searchValue);


        const matchesStatus =

            statusValue === "" ||

            booking.status === statusValue;


        const matchesDate =

            dateValue === "" ||

            booking.date === dateValue;


        return matchesSearch && matchesStatus && matchesDate;

    });


    tableBody.innerHTML = "";


    // JIKA DATA KOSONG

    if (filtered.length === 0) {

        tableBody.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="empty-state">

                        <div class="empty-icon">
                            📭
                        </div>

                        <h3>Belum Ada Data Pemesanan</h3>

                        <p>
                            Data pemesanan customer akan muncul
                            setelah terdapat transaksi pemesanan.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    // JIKA DATA TERSEDIA

    filtered.forEach(booking => {

        const initial = String(booking.customer || "C")
            .charAt(0)
            .toUpperCase();

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>

                <span class="order-id">
                    ${escapeHTML(booking.id)}
                </span>

            </td>


            <td>

                <div class="customer-info">

                    <div class="avatar">
                        ${escapeHTML(initial)}
                    </div>

                    <div>

                        <span class="customer-name">
                            ${escapeHTML(booking.customer)}
                        </span>

                        <span class="customer-phone">
                            ${escapeHTML(booking.phone || "-")}
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <span class="service-name">
                    ${escapeHTML(booking.service)}
                </span>

            </td>


            <td>
                ${escapeHTML(formatTanggal(booking.date))}
            </td>


            <td>

                <span class="total-price">
                    ${formatRupiah(booking.total)}
                </span>

            </td>


            <td>

                <span class="status ${getStatusClass(booking.status)}">
                    ${escapeHTML(booking.status)}
                </span>

            </td>


            <td>

                <button
                    class="btn-detail"
                    type="button"
                    data-booking-id="${escapeHTML(booking.id)}"
                >
                    Detail
                </button>

            </td>

        `;

        tableBody.appendChild(row);

    });

}


// ==================================================
// 12. DETAIL PEMESANAN
// ==================================================

function showDetail(id) {

    const booking = bookings.find(

        item => String(item.id) === String(id)

    );

    if (!booking) return;


    const detailContent = document.getElementById("detailContent");


    detailContent.innerHTML = `

        <div class="detail-row">

            <span>ID Pemesanan</span>

            <span>${escapeHTML(booking.id)}</span>

        </div>


        <div class="detail-row">

            <span>Nama Customer</span>

            <span>${escapeHTML(booking.customer)}</span>

        </div>


        <div class="detail-row">

            <span>Nomor Telepon</span>

            <span>${escapeHTML(booking.phone || "-")}</span>

        </div>


        <div class="detail-row">

            <span>Layanan</span>

            <span>${escapeHTML(booking.service)}</span>

        </div>


        <div class="detail-row">

            <span>Tanggal Pemesanan</span>

            <span>${escapeHTML(formatTanggal(booking.date))}</span>

        </div>


        <div class="detail-row">

            <span>Total Pembayaran</span>

            <span>${formatRupiah(booking.total)}</span>

        </div>


        <div class="detail-row">

            <span>Status Pemesanan</span>

            <span>
                <span class="status ${getStatusClass(booking.status)}">
                    ${escapeHTML(booking.status)}
                </span>
            </span>

        </div>

    `;


    document.getElementById("detailModal").classList.add("show");

}


// ==================================================
// 13. EVENT TOMBOL DETAIL
// ==================================================

document.getElementById("bookingTableBody")
    .addEventListener("click", function(event) {

        const button = event.target.closest(".btn-detail");

        if (!button) return;

        const id = button.dataset.bookingId;

        showDetail(id);

    });


// ==================================================
// 14. TUTUP MODAL
// ==================================================

function closeModal() {

    document.getElementById("detailModal")
        .classList.remove("show");

}


document.getElementById("closeModal")
    .addEventListener("click", closeModal);


document.getElementById("closeDetailBtn")
    .addEventListener("click", closeModal);


document.getElementById("detailModal")
    .addEventListener("click", function(event) {

        if (event.target === this) {

            closeModal();

        }

    });


// ==================================================
// 15. PENCARIAN DAN FILTER
// ==================================================

document.getElementById("searchInput")
    .addEventListener("input", renderBookings);


document.getElementById("statusFilter")
    .addEventListener("change", renderBookings);


document.getElementById("dateFilter")
    .addEventListener("change", renderBookings);


// ==================================================
// 16. REFRESH DATA
// ==================================================

document.getElementById("refreshBtn")
    .addEventListener("click", function() {

        this.disabled = true;

        this.textContent = "Memuat...";

        renderBookings();

        setTimeout(() => {

            this.disabled = false;

            this.textContent = "↻ Refresh Data";

        }, 500);

    });


// ==================================================
// 17. INISIALISASI
// ==================================================

updateStats();

renderBookings();