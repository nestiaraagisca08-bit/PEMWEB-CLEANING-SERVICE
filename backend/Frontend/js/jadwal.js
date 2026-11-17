document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // 1. SESSION DAN PROFIL ADMIN
    // =========================================

    const userData = sessionStorage.getItem("griyaresikUser");

    if (!userData) {
        window.location.href = "../login.html";
        return;
    }

    // Profil administrator sesuai permintaan
    const adminName = document.getElementById("adminName");
    const profileAvatar = document.getElementById("profileAvatar");

    if (adminName) {
        adminName.textContent = "nestiara agisca";
    }

    if (profileAvatar) {
        profileAvatar.textContent = "N";
    }


    // =========================================
    // 2. DATA JADWAL
    // =========================================

    // Data jadwal masih kosong.
    // Nantinya dapat dihubungkan dengan database PostgreSQL.

    let schedules = JSON.parse(
        localStorage.getItem("griyaresikSchedules") || "[]"
    );

    let staffList = JSON.parse(
        localStorage.getItem("griyaresikStaff") || "[]"
    );


    // =========================================
    // 3. MENGAMBIL ELEMENT HTML
    // =========================================

    const sidebar = document.getElementById("sidebar");
    const mobileToggle = document.getElementById("mobileToggle");

    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const dateFilter = document.getElementById("dateFilter");

    const scheduleTableBody =
        document.getElementById("scheduleTableBody");

    const refreshBtn = document.getElementById("refreshBtn");

    const detailModal = document.getElementById("detailModal");
    const scheduleModal = document.getElementById("scheduleModal");

    const scheduleForm = document.getElementById("scheduleForm");


    // =========================================
    // 4. FUNGSI FORMAT TANGGAL
    // =========================================

    function formatDate(date) {

        if (!date) return "-";

        const parsedDate = new Date(date + "T00:00:00");

        if (isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

    }


    // =========================================
    // 5. FUNGSI FORMAT JAM
    // =========================================

    function formatTime(time) {

        if (!time) return "-";

        return time;

    }


    // =========================================
    // 6. FUNGSI FORMAT STATUS
    // =========================================

    function getStatusClass(status) {

        switch (status) {

            case "Menunggu Penugasan":
                return "status-waiting";

            case "Petugas Ditugaskan":
                return "status-process";

            case "Sedang Dikerjakan":
                return "status-process";

            case "Selesai":
                return "status-done";

            case "Dibatalkan":
                return "status-cancel";

            default:
                return "status-waiting";

        }

    }


    // =========================================
    // 7. FUNGSI SIMPAN DATA
    // =========================================

    function saveSchedules() {

        localStorage.setItem(
            "griyaresikSchedules",
            JSON.stringify(schedules)
        );

    }


    // =========================================
    // 8. RINGKASAN JADWAL
    // =========================================

    function renderSummary() {

        const today = new Date();

        const todayString =
            today.getFullYear() + "-" +
            String(today.getMonth() + 1).padStart(2, "0") + "-" +
            String(today.getDate()).padStart(2, "0");

        const totalSchedules = schedules.length;

        const todaySchedules = schedules.filter(item => {
            return item.date === todayString;
        }).length;

        const waitingSchedules = schedules.filter(item => {
            return item.status === "Menunggu Penugasan";
        }).length;

        const doneSchedules = schedules.filter(item => {
            return item.status === "Selesai";
        }).length;


        document.getElementById("totalSchedules").textContent =
            totalSchedules;

        document.getElementById("todaySchedules").textContent =
            todaySchedules;

        document.getElementById("waitingSchedules").textContent =
            waitingSchedules;

        document.getElementById("doneSchedules").textContent =
            doneSchedules;

    }


    // =========================================
    // 9. FUNGSI FILTER JADWAL
    // =========================================

    function getFilteredSchedules() {

        const keyword = searchInput.value
            .toLowerCase()
            .trim();

        const selectedStatus = statusFilter.value;
        const selectedDate = dateFilter.value;


        return schedules.filter(item => {

            const searchMatch =
                String(item.id || "").toLowerCase().includes(keyword) ||

                String(item.customer || "")
                    .toLowerCase()
                    .includes(keyword) ||

                String(item.staff || "")
                    .toLowerCase()
                    .includes(keyword) ||

                String(item.service || "")
                    .toLowerCase()
                    .includes(keyword);


            const statusMatch =
                !selectedStatus ||
                item.status === selectedStatus;


            const dateMatch =
                !selectedDate ||
                item.date === selectedDate;


            return searchMatch && statusMatch && dateMatch;

        });

    }


    // =========================================
    // 10. MENAMPILKAN TABEL JADWAL
    // =========================================

    function renderSchedules() {

        const filteredSchedules = getFilteredSchedules();


        if (filteredSchedules.length === 0) {

            scheduleTableBody.innerHTML = `
                <tr>
                    <td colspan="8">

                        <div class="empty-state">

                            <div class="empty-icon">📅</div>

                            <h3>
                                Belum Ada Data Jadwal
                            </h3>

                            <p>
                                Jadwal pengerjaan layanan akan muncul
                                setelah terdapat pemesanan.
                            </p>

                        </div>

                    </td>
                </tr>
            `;

            renderSummary();

            return;

        }


        scheduleTableBody.innerHTML =
            filteredSchedules.map(item => {

                const initial = String(item.customer || "C")
                    .charAt(0)
                    .toUpperCase();

                return `

                    <tr>

                        <td>
                            <span class="order-id">
                                ${escapeHTML(item.id)}
                            </span>
                        </td>

                        <td>

                            <div class="customer-info">

                                <div class="avatar">
                                    ${escapeHTML(initial)}
                                </div>

                                <div>
                                    <span class="customer-name">
                                        ${escapeHTML(item.customer || "-")}
                                    </span>
                                </div>

                            </div>

                        </td>

                        <td>
                            <span class="service-name">
                                ${escapeHTML(item.service || "-")}
                            </span>
                        </td>

                        <td>
                            ${escapeHTML(item.staff || "Belum ditugaskan")}
                        </td>

                        <td>
                            ${formatDate(item.date)}
                        </td>

                        <td>
                            ${escapeHTML(formatTime(item.time))}
                        </td>

                        <td>

                            <span class="status ${getStatusClass(item.status)}">
                                ${escapeHTML(item.status || "-")}
                            </span>

                        </td>

                        <td>

                            <button
                                class="btn-detail"
                                type="button"
                                data-action="detail"
                                data-id="${escapeHTML(item.id)}">

                                Detail

                            </button>

                            <button
                                class="btn-edit"
                                type="button"
                                data-action="edit"
                                data-id="${escapeHTML(item.id)}">

                                Atur

                            </button>

                        </td>

                    </tr>

                `;

            }).join("");


        renderSummary();

    }


    // =========================================
    // 11. FUNGSI ESCAPE HTML
    // =========================================

    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, function (char) {

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


    // =========================================
    // 12. DETAIL JADWAL
    // =========================================

    function showScheduleDetail(id) {

        const item = schedules.find(schedule => {
            return String(schedule.id) === String(id);
        });

        if (!item) return;


        document.getElementById("detailContent").innerHTML = `

            <div class="detail-row">
                <span>ID Jadwal</span>
                <span>${escapeHTML(item.id)}</span>
            </div>

            <div class="detail-row">
                <span>Nama Customer</span>
                <span>${escapeHTML(item.customer || "-")}</span>
            </div>

            <div class="detail-row">
                <span>Layanan</span>
                <span>${escapeHTML(item.service || "-")}</span>
            </div>

            <div class="detail-row">
                <span>Petugas</span>
                <span>${escapeHTML(item.staff || "Belum ditugaskan")}</span>
            </div>

            <div class="detail-row">
                <span>Tanggal</span>
                <span>${formatDate(item.date)}</span>
            </div>

            <div class="detail-row">
                <span>Jam</span>
                <span>${escapeHTML(item.time || "-")}</span>
            </div>

            <div class="detail-row">
                <span>Status</span>
                <span>
                    <span class="status ${getStatusClass(item.status)}">
                        ${escapeHTML(item.status || "-")}
                    </span>
                </span>
            </div>

        `;


        detailModal.classList.add("show");

    }


    // =========================================
    // 13. MENAMPILKAN DAFTAR PETUGAS
    // =========================================

    function renderStaffOptions() {

        const staffSelect =
            document.getElementById("scheduleStaff");

        staffSelect.innerHTML = `
            <option value="">Pilih Petugas</option>
        `;


        staffList.forEach(staff => {

            const option = document.createElement("option");

            option.value = staff.name;
            option.textContent = staff.name;

            staffSelect.appendChild(option);

        });

    }


    // =========================================
    // 14. MEMBUKA MODAL ATUR JADWAL
    // =========================================

    function openScheduleModal(id) {

        const item = schedules.find(schedule => {
            return String(schedule.id) === String(id);
        });

        if (!item) return;


        document.getElementById("scheduleId").value =
            item.id;

        document.getElementById("scheduleDate").value =
            item.date || "";

        document.getElementById("scheduleTime").value =
            item.time || "";

        document.getElementById("scheduleStatus").value =
            item.status || "Menunggu Penugasan";


        renderStaffOptions();


        const staffSelect =
            document.getElementById("scheduleStaff");

        if (item.staff) {

            const existingOption = Array.from(
                staffSelect.options
            ).find(option => option.value === item.staff);

            if (!existingOption) {

                const option = document.createElement("option");

                option.value = item.staff;
                option.textContent = item.staff;

                staffSelect.appendChild(option);

            }

            staffSelect.value = item.staff;

        }


        scheduleModal.classList.add("show");

    }


    // =========================================
    // 15. MENYIMPAN PERUBAHAN JADWAL
    // =========================================

    scheduleForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const id = document.getElementById("scheduleId").value;

        const item = schedules.find(schedule => {
            return String(schedule.id) === String(id);
        });

        if (!item) {

            alert("Data jadwal tidak ditemukan.");

            return;

        }


        const date =
            document.getElementById("scheduleDate").value;

        const time =
            document.getElementById("scheduleTime").value;

        const staff =
            document.getElementById("scheduleStaff").value;

        const status =
            document.getElementById("scheduleStatus").value;


        if (!date || !time || !staff || !status) {

            alert("Mohon lengkapi seluruh data jadwal.");

            return;

        }


        item.date = date;
        item.time = time;
        item.staff = staff;
        item.status = status;


        saveSchedules();

        renderSchedules();

        closeScheduleModal();


        alert("Jadwal berhasil diperbarui.");

    });


    // =========================================
    // 16. EVENT TOMBOL DETAIL DAN ATUR
    // =========================================

    scheduleTableBody.addEventListener("click", function (event) {

        const button = event.target.closest("button");

        if (!button) return;


        const id = button.dataset.id;
        const action = button.dataset.action;


        if (action === "detail") {

            showScheduleDetail(id);

        }


        if (action === "edit") {

            openScheduleModal(id);

        }

    });


    // =========================================
    // 17. MENUTUP MODAL DETAIL
    // =========================================

    function closeDetailModal() {

        detailModal.classList.remove("show");

    }


    document.getElementById("closeModal")
        .addEventListener("click", closeDetailModal);


    document.getElementById("closeDetailBtn")
        .addEventListener("click", closeDetailModal);


    detailModal.addEventListener("click", function (event) {

        if (event.target === detailModal) {

            closeDetailModal();

        }

    });


    // =========================================
    // 18. MENUTUP MODAL ATUR JADWAL
    // =========================================

    function closeScheduleModal() {

        scheduleModal.classList.remove("show");

    }


    document.getElementById("closeScheduleModal")
        .addEventListener("click", closeScheduleModal);


    document.getElementById("cancelScheduleBtn")
        .addEventListener("click", closeScheduleModal);


    scheduleModal.addEventListener("click", function (event) {

        if (event.target === scheduleModal) {

            closeScheduleModal();

        }

    });


    // =========================================
    // 19. PENCARIAN
    // =========================================

    searchInput.addEventListener("input", function () {

        renderSchedules();

    });


    // =========================================
    // 20. FILTER STATUS
    // =========================================

    statusFilter.addEventListener("change", function () {

        renderSchedules();

    });


    // =========================================
    // 21. FILTER TANGGAL
    // =========================================

    dateFilter.addEventListener("change", function () {

        renderSchedules();

    });


    // =========================================
    // 22. REFRESH DATA
    // =========================================

    refreshBtn.addEventListener("click", function () {

        schedules = JSON.parse(
            localStorage.getItem("griyaresikSchedules") || "[]"
        );

        staffList = JSON.parse(
            localStorage.getItem("griyaresikStaff") || "[]"
        );

        renderSchedules();

        alert("Data jadwal berhasil diperbarui.");

    });


    // =========================================
    // 23. MOBILE SIDEBAR
    // =========================================

    mobileToggle.addEventListener("click", function () {

        sidebar.classList.toggle("show");

    });


    // =========================================
    // 24. LOGOUT
    // =========================================

    document.getElementById("logoutBtn")
        .addEventListener("click", function () {

            const confirmLogout = confirm(
                "Apakah Anda yakin ingin logout?"
            );

            if (!confirmLogout) return;


            sessionStorage.removeItem("griyaresikUser");
            sessionStorage.removeItem("token");


            window.location.href = "../login.html";

        });


    // =========================================
    // 25. INITIAL RENDER
    // =========================================

    renderSchedules();

});