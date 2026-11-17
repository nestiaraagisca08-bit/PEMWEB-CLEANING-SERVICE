document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. SESSION DAN AUTENTIKASI
    // ==========================================

    const userData = sessionStorage.getItem("griyaresikUser");
    const token = sessionStorage.getItem("token");

    if (!userData || !token) {
        window.location.href = "../login.html";
        return;
    }

    let currentUser = {};

    try {
        currentUser = JSON.parse(userData);
    } catch (error) {
        console.error("Gagal membaca data pengguna:", error);
    }

    // ==========================================
    // 2. ELEMENT HTML
    // ==========================================

    const adminName = document.getElementById("adminName");
    const adminAvatar = document.getElementById("adminAvatar");

    const totalOrders = document.getElementById("totalOrders");
    const totalRevenue = document.getElementById("totalRevenue");
    const completedOrders = document.getElementById("completedOrders");

    const reportTable = document.getElementById("reportTable");

    const searchInput = document.getElementById("searchInput");
    const periodFilter = document.getElementById("periodFilter");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");

    const refreshBtn = document.getElementById("refreshBtn");
    const exportBtn = document.getElementById("exportBtn");
    const printBtn = document.getElementById("printBtn");

    const detailModal = document.getElementById("detailModal");
    const closeModal = document.getElementById("closeModal");
    const closeDetailBtn = document.getElementById("closeDetailBtn");

    const mobileToggle = document.getElementById("mobileToggle");
    const sidebar = document.getElementById("sidebar");
    const logoutBtn = document.getElementById("logoutBtn");

    // ==========================================
    // 3. PROFIL ADMIN
    // ==========================================

    const displayName =
        currentUser.name ||
        currentUser.nama ||
        currentUser.fullName ||
        "nestiara agisca";

    if (adminName) {
        adminName.textContent = displayName;
    }

    if (adminAvatar) {
        adminAvatar.textContent = displayName.charAt(0).toUpperCase();
    }

    // ==========================================
    // 4. DATA LAPORAN
    // ==========================================

    /*
        Data masih kosong karena belum terhubung
        dengan database PostgreSQL.

        Nanti data laporan dapat diambil dari API
        backend GriyaResik.
    */

    let reports = [];

    let filteredReports = [];

    // ==========================================
    // 5. FORMAT RUPIAH
    // ==========================================

    function formatRupiah(amount) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(Number(amount) || 0);
    }

    // ==========================================
    // 6. FORMAT TANGGAL
    // ==========================================

    function formatDate(date) {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function getDateOnly(date) {
        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return "";
        }

        return [
            parsedDate.getFullYear(),
            String(parsedDate.getMonth() + 1).padStart(2, "0"),
            String(parsedDate.getDate()).padStart(2, "0")
        ].join("-");
    }

    // ==========================================
    // 7. FORMAT STATUS
    // ==========================================

    function getStatusClass(status) {
        const value = String(status || "").toLowerCase();

        if (
            value.includes("selesai") ||
            value.includes("berhasil")
        ) {
            return "status-done";
        }

        if (
            value.includes("proses") ||
            value.includes("dikerjakan")
        ) {
            return "status-process";
        }

        if (
            value.includes("batal") ||
            value.includes("ditolak")
        ) {
            return "status-cancel";
        }

        return "status-waiting";
    }

    // ==========================================
    // 8. RINGKASAN LAPORAN
    // ==========================================

    function renderSummary(data) {

        const completed = data.filter(item =>
            String(item.status || "").toLowerCase() === "selesai"
        );

        const revenue = data
            .filter(item =>
                String(item.paymentStatus || "").toLowerCase() === "berhasil"
            )
            .reduce((total, item) => {
                return total + Number(item.amount || 0);
            }, 0);

        totalOrders.textContent = data.length;

        totalRevenue.textContent = formatRupiah(revenue);

        completedOrders.textContent = completed.length;
    }

    // ==========================================
    // 9. TABEL LAPORAN
    // ==========================================

    function renderTable(data) {

        if (!data.length) {
            reportTable.innerHTML = `
                <tr>
                    <td colspan="9" class="message-row">
                        Belum ada data laporan.
                    </td>
                </tr>
            `;

            return;
        }

        reportTable.innerHTML = data.map((item, index) => {

            const name = item.customer || "-";

            const initial = name.charAt(0).toUpperCase();

            return `
                <tr>

                    <td>${index + 1}</td>

                    <td>
                        <strong>${escapeHTML(item.id || "-")}</strong>
                    </td>

                    <td>
                        ${formatDate(item.date)}
                    </td>

                    <td>
                        <div class="customer-info">

                            <div class="avatar">
                                ${escapeHTML(initial)}
                            </div>

                            <div>
                                <div class="customer-name">
                                    ${escapeHTML(name)}
                                </div>

                                <div class="customer-email">
                                    ${escapeHTML(item.email || "-")}
                                </div>
                            </div>

                        </div>
                    </td>

                    <td>
                        ${escapeHTML(item.service || "-")}
                    </td>

                    <td>
                        ${escapeHTML(item.staff || "-")}
                    </td>

                    <td>
                        <span class="total-price">
                            ${formatRupiah(item.amount)}
                        </span>
                    </td>

                    <td>
                        <span class="status ${getStatusClass(item.status)}">
                            ${escapeHTML(item.status || "Menunggu")}
                        </span>
                    </td>

                    <td>
                        <button
                            class="btn-detail"
                            data-id="${escapeHTML(item.id || "")}"
                            type="button"
                        >
                            Detail
                        </button>
                    </td>

                </tr>
            `;

        }).join("");

    }

    // ==========================================
    // 10. MENCEGAH HTML INJECTION
    // ==========================================

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[char];
        });
    }

    // ==========================================
    // 11. GRAFIK PENDAPATAN
    // ==========================================

    function renderRevenueChart(data) {

        const chart = document.getElementById("revenueChart");

        const paidData = data.filter(item =>
            String(item.paymentStatus || "").toLowerCase() === "berhasil"
        );

        if (!paidData.length) {
            chart.innerHTML = `
                <div class="chart-empty">
                    <span>📊</span>
                    Belum ada data pendapatan.
                </div>
            `;

            return;
        }

        const monthlyData = {};

        paidData.forEach(item => {

            const date = new Date(item.date);

            if (isNaN(date.getTime())) return;

            const month = date.toLocaleDateString("id-ID", {
                month: "short",
                year: "2-digit"
            });

            monthlyData[month] =
                (monthlyData[month] || 0) + Number(item.amount || 0);

        });

        const entries = Object.entries(monthlyData).slice(-6);

        const maxValue = Math.max(
            ...entries.map(item => item[1]),
            1
        );

        chart.innerHTML = `
            <div class="bar-chart">

                ${entries.map(([month, amount]) => {

                    const height = Math.max(
                        (amount / maxValue) * 160,
                        5
                    );

                    return `
                        <div class="bar-item">

                            <div
                                class="bar"
                                style="height:${height}px"
                                title="${formatRupiah(amount)}"
                            ></div>

                            <span class="bar-label">
                                ${escapeHTML(month)}
                            </span>

                        </div>
                    `;

                }).join("")}

            </div>
        `;
    }

    // ==========================================
    // 12. GRAFIK PEMESANAN
    // ==========================================

    function renderOrdersChart(data) {

        const chart = document.getElementById("ordersChart");

        if (!data.length) {
            chart.innerHTML = `
                <div class="chart-empty">
                    <span>📋</span>
                    Belum ada data pemesanan.
                </div>
            `;

            return;
        }

        const monthlyData = {};

        data.forEach(item => {

            const date = new Date(item.date);

            if (isNaN(date.getTime())) return;

            const month = date.toLocaleDateString("id-ID", {
                month: "short",
                year: "2-digit"
            });

            monthlyData[month] = (monthlyData[month] || 0) + 1;

        });

        const entries = Object.entries(monthlyData).slice(-6);

        const maxValue = Math.max(
            ...entries.map(item => item[1]),
            1
        );

        chart.innerHTML = `
            <div class="bar-chart">

                ${entries.map(([month, total]) => {

                    const height = Math.max(
                        (total / maxValue) * 160,
                        5
                    );

                    return `
                        <div class="bar-item">

                            <div
                                class="bar"
                                style="height:${height}px"
                                title="${total} pemesanan"
                            ></div>

                            <span class="bar-label">
                                ${escapeHTML(month)}
                            </span>

                        </div>
                    `;

                }).join("")}

            </div>
        `;
    }

    // ==========================================
    // 13. FILTER TANGGAL
    // ==========================================

    function filterByPeriod(data) {

        const period = periodFilter.value;

        const now = new Date();

        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        return data.filter(item => {

            const date = new Date(item.date);

            if (isNaN(date.getTime())) return false;

            const itemDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );

            if (period === "all") {
                return true;
            }

            if (period === "today") {
                return itemDate.getTime() === today.getTime();
            }

            if (period === "week") {

                const firstDay = new Date(today);

                const day = firstDay.getDay();

                firstDay.setDate(
                    firstDay.getDate() - (day === 0 ? 6 : day - 1)
                );

                return itemDate >= firstDay && itemDate <= today;
            }

            if (period === "month") {

                return (
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                );
            }

            if (period === "year") {
                return date.getFullYear() === now.getFullYear();
            }

            if (period === "custom") {

                const start = startDate.value;
                const end = endDate.value;

                if (start && getDateOnly(date) < start) {
                    return false;
                }

                if (end && getDateOnly(date) > end) {
                    return false;
                }

                return true;
            }

            return true;

        });
    }

    // ==========================================
    // 14. SEARCH LAPORAN
    // ==========================================

    function searchReports(data) {

        const keyword = searchInput.value
            .toLowerCase()
            .trim();

        if (!keyword) {
            return data;
        }

        return data.filter(item => {

            return (
                String(item.id || "").toLowerCase().includes(keyword) ||
                String(item.customer || "").toLowerCase().includes(keyword) ||
                String(item.service || "").toLowerCase().includes(keyword) ||
                String(item.staff || "").toLowerCase().includes(keyword)
            );

        });
    }

    // ==========================================
    // 15. PROSES FILTER
    // ==========================================

    function applyFilters() {

        let result = filterByPeriod(reports);

        result = searchReports(result);

        filteredReports = result;

        renderSummary(result);

        renderTable(result);

        renderRevenueChart(result);

        renderOrdersChart(result);
    }

    // ==========================================
    // 16. MODAL DETAIL
    // ==========================================

    function showDetail(id) {

        const item = reports.find(report =>
            String(report.id) === String(id)
        );

        if (!item) return;

        document.getElementById("detailOrderId").textContent =
            item.id || "-";

        document.getElementById("detailCustomer").textContent =
            item.customer || "-";

        document.getElementById("detailCustomerName").textContent =
            item.customer || "-";

        document.getElementById("detailDate").textContent =
            formatDate(item.date);

        document.getElementById("detailService").textContent =
            item.service || "-";

        document.getElementById("detailStaff").textContent =
            item.staff || "-";

        document.getElementById("detailAmount").textContent =
            formatRupiah(item.amount);

        document.getElementById("detailStatus").textContent =
            item.status || "-";

        document.getElementById("detailPaymentStatus").textContent =
            item.paymentStatus || "-";

        detailModal.classList.add("show");
    }

    function hideDetail() {
        detailModal.classList.remove("show");
    }

    reportTable.addEventListener("click", event => {

        const button = event.target.closest(".btn-detail");

        if (!button) return;

        showDetail(button.dataset.id);

    });

    closeModal.addEventListener("click", hideDetail);

    closeDetailBtn.addEventListener("click", hideDetail);

    detailModal.addEventListener("click", event => {

        if (event.target === detailModal) {
            hideDetail();
        }

    });

    // ==========================================
    // 17. EXPORT CSV
    // ==========================================

    function exportCSV() {

        if (!filteredReports.length) {
            alert("Tidak ada data laporan untuk diekspor.");
            return;
        }

        const headers = [
            "ID Pemesanan",
            "Tanggal",
            "Customer",
            "Email",
            "Layanan",
            "Petugas",
            "Total Pembayaran",
            "Status Pemesanan",
            "Status Pembayaran"
        ];

        const rows = filteredReports.map(item => [

            item.id,
            formatDate(item.date),
            item.customer,
            item.email,
            item.service,
            item.staff,
            item.amount,
            item.status,
            item.paymentStatus

        ]);

        function escapeCSV(value) {
            return `"${String(value ?? "").replace(/"/g, '""')}"`;
        }

        const csvContent = [
            headers,
            ...rows
        ].map(row => row.map(escapeCSV).join(";")).join("\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "laporan-griyaresik.csv";

        document.body.appendChild(link);

        link.click();

        link.remove();

        URL.revokeObjectURL(url);
    }

    // ==========================================
    // 18. EVENT FILTER
    // ==========================================

    searchInput.addEventListener("input", applyFilters);

    periodFilter.addEventListener("change", () => {

        const isCustom = periodFilter.value === "custom";

        startDate.style.display = isCustom ? "block" : "none";

        endDate.style.display = isCustom ? "block" : "none";

        applyFilters();

    });

    startDate.addEventListener("change", applyFilters);

    endDate.addEventListener("change", applyFilters);

    // ==========================================
    // 19. REFRESH DATA
    // ==========================================

    refreshBtn.addEventListener("click", () => {

        applyFilters();

        alert("Data laporan berhasil diperbarui.");

    });

    // ==========================================
    // 20. CETAK LAPORAN
    // ==========================================

    printBtn.addEventListener("click", () => {
        window.print();
    });

    // ==========================================
    // 21. EXPORT DATA
    // ==========================================

    exportBtn.addEventListener("click", exportCSV);

    // ==========================================
    // 22. MOBILE SIDEBAR
    // ==========================================

    mobileToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
    });

    document.addEventListener("click", event => {

        if (
            window.innerWidth <= 750 &&
            !sidebar.contains(event.target) &&
            !mobileToggle.contains(event.target)
        ) {
            sidebar.classList.remove("show");
        }

    });

    // ==========================================
    // 23. LOGOUT
    // ==========================================

    logoutBtn.addEventListener("click", () => {

        const confirmLogout = confirm(
            "Apakah kamu yakin ingin keluar dari akun?"
        );

        if (!confirmLogout) return;

        sessionStorage.removeItem("griyaresikUser");

        sessionStorage.removeItem("token");

        window.location.href = "../login.html";

    });

    // ==========================================
    // 24. INISIALISASI HALAMAN
    // ==========================================

    function init() {

        filteredReports = [...reports];

        renderSummary(reports);

        renderTable(reports);

        renderRevenueChart(reports);

        renderOrdersChart(reports);

    }

    init();

});