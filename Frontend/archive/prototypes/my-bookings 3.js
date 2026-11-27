(() => {
    "use strict";

    const BOOKINGS_KEY = "griyaResikBookings";
    const SUPPORT_PHONE = "62881026380060";

    const $ = id => document.getElementById(id);

    const str = value =>
        typeof value === "string" || typeof value === "number"
            ? String(value).trim()
            : "";

    const normalize = value =>
        str(value).replace(/^#+/, "").toUpperCase();

    const set = (id, value) => {
        if ($(id)) {
            $(id).textContent = str(value) || "—";
        }
    };

    function number(value) {
        if (
            value === null ||
            value === undefined ||
            value === "" ||
            typeof value === "boolean" ||
            !Number.isFinite(Number(value))
        ) {
            return null;
        }

        return Number(value);
    }

    const money = value =>
        value === null
            ? "—"
            : "Rp " + new Intl.NumberFormat("id-ID").format(value);

    function validDate(value) {
        if (!value) return null;

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }

    function clock(value) {
        const date = validDate(value);

        if (!date) {
            return "Waktu belum tercatat";
        }

        return new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        })
            .format(date)
            .replace(/\./g, ":") + " WIB";
    }

    function stamp(value) {
        const date = validDate(value);

        if (!date) {
            return "Waktu belum tercatat";
        }

        return new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Jakarta",
            day: "numeric",
            month: "short"
        }).format(date) + ", " + clock(date);
    }

    function appointment(booking) {
        const match = str(booking.time).match(
            /^(\d{1,2}):(\d{2})/
        );

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(str(booking.date)) ||
            !match
        ) {
            return null;
        }

        return validDate(
            booking.date +
            "T" +
            match[1].padStart(2, "0") +
            ":" +
            match[2] +
            ":00+07:00"
        );
    }

    // Waktu operasional contoh disimpan terpisah.
    function previewOf(booking, visit) {
        const key = "griyaResikStep3Demo";
        let store = {};

        try {
            const data = JSON.parse(
                localStorage.getItem(key) || "{}"
            );

            if (
                data &&
                typeof data === "object" &&
                !Array.isArray(data)
            ) {
                store = data;
            }
        } catch {
            // Buat ulang hanya data simulasi.
        }

        const id = normalize(booking.id);

        const record =
            Object.hasOwn(store, id) &&
            store[id] &&
            typeof store[id] === "object"
                ? store[id]
                : {};

        const start = (visit || new Date()).getTime();

        const result = {
            confirmedAt:
                validDate(record.confirmedAt)?.toISOString() ||
                new Date(start - 75 * 60000).toISOString(),

            departedAt:
                validDate(record.departedAt)?.toISOString() ||
                new Date(start - 30 * 60000).toISOString()
        };

        Object.defineProperty(store, id, {
            value: result,
            enumerable: true,
            configurable: true
        });

        try {
            localStorage.setItem(
                key,
                JSON.stringify(store)
            );
        } catch {
            // Tampilan tetap berjalan.
        }

        return result;
    }

    function billOf(booking) {
        const addons = Array.isArray(booking.addonItems)
            ? booking.addonItems
                .filter(item => item && str(item.name))
                .map(item => ({
                    name: str(item.name),
                    price: number(item.price)
                }))
            : [];

        if (Array.isArray(booking.addons)) {
            booking.addons.forEach(item => {
                const name = str(
                    typeof item === "string"
                        ? item
                        : item?.name
                );

                if (
                    name &&
                    !addons.some(
                        addon =>
                            addon.name.toLowerCase() ===
                            name.toLowerCase()
                    )
                ) {
                    addons.push({
                        name,

                        price:
                            typeof item === "object" && item
                                ? number(item.price)
                                : null
                    });
                }
            });
        }

        const knownAddonTotal = addons.every(
            item => item.price !== null
        )
            ? addons.reduce(
                (total, item) => total + item.price,
                0
            )
            : null;

        const sum =
            number(booking.addonTotal) ??
            knownAddonTotal;

        let total =
            number(booking.price) ??
            number(booking.subtotal);

        let base = number(booking.basePrice);

        if (
            total === null &&
            base !== null &&
            sum !== null
        ) {
            total = base + sum;
        }

        if (
            base === null &&
            total !== null &&
            sum !== null &&
            total >= sum
        ) {
            base = total - sum;
        }

        return { addons, total, base };
    }

    // Pembayaran demo menggunakan sumber yang sama dengan step 1–2.
    const PAYMENT_DEMO_MODE = true;
    const PAYMENT_DEMO_KEY = "griyaResikPaymentDemo";
    const paymentDemoMemory = Object.create(null);

    function getPaymentView(booking) {
        const method = String(
            booking.payment || "Metode belum dipilih"
        );

        const event = Array.isArray(booking.activityHistory)
            ? booking.activityHistory.find(
                item => item?.type === "payment_verified"
            )
            : null;

        if (!PAYMENT_DEMO_MODE) {
            const status = String(
                booking.paymentStatus ||
                (event ? "Lunas" : "Belum diverifikasi")
            );

            const paid = [
                "lunas",
                "paid",
                "verified",
                "terverifikasi",
                "success",
                "settled",
                "berhasil"
            ].includes(status.trim().toLowerCase());

            return {
                status,
                paid,
                method,
                simulated: false,

                date:
                    validDate(booking.paymentVerifiedAt) ||
                    validDate(booking.paidAt) ||
                    validDate(event?.occurredAt),

                transactionId: String(
                    booking.transactionId ||
                    event?.transactionId ||
                    ""
                )
            };
        }

        let store = {};

        try {
            const data = JSON.parse(
                localStorage.getItem(PAYMENT_DEMO_KEY) || "{}"
            );

            if (
                data &&
                typeof data === "object" &&
                !Array.isArray(data)
            ) {
                store = data;
            }
        } catch {
            // Gunakan data simulasi dalam memori.
        }

        const id = normalize(booking.id);

        const saved = Object.hasOwn(store, id)
            ? store[id]
            : null;

        let date =
            validDate(saved?.verifiedAt) ||
            validDate(paymentDemoMemory[id]?.verifiedAt);

        if (!date) {
            try {
                date = validDate(
                    localStorage.getItem(
                        "griyaResikTransactionPreview:" + booking.id
                    )
                );
            } catch {
                // Waktu dibuat jika belum tersedia.
            }
        }

        if (!date) {
            const created = validDate(booking.createdAt);

            date = created
                ? new Date(created.getTime() + 5 * 60000)
                : new Date();
        }

        const transactionId =
            "DEMO-" +
            method.replace(/\s+/g, "-") +
            "-" +
            id;

        const record = {
            status: "Lunas",
            verifiedAt: date.toISOString(),
            transactionId
        };

        paymentDemoMemory[id] = record;

        Object.defineProperty(store, id, {
            value: record,
            enumerable: true,
            configurable: true
        });

        try {
            localStorage.setItem(
                PAYMENT_DEMO_KEY,
                JSON.stringify(store)
            );
        } catch {
            // Booking asli tidak diubah.
        }

        return {
            status: "Lunas",
            paid: true,
            method,
            simulated: true,
            date,
            transactionId
        };
    }

    function render(booking) {
        const labels = {
            basic: "Basic Cleaning",
            standard: "Standard Cleaning",
            deep: "Deep Cleaning"
        };

        const packageLabel =
            labels[str(booking.package).toLowerCase()] ||
            str(booking.package) ||
            "Paket belum tercatat";

        const roomSource =
            Array.isArray(booking.rooms) && booking.rooms.length
                ? booking.rooms
                : [booking.room];

        const rooms = roomSource
            .map(item =>
                str(
                    typeof item === "string"
                        ? item
                        : item?.name || item?.room
                )
            )
            .filter(Boolean);

        const visit = appointment(booking);
        const preview = previewOf(booking, visit);
        const payment = getPaymentView(booking);
        const bill = billOf(booking);

        const confirmedAt =
            validDate(booking.confirmedAt) ||
            validDate(preview.confirmedAt);

        const departedAt =
            validDate(booking.departedAt) ||
            validDate(preview.departedAt);

        const updatedAt =
            validDate(booking.updatedAt) ||
            validDate(booking.departedAt);

        let address = str(booking.address);

        [
            booking.district,
            booking.region,
            "Kota Surabaya",
            "Jawa Timur"
        ]
            .filter(Boolean)
            .forEach(part => {
                if (
                    !address.toLowerCase().includes(
                        String(part).toLowerCase()
                    )
                ) {
                    address +=
                        (address ? ", " : "") +
                        part;
                }
            });

        // RINGKASAN ATAS
        set("orderCode", "#" + normalize(booking.id));
        set("packageBadge", packageLabel);
        set("packageName", packageLabel);

        set(
            "roomSummary",
            rooms.length
                ? "1× " + rooms.join(" + ")
                : "Ruangan belum tercatat"
        );

        set(
            "areaName",
            booking.district || booking.region
        );

        set(
            "areaAddress",
            booking.address || booking.region
        );

        set("workerName", "Siti Rahmawati");
        set("workerRating", "4.9");
        set("workerId", "Mitra simulasi · ID: DEMO-1102");

        set(
            "estimatedArrival",
            visit
                ? new Intl.DateTimeFormat("id-ID", {
                    timeZone: "Asia/Jakarta",
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }).format(visit) +
                  " – " +
                  clock(visit)
                : "Jadwal belum tercatat"
        );

        set(
            "lastUpdated",
            updatedAt ? clock(updatedAt) : "—"
        );

        set(
            "progressCreated",
            clock(booking.createdAt)
        );

        set(
            "progressConfirmed",
            clock(confirmedAt)
        );

        set(
            "progressTravel",
            clock(departedAt) + " (Aktif)"
        );

        set(
            "progressWorking",
            visit
                ? "Est. " + clock(visit)
                : "Est. belum tersedia"
        );

        set(
            "progressCompleted",
            visit
                ? "Est. " +
                  clock(
                      new Date(
                          visit.getTime() + 120 * 60000
                      )
                  )
                : "Est. belum tersedia"
        );

        // CUSTOMER
        set("customerName", booking.customerName);
        set("customerPhone", booking.phone);
        set("customerAddress", address);

        set(
            "customerLandmark",
            booking.landmark ||
            "Tidak ada patokan tambahan."
        );

        // RIWAYAT DAN PERJALANAN — FORMAT MENGIKUTI STEP 2
const region =
    str(booking.region || booking.district) ||
    "wilayah layanan";

const createdAt = validDate(booking.createdAt);

const createdLabel = createdAt
    ? clock(createdAt)
    : "07:35 WIB";

const dateLabel = visit
    ? new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(visit)
    : str(booking.date) || "tanggal yang dipilih";

// BADGE DAN WAKTU: HANYA JAM SEPERTI STEP 2
set("syncStatus", "Auto-Sync Aktif");
set("historyDepartAt", clock(departedAt));
set("historyConfirmedAt", clock(confirmedAt));

set(
    "historyPaymentAt",
    payment.date
        ? clock(payment.date)
        : "Waktu belum tercatat"
);

set("historyCreatedAt", createdLabel);

// PERJALANAN MASIH SIMULASI
set("travelWorker", "Siti Rahmawati");

set(
    "travelOrigin",
    "Hub Operasional " + region + " (Simulasi)"
);

set(
    "travelDestination",
    booking.district || booking.region
);

set("travelVehicle", "Honda Beat (Simulasi)");
set("travelDistance", "~3,8 km (Simulasi)");
set("travelDuration", "20–25 menit (Simulasi)");

// KONFIRMASI
set("historyConfirmedWorker", "Siti Rahmawati");
set("historyConfirmedRegion", region);
set("dispatchUnit", "Dispatch Unit #4 (Simulasi)");

// PEMBAYARAN: SUMBERNYA TETAP SAMA DENGAN RINCIAN PESANAN
set("historyPaymentMethod", payment.method);
set("historyPaymentAmount", money(bill.total));

set(
    "historyPaymentConclusion",
    payment.simulated
        ? "berhasil diverifikasi secara otomatis oleh sistem. Status invoice: LUNAS. (Simulasi)"
        : payment.paid
            ? "tercatat lunas pada data pesanan. Status invoice: LUNAS."
            : "memiliki status pembayaran: " + payment.status + "."
);

const paymentTitle =
    $("historyPaymentAt")
        ?.parentElement
        ?.querySelector("h3");

if (paymentTitle && !payment.paid) {
    paymentTitle.textContent =
        "Status Pembayaran: " + payment.status;
}

set(
    "paymentReference",
    payment.transactionId || "Belum tersedia"
);

// PEMBUATAN PESANAN DAN HUB
set("historyCreatedCustomer", booking.customerName);
set("historyCreatedDate", dateLabel);

set(
    "historyCreatedSlot",
    str(booking.time)
        ? str(booking.time).replace(/\s*WIB$/i, "") + " WIB"
        : "Waktu belum tercatat"
);

set("historyCreatedRegion", region);

set(
    "historyHub",
    "GriyaResik " +
    region +
    " Operational Hub #04 (Simulasi)"
);

        // KOLOM KANAN — STRUKTUR DAN DATA SAMA DENGAN STEP 2
        const container = $("billItems");

        container.replaceChildren();

        function appendLine(name, description, price) {
            const row = document.createElement("div");
            row.className = "bill-line";

            const copy = document.createElement("div");
            const title = document.createElement("strong");
            const detail = document.createElement("p");
            const cost = document.createElement("b");

            title.textContent = name;
            detail.textContent = description;
            cost.textContent = money(price);

            copy.append(title, detail);
            row.append(copy, cost);
            container.append(row);
        }

        appendLine(
            "1× " +
            (rooms.join(" + ") || "Layanan") +
            " — " +
            packageLabel,

            str(booking.serviceDescription),

            bill.base
        );

        bill.addons.forEach(item => {
            appendLine(
                item.name,
                "Add-on pilihan pelanggan",
                item.price
            );
        });

        set("discountAmount", "- Rp. 0");
        set("billTotal", money(bill.total));

        set(
            "paymentBadge",
            payment.status.toUpperCase() +
            " (" +
            payment.method +
            ")"
        );

        $("paymentBadge").title = payment.simulated
            ? "Simulasi pembayaran lunas untuk presentasi; belum diverifikasi admin."
            : "Status pembayaran dari data pesanan.";

        set(
            "transactionTimeLabel",
            payment.simulated
                ? "Waktu Transaksi (Simulasi)"
                : "Waktu Transaksi"
        );

        set(
            "paymentTimestamp",
            stamp(payment.date)
        );

        set(
            "paymentNotice",
            payment.simulated
                ? "Pembayaran lunas dan waktu transaksi merupakan simulasi presentasi."
                : ""
        );

        $("paymentNotice").hidden =
            !payment.simulated;

        $("mapLink").href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(address);

        // KONTAK MITRA BELUM DIAKTIFKAN
        [
            "workerWhatsApp",
            "workerPhone"
        ].forEach(id => {
            if ($(id)) {
                $(id).disabled = true;
                $(id).title =
                    "Belum tersedia untuk mitra simulasi";
            }
        });

        if ($("supportLink")) {
            $("supportLink").href =
                "https://wa.me/" +
                SUPPORT_PHONE +
                "?text=" +
                encodeURIComponent(
                    "Halo GriyaResik, saya ingin bertanya tentang pesanan #" +
                    normalize(booking.id)
                );
        }
    }

    function state(message) {
        const main = document.querySelector(
            "main.page-width"
        );

        if (!main) return;

        const section = document.createElement("section");
        const title = document.createElement("h2");
        const description = document.createElement("p");
        const link = document.createElement("a");

        section.className = "s3-card";
        title.textContent = "Pesanan belum tersedia";
        description.textContent = message;
        link.textContent = "Buka Status Pemesanan";
        link.href = "my-bookings 1.html";

        section.append(title, description, link);
        main.replaceChildren(section);
    }

    function initialize() {
        set(
            "footerYear",
            new Date().getFullYear()
        );

        let bookings;

        try {
            const data = JSON.parse(
                localStorage.getItem(BOOKINGS_KEY) || "[]"
            );

            if (!Array.isArray(data)) {
                throw new Error("Format booking tidak valid");
            }

            bookings = data.filter(
                item =>
                    item &&
                    typeof item === "object" &&
                    str(item.id)
            );
        } catch {
            state(
                "Data booking belum dapat dibaca. Buka halaman pada browser dan alamat situs yang sama dengan booking."
            );

            return;
        }

        const id = normalize(
            new URLSearchParams(
                window.location.search
            ).get("id")
        );

        let booking;

        if (id) {
            booking = bookings.find(
                item => normalize(item.id) === id
            );
        } else if (
            bookings.every(
                item => validDate(item.createdAt)
            )
        ) {
            booking = [...bookings].sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )[0];
        } else {
            booking = bookings[bookings.length - 1];
        }

        if (!booking) {
            state(
                id
                    ? "Kode reservasi tidak ditemukan."
                    : "Buat booking terlebih dahulu."
            );

            return;
        }

        render(booking);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();