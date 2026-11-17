// ================= DATA PEMBAYARAN =================

// Array sengaja dikosongkan.
// Data akan diisi setelah halaman terhubung dengan database.

const payments = [];


// ================= ELEMENT =================

const paymentTableBody = document.getElementById("paymentTableBody");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const methodFilter = document.getElementById("methodFilter");
const dateFilter = document.getElementById("dateFilter");

const totalPayments = document.getElementById("totalPayments");
const successPayments = document.getElementById("successPayments");
const waitingPayments = document.getElementById("waitingPayments");
const totalIncome = document.getElementById("totalIncome");

const detailModal = document.getElementById("detailModal");
const detailContent = document.getElementById("detailContent");
const proofContent = document.getElementById("proofContent");
const modalActions = document.getElementById("modalActions");


// ================= SESSION ADMIN =================

const userData = sessionStorage.getItem("griyaresikUser");

if (!userData) {

    window.location.href = "../login.html";

} else {

    try {

        const user = JSON.parse(userData);

        const adminName =
            user.name || user.nama || "Administrator";

        document.getElementById("adminName").textContent = adminName;

        document.getElementById("adminAvatar").textContent =
            adminName.charAt(0).toUpperCase();

    } catch (error) {

        console.error("Gagal membaca data admin:", error);

    }

}


// ================= FORMAT RUPIAH =================

function formatRupiah(amount) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);

}


// ================= FORMAT TANGGAL =================

function formatDate(date) {

    if (!date) return "-";

    return new Date(date + "T00:00:00").toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

}


// ================= STATUS =================

function getStatusClass(status) {

    switch (status) {

        case "Menunggu Pembayaran":
        case "Menunggu Verifikasi":
            return "status-waiting";

        case "Berhasil":
            return "status-done";

        case "Ditolak":
        case "Dikembalikan":
            return "status-cancel";

        default:
            return "status-process";

    }

}


// ================= RINGKASAN =================

function updateSummary() {

    totalPayments.textContent = payments.length;

    const success = payments.filter(item =>
        item.status === "Berhasil"
    );

    const waiting = payments.filter(item =>
        item.status === "Menunggu Pembayaran" ||
        item.status === "Menunggu Verifikasi"
    );

    const income = success.reduce((total, item) => {
        return total + item.amount;
    }, 0);

    successPayments.textContent = success.length;

    waitingPayments.textContent = waiting.length;

    totalIncome.textContent = formatRupiah(income);

}


// ================= TAMPILKAN TABEL =================

function renderPayments() {

    const keyword = searchInput.value.toLowerCase().trim();

    const selectedStatus = statusFilter.value;

    const selectedMethod = methodFilter.value;

    const selectedDate = dateFilter.value;


    const filteredPayments = payments.filter(item => {

        const searchMatch =

            item.id.toLowerCase().includes(keyword) ||

            item.orderId.toLowerCase().includes(keyword) ||

            item.customer.toLowerCase().includes(keyword);


        const statusMatch =
            !selectedStatus || item.status === selectedStatus;


        const methodMatch =
            !selectedMethod || item.method === selectedMethod;


        const dateMatch =
            !selectedDate || item.date === selectedDate;


        return searchMatch &&
            statusMatch &&
            methodMatch &&
            dateMatch;

    });


    paymentTableBody.innerHTML = "";


    if (filteredPayments.length === 0) {

        paymentTableBody.innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="empty-state">

                        <div class="empty-icon">💳</div>

                        <h3>Belum Ada Transaksi</h3>

                        <p>
                            Belum terdapat data pembayaran.
                            Transaksi akan ditampilkan setelah
                            customer melakukan pembayaran.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        updateSummary();

        return;

    }


    filteredPayments.forEach(item => {

        const initial = item.customer.charAt(0).toUpperCase();

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>
                <span class="order-id">${item.id}</span>
            </td>

            <td>

                <div class="customer-info">

                    <div class="avatar">${initial}</div>

                    <div>

                        <span class="customer-name">
                            ${item.customer}
                        </span>

                        <span class="customer-phone">
                            ${item.phone}
                        </span>

                    </div>

                </div>

            </td>

            <td>
                <span class="order-id">${item.orderId}</span>
            </td>

            <td>
                <span class="payment-method">${item.method}</span>
            </td>

            <td>
                ${formatDate(item.date)}
            </td>

            <td>
                <span class="total-price">
                    ${formatRupiah(item.amount)}
                </span>
            </td>

            <td>

                <span class="status ${getStatusClass(item.status)}">
                    ${item.status}
                </span>

            </td>

            <td>

                <button
                    class="btn-detail"
                    data-id="${item.id}"
                    type="button"
                >
                    Detail
                </button>

            </td>

        `;


        paymentTableBody.appendChild(row);

    });


    updateSummary();

}


// ================= DETAIL PEMBAYARAN =================

function showDetail(id) {

    const item = payments.find(payment => payment.id === id);

    if (!item) return;


    detailContent.innerHTML = `

        <div class="detail-row">
            <span>ID Pembayaran</span>
            <span>${item.id}</span>
        </div>

        <div class="detail-row">
            <span>ID Pemesanan</span>
            <span>${item.orderId}</span>
        </div>

        <div class="detail-row">
            <span>Nama Customer</span>
            <span>${item.customer}</span>
        </div>

        <div class="detail-row">
            <span>Email</span>
            <span>${item.email}</span>
        </div>

        <div class="detail-row">
            <span>Nomor Telepon</span>
            <span>${item.phone}</span>
        </div>

        <div class="detail-row">
            <span>Jenis Layanan</span>
            <span>${item.service}</span>
        </div>

        <div class="detail-row">
            <span>Metode Pembayaran</span>
            <span>${item.method}</span>
        </div>

        <div class="detail-row">
            <span>Tanggal Transaksi</span>
            <span>${formatDate(item.date)}</span>
        </div>

        <div class="detail-row">
            <span>Total Pembayaran</span>
            <span>${formatRupiah(item.amount)}</span>
        </div>

        <div class="detail-row">
            <span>Status</span>
            <span class="status ${getStatusClass(item.status)}">
                ${item.status}
            </span>
        </div>

    `;


    // TAMPILKAN BUKTI PEMBAYARAN

    if (item.proof) {

        const image = document.createElement("img");

        image.src = item.proof;

        image.alt = "Bukti Pembayaran";

        image.className = "proof-image";

        proofContent.innerHTML = "";

        proofContent.appendChild(image);

    } else {

        proofContent.textContent =
            "Belum ada bukti pembayaran yang diunggah.";

    }


    // TOMBOL MODAL

    modalActions.innerHTML = `

        <button class="btn-close" id="closeDetailBtn" type="button">
            Tutup
        </button>

    `;


    if (
        item.method === "Transfer Bank" &&
        item.status === "Menunggu Verifikasi"
    ) {

        modalActions.innerHTML += `

            <button
                class="btn-reject"
                id="rejectPaymentBtn"
                type="button"
            >
                Tolak
            </button>

            <button
                class="btn-approve"
                id="approvePaymentBtn"
                type="button"
            >
                Verifikasi
            </button>

        `;

    }


    detailModal.classList.add("show");


    document.getElementById("closeDetailBtn")
        .addEventListener("click", closeDetailModal);


    const approveButton = document.getElementById("approvePaymentBtn");

    if (approveButton) {

        approveButton.addEventListener("click", function() {

            updatePaymentStatus(id, "Berhasil");

        });

    }


    const rejectButton = document.getElementById("rejectPaymentBtn");

    if (rejectButton) {

        rejectButton.addEventListener("click", function() {

            updatePaymentStatus(id, "Ditolak");

        });

    }

}


// ================= VERIFIKASI PEMBAYARAN =================

function updatePaymentStatus(id, status) {

    const item = payments.find(payment => payment.id === id);

    if (!item) return;


    const confirmation = confirm(
        `Apakah kamu yakin ingin mengubah status pembayaran menjadi ${status}?`
    );

    if (!confirmation) return;


    item.status = status;

    closeDetailModal();

    renderPayments();

    alert("Status pembayaran berhasil diperbarui.");

}


// ================= TUTUP MODAL =================

function closeDetailModal() {

    detailModal.classList.remove("show");

}


// ================= EVENT MODAL =================

document.getElementById("closeModal")
    .addEventListener("click", closeDetailModal);


detailModal.addEventListener("click", function(event) {

    if (event.target === detailModal) {

        closeDetailModal();

    }

});


// ================= EVENT DETAIL =================

paymentTableBody.addEventListener("click", function(event) {

    const button = event.target.closest(".btn-detail");

    if (!button) return;

    showDetail(button.dataset.id);

});


// ================= SEARCH DAN FILTER =================

searchInput.addEventListener("input", renderPayments);

statusFilter.addEventListener("change", renderPayments);

methodFilter.addEventListener("change", renderPayments);

dateFilter.addEventListener("change", renderPayments);


// ================= REFRESH =================

document.getElementById("refreshBtn")
    .addEventListener("click", function() {

        renderPayments();

    });


// ================= MOBILE SIDEBAR =================

const sidebar = document.getElementById("sidebar");

document.getElementById("mobileToggle")
    .addEventListener("click", function() {

        sidebar.classList.toggle("show");

    });


// ================= LOGOUT =================

document.getElementById("logoutBtn")
    .addEventListener("click", function() {

        const confirmLogout = confirm(
            "Apakah kamu yakin ingin logout?"
        );

        if (confirmLogout) {

            sessionStorage.removeItem("griyaresikUser");

            sessionStorage.removeItem("token");

            window.location.href = "../login.html";

        }

    });


// ================= INITIAL =================

renderPayments();