(() => {
    "use strict";

    const BOOKINGS_KEY = "griyaResikBookings";
    const DEMO_KEY = "griyaResikTrackingDemo";
    const SUPPORT_PHONE = "6281234567890";

    const $ = id => document.getElementById(id);

    const text = (id, value) => {
        $(id).textContent = value;
    };

    const normalize = value =>
        String(value || "").trim().replace(/^#/, "").toUpperCase();

    const amount = value => {
        if (
            value === null ||
            value === undefined ||
            value === "" ||
            !Number.isFinite(Number(value))
        ) {
            return null;
        }

        return Number(value);
    };

    const money = value =>
        amount(value) === null
            ? "—"
            : "Rp " + Number(value).toLocaleString("id-ID");

    const packageNames = {
        Basic: "Basic Cleaning",
        Standard: "Standard Cleaning",
        Deep: "Deep Cleaning"
    };

    const stages = [
        "Pesanan Dibuat",
        "Dikonfirmasi",
        "Menuju Lokasi",
        "Pengerjaan",
        "Selesai & Review"
    ];

    const descriptions = [
        "Reservasi dicatat.",
        "Simulasi: jadwal disetujui dan mitra ditugaskan.",
        "Simulasi: mitra sedang menuju lokasi pelanggan.",
        "Simulasi: mitra sedang mengerjakan layanan yang dipilih.",
        "Simulasi: pekerjaan selesai dan siap diperiksa bersama pelanggan."
    ];

    const roomImages = {
        "Kamar Tidur": "1. Kamar Tidur.png",
        "Ruang Tamu": "2. Ruang Tamu.png",
        "Dapur (Kitchen)": "3. Dapur.png",
        "Kamar Mandi": "4. Kamar Mandi.png",
        "Ruang Makan": "5. Ruang Makan.png",
        "Ruang Kerja (Home Office)": "6. Ruang Kerja.png",
        "Ruang Belajar": "7. Ruang Belajar.png",
        "Ruang Laundry": "8. Ruang laundry.png",
        "Teras Rumah": "9. Teras.png",
        "Garasi / Carport": "10. Garasi : Carport.png",
        "Gudang Penyimpanan": "11. Gudang.png",
        "Ruangan Kustom": "12. Studio Kreatif.png"
    };

    let bookings = [];
    let current = null;
    let demo = Object.create(null);

    function message(value) {
        text("message", value);
        $("message").hidden = !value;
    }

    function readBookings() {
        try {
            const data = JSON.parse(
                localStorage.getItem(BOOKINGS_KEY) || "[]"
            );

            if (!Array.isArray(data)) {
                throw new Error("Format tidak valid");
            }

            bookings = data.filter(item =>
                item &&
                typeof item === "object" &&
                typeof item.id === "string" &&
                item.id.trim()
            );

            return true;
        } catch {
            bookings = [];

            message(
                "Data pesanan belum dapat dibaca. Periksa penyimpanan " +
                "browser atau buka kembali halaman booking."
            );

            return false;
        }
    }

    function readDemo() {
        demo = Object.create(null);

        try {
            const saved = JSON.parse(
                localStorage.getItem(DEMO_KEY) || "{}"
            );

            if (
                saved &&
                typeof saved === "object" &&
                !Array.isArray(saved)
            ) {
                Object.keys(saved).forEach(id => {
                    demo[id] = saved[id];
                });
            }
        } catch {
            // Simulasi mulai dari tahap pertama.
        }
    }

    function getDemo(id) {
        const saved = demo[id];

        // Mendukung format simulasi dari versi sebelumnya.
        const stage = typeof saved === "number"
            ? saved
            : saved?.stage;

        return {
            stage: (
                Number.isInteger(stage) &&
                stage >= 0 &&
                stage <= 4
            ) ? stage : 0,

            updatedAt: typeof saved === "object"
                ? saved?.updatedAt
                : null
        };
    }

    function findBooking(id) {
        return bookings.find(booking =>
            normalize(booking.id) === normalize(id)
        );
    }

    function validDate(value) {
        if (!value) return null;

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    function visitLabel(value) {
        const date = validDate(
            value ? value + "T12:00:00+07:00" : null
        );

        return date
            ? date.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Asia/Jakarta"
            })
            : "Tanggal belum ditentukan";
    }

    function clock(value) {
        const date = validDate(value);

        return date
            ? date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "Asia/Jakarta"
            }).replace(".", ":") + " WIB"
            : "—";
    }

    // Perkiraan khusus preview, bukan waktu kejadian operasional asli.
    function estimatedTimes(booking) {
        const start = validDate(
            booking.date && booking.time
                ? booking.date + "T" + booking.time + ":00+07:00"
                : null
        );

        const durationNumbers =
            String(booking.duration || "").match(/\d+/g)?.map(Number) ||
            [];

        const duration = durationNumbers.length
            ? Math.max(...durationNumbers)
            : null;

        const estimate = offset => start
            ? "Est. " + clock(
                new Date(start.getTime() + offset * 60000)
            )
            : "Est. belum tersedia";

        return [
            validDate(booking.createdAt)
                ? clock(booking.createdAt)
                : "Waktu belum tercatat",

            estimate(-75),
            estimate(-30),
            estimate(0),

            duration
                ? estimate(duration)
                : "Est. sesuai layanan"
        ];
    }

    function historyIcon(kind) {
    const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
    );

    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("history-icon");

    const paths = {
        verified: `
            <circle cx="12" cy="12" r="9"/>
            <path d="m8 12 3 3 5-6"/>
        `,
        document: `
            <path d="M6 3h8l4 4v14H6Z"/>
            <path d="M14 3v5h4M9 12h6M9 16h5"/>
        `,
        pin: `
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/>
            <circle cx="12" cy="10" r="2.5"/>
        `
    };

    // Hanya markup ikon tetap; bukan data customer.
    svg.innerHTML = paths[kind] || paths.document;

    return svg;
}

function addActivity(title, detail, time, options = {}) {
    const item = document.createElement("li");

    if (options.payment) {
        item.classList.add("payment-event");
    }

    const box = document.createElement("div");
    box.className = "activity";

    const top = document.createElement("div");
    top.className = "activity-top";

    const heading = document.createElement("h3");
    heading.textContent = title;

    if (options.payment) {
        heading.append(historyIcon("verified"));
    }

    const timestamp = document.createElement("time");
    timestamp.textContent = time;

    top.append(heading, timestamp);

    const description = document.createElement("p");

    if (Array.isArray(detail)) {
        detail.forEach(part => {
            const node = document.createElement(
                part.bold ? "strong" : "span"
            );

            node.textContent = part.text;
            description.append(node);
        });
    } else {
        description.textContent = detail;
    }

    box.append(top, description);

    if (options.transactionId) {
        const transaction = document.createElement("div");
        transaction.className = "history-transaction";

        const label = document.createElement("span");
        label.textContent =
            "ID Transaksi: " + options.transactionId;

        transaction.append(historyIcon("document"), label);
        box.append(transaction);
    }

    if (options.hub) {
        const hub = document.createElement("div");
        hub.className = "history-hub";

        const label = document.createElement("span");
        label.textContent = "Hub Terdekat: " + options.hub;

        hub.append(historyIcon("pin"), label);
        box.append(hub);
    }

    item.append(box);
    $("timeline").append(item);
}

// Riwayat dari server nantinya bisa diberikan melalui activityHistory.
// Jika belum tersedia, tampilkan contoh simulasi.
function renderActivityHistory() {
    if (!current) return;

    $("timeline").replaceChildren();

    const storedEvents = Array.isArray(current.activityHistory)
        ? current.activityHistory.filter(event =>
            event && typeof event === "object"
        )
        : null;

    const simulated = storedEvents === null;

    text(
        "historySyncText",
        simulated ? "Auto-Sync Aktif" : "Riwayat Pesanan"
    );

    $("historyDemoNote").hidden = !simulated;

    // Jalur data riwayat ketika backend nanti sudah dihubungkan.
    if (storedEvents) {
        storedEvents.forEach(event => {
            const paid = event.type === "payment_verified";

            const detail = paid
                ? [
                    {
                        text: "Transaksi " +
                            (
                                event.paymentMethod ||
                                current.payment ||
                                ""
                            ) + " senilai "
                    },
                    {
                        text: money(event.amount ?? current.price),
                        bold: true
                    },
                    {
                        text: " berhasil diverifikasi. " +
                            "Status invoice: LUNAS."
                    }
                ]
                : String(event.message || "");

            addActivity(
                event.title || (
                    paid
                        ? "Pembayaran Terverifikasi Lunas"
                        : "Aktivitas Pesanan"
                ),
                detail,
                clock(event.occurredAt),
                {
                    payment: paid,
                    transactionId: event.transactionId,
                    hub: event.hubName
                }
            );
        });

        if (!storedEvents.length) {
            addActivity(
                "Belum ada aktivitas",
                "Riwayat dari server belum tersedia.",
                "—"
            );
        }

        return;
    }

    // DATA SIMULASI: tidak menulis ke booking/payment asli.
    const preview = getDemo(current.id);
    const times = estimatedTimes(current);

    for (let index = preview.stage; index >= 1; index--) {
        addActivity(
            stages[index] + " — Simulasi",
            descriptions[index],
            times[index]
        );
    }

    const method = current.payment || "QRIS";
    const created = validDate(current.createdAt);

    const bookingTime = created
        ? clock(created)
        : "07:35 WIB";

    const paymentTime = created
        ? clock(new Date(created.getTime() + 5 * 60000))
        : "07:40 WIB";

    const transactionId =
        "DEMO-" +
        method.replace(/\s+/g, "-") +
        "-" + normalize(current.id);

    addActivity(
        "Pembayaran Terverifikasi Lunas",
        [
            {
                text: "Transaksi instan " + method + " senilai "
            },
            {
                text: money(current.price ?? current.subtotal),
                bold: true
            },
            {
                text: " berhasil diverifikasi secara otomatis " +
                    "oleh sistem. Status invoice: LUNAS."
            }
        ],
        paymentTime,
        {
            payment: true,
            transactionId
        }
    );

    addActivity(
        "Pesanan Berhasil Dibuat",
        "Pelanggan " + (current.customerName || "Pelanggan") +
        " telah menyelesaikan formulir pemesanan online " +
        "untuk jadwal pengerjaan " + visitLabel(current.date) +
        ", slot pukul " + (current.time || "—") +
        " WIB. Sistem otomatis mencari mitra terverifikasi " +
        "di area " + (current.region || "Kota Surabaya") + ".",
        bookingTime,
        {
            hub: "GriyaResik " +
                (current.region || "Surabaya") +
                " Operational Hub #04 (Simulasi)"
        }
    );
}

        function renderProgress() {
    if (!current) return;

    const preview = getDemo(current.id);
    const times = estimatedTimes(current);

    text(
        "lastUpdated",
        clock(
            preview.updatedAt ||
            current.updatedAt ||
            current.createdAt
        )
    );

    $("progress").replaceChildren();

    stages.forEach((name, index) => {
        const item = document.createElement("li");

        item.className = index < preview.stage
            ? "done"
            : index === preview.stage
                ? "current"
                : "";

        if (index === preview.stage) {
            item.setAttribute("aria-current", "step");
        }

        const dot = document.createElement("span");
        dot.className = "step-dot";
        dot.textContent = index <= preview.stage
            ? "✓"
            : String(index + 1);

        const title = document.createElement("strong");
        title.textContent = name;

        const time = document.createElement("small");
        time.textContent = times[index];

        item.title = index === 0
            ? "Data waktu booking asli jika tersedia"
            : "Perkiraan untuk simulasi, bukan kejadian asli";

        item.append(dot, title, time);
        $("progress").append(item);
    });

    renderActivityHistory();
}

        function addBillLine(name, description, price) {
        const row = document.createElement("div");
        row.className = "bill-line";

        const content = document.createElement("div");

        const heading = document.createElement("strong");
        heading.textContent = name;
        content.append(heading);

        if (description) {
            const detail = document.createElement("p");
            detail.textContent = description;
            content.append(detail);
        }

        const cost = document.createElement("b");
        cost.textContent = money(price);

        row.append(content, cost);
        $("billItems").append(row);
    }

    function fullAddress(booking) {
        let result = String(booking.address || "").trim();

        [
            booking.district,
            booking.region,
            "Kota Surabaya",
            "Jawa Timur"
        ].filter(Boolean).forEach(part => {
            if (
                !result.toLowerCase().includes(
                    String(part).toLowerCase()
                )
            ) {
                result += (result ? ", " : "") + part;
            }
        });

        return result;
    }

    function renderBooking(booking) {
        current = booking;

        $("orderContent").hidden = false;
        $("empty").hidden = true;

        $("orderSearch").value =
            "#" + booking.id.replace(/^#/, "");

        const packageLabel =
            packageNames[booking.package] ||
            booking.package ||
            "Paket belum dipilih";

        text("orderCode", "#" + booking.id.replace(/^#/, ""));

        text(
            "orderStatus",
            booking.status || "Menunggu konfirmasi"
        );

        text("packageBadge", packageLabel);

        text(
            "arrival",
            visitLabel(booking.date) +
            " - " + (booking.time || "—") + " WIB"
        );

        text("overviewPackage", packageLabel);
        text("overviewRoom", "1× " + (booking.room || "Layanan"));

        text(
            "overviewDistrict",
            booking.district || booking.region || "Kota Surabaya"
        );

        text(
            "overviewAddress",
            booking.address || booking.region || "Alamat belum diisi"
        );

        text("customerName", booking.customerName || "—");
        text("customerPhone", booking.phone || "—");

        const address = fullAddress(booking);
        text("customerAddress", address);

        text(
            "customerLandmark",
            booking.landmark || "Tidak ada patokan tambahan."
        );

        text(
            "cleanerNotes",
            "Preferensi cleaner: " +
            (booking.cleanerPreference || "Bebas") +
            ". Catatan: " + (booking.notes || "Tidak ada.")
        );

        text(
            "paymentBadge",
            (booking.paymentStatus || "Belum diverifikasi") +
            " (" + (booking.payment || "Metode belum dipilih") + ")"
        );

        const addons = Array.isArray(booking.addonItems)
            ? booking.addonItems.filter(addon =>
                addon && typeof addon === "object"
            )
            : [];

        const addonTotal = amount(booking.addonTotal) ??
            addons.reduce(
                (sum, addon) => sum + (amount(addon.price) ?? 0),
                0
            );

        const total =
            amount(booking.price) ??
            amount(booking.subtotal) ??
            (
                amount(booking.basePrice) !== null
                    ? Number(booking.basePrice) + addonTotal
                    : null
            );

        const base =
            amount(booking.basePrice) ??
            (
                total !== null
                    ? Math.max(0, total - addonTotal)
                    : null
            );

        $("billItems").replaceChildren();

        addBillLine(
            "1× " + (booking.room || "Layanan") +
            " — " + packageLabel,
            booking.serviceDescription || "",
            base
        );

        if (addons.length) {
            addons.forEach(addon => {
                addBillLine(
                    addon.name || "Layanan tambahan",
                    "Add-on pilihan pelanggan",
                    addon.price
                );
            });
        } else if (
            Array.isArray(booking.addons) &&
            booking.addons.length
        ) {
            addBillLine(
                booking.addons.join(", "),
                "Total layanan tambahan",
                booking.addonTotal
            );
        }

        text(
            "billTotal",
            money(booking.price ?? booking.subtotal)
        );

// WAKTU TRANSAKSI
const paymentEvent = Array.isArray(booking.activityHistory)
    ? booking.activityHistory.find(event =>
        event && event.type === "payment_verified"
    )
    : null;

let transactionDate =
    validDate(booking.paymentVerifiedAt) ||
    validDate(booking.paidAt) ||
    validDate(paymentEvent?.occurredAt);

const isTransactionSimulation = !transactionDate;

if (isTransactionSimulation) {
    const previewKey =
        "griyaResikTransactionPreview:" + booking.id;

    try {
        transactionDate = validDate(
            localStorage.getItem(previewKey)
        );

        if (!transactionDate) {
            transactionDate = new Date();

            localStorage.setItem(
                previewKey,
                transactionDate.toISOString()
            );
        }
    } catch {
        transactionDate = new Date();
    }
}

text(
    "paymentTimestamp",
    transactionDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        timeZone: "Asia/Jakarta"
    }) + ", " + clock(transactionDate)
);

const transactionLabel = $("transactionTimeLabel");
const transactionNotice = $("paymentNotice");

if (transactionLabel) {
    transactionLabel.textContent = isTransactionSimulation
        ? "Waktu Transaksi (Simulasi)"
        : "Waktu Transaksi";
}

if (transactionNotice) {
    transactionNotice.textContent = isTransactionSimulation
        ? "Waktu simulasi; pembayaran asli belum diverifikasi."
        : "";

    transactionNotice.hidden =
        Boolean(transactionLabel) || !isTransactionSimulation;
}

$("mapLink").href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(address);

        $("supportLink").href =
            "https://wa.me/" + SUPPORT_PHONE +
            "?text=" + encodeURIComponent(
                "Halo GriyaResik, saya ingin bertanya tentang pesanan " +
                booking.id + "."
            );

        const image = $("roomPhoto");
        const imageName = roomImages[booking.room];

        image.hidden = !imageName;

        if (imageName) {
            image.src = "../images/" + imageName;
            image.alt = "Ilustrasi " + booking.room;
        }

        renderProgress();

        try {
            const url = new URL(window.location.href);
            url.searchParams.set("id", booking.id);
            history.replaceState(null, "", url);
        } catch {
            // Tidak menghalangi tampilan.
        }
    }

    function hideBooking() {
        current = null;
        $("orderContent").hidden = true;
        $("empty").hidden = bookings.length > 0;
    }

    $("roomPhoto").addEventListener("error", () => {
        $("roomPhoto").hidden = true;
    });

    // CARI PESANAN
    $("searchForm").addEventListener("submit", event => {
        event.preventDefault();

        const query = $("orderSearch").value;
        const readable = readBookings();

        if (!readable) {
            hideBooking();
            return;
        }

        const booking = findBooking(query);

        if (booking) {
            message("");
            renderBooking(booking);
        } else {
            hideBooking();

            message(
                "Kode reservasi tidak ditemukan di browser ini. " +
                "Periksa kembali kode reservasi Anda."          
            );

        }
    });

    // PEMBARUAN DARI TAB LAIN
    window.addEventListener("storage", event => {
        if (event.key === DEMO_KEY) {
            readDemo();

            if (current) {
                renderProgress();
            }

            return;
        }

        if (
            event.key !== BOOKINGS_KEY &&
            event.key !== null
        ) {
            return;
        }

        const selectedId = current?.id;

        readBookings();
        readDemo();

        const booking = findBooking(selectedId);

        if (booking) {
            renderBooking(booking);
        } else {
            hideBooking();

            message(
                "Daftar pesanan berubah. Pilih atau cari kembali pesanan Anda."
            );
        }
    });

    // TAMPILAN AWAL
    text("year", new Date().getFullYear());

    readDemo();
    readBookings();

    if (!bookings.length) {
        hideBooking();
        return;
    }

    const requested = new URLSearchParams(
        window.location.search
    ).get("id");

    if (requested) {
        const booking = findBooking(requested);

        if (booking) {
            renderBooking(booking);
        } else {
            hideBooking();
            $("orderSearch").value = requested;

            message(
                "Kode pada tautan tidak ditemukan. Cari menggunakan kode reservasi Anda."
            );
        }
    } else {
        renderBooking(bookings[bookings.length - 1]);
    }
})();