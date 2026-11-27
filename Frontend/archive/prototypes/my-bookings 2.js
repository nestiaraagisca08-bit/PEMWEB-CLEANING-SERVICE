(() => {
    "use strict";

    const BOOKINGS_KEY = "griyaResikBookings";
    const DEMO_KEY = "griyaResikStep2Demo";
    const SUPPORT_PHONE = "62881026380060";

    const $ = id => document.getElementById(id);

    const str = value =>
        typeof value === "string" || typeof value === "number"
            ? String(value).trim()
            : "";

    const set = (id, value) => {
        if ($(id)) {
            $(id).textContent = str(value) || "—";
        }
    };

    const normalize = value =>
        str(value).replace(/^#+/, "").toUpperCase();

    function node(tag, className, content) {
        const element = document.createElement(tag);
        element.className = className;
        element.textContent = str(content);
        return element;
    }

    function amount(value) {
        if (
            value === null ||
            value === undefined ||
            value === "" ||
            typeof value === "boolean"
        ) {
            return null;
        }

        const result = Number(value);

        return Number.isFinite(result) && result >= 0
            ? result
            : null;
    }

    const money = value =>
        value === null
            ? "—"
            : "Rp " + new Intl.NumberFormat("id-ID").format(value);

    function validDate(value) {
        if (
            !value ||
            (
                typeof value !== "string" &&
                typeof value !== "number"
            )
        ) {
            return null;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }

    function time(value) {
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

    function dateTime(value) {
        const date = validDate(value);

        if (!date) {
            return "Waktu belum tercatat";
        }

        const day = new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Jakarta",
            day: "numeric",
            month: "short"
        }).format(date);

        return day + ", " + time(date.toISOString());
    }

    function packageName(booking) {
        const name = str(booking.package);

        const labels = {
            basic: "Basic Cleaning",
            standard: "Standard Cleaning",
            deep: "Deep Cleaning"
        };

        return (
            labels[name.toLowerCase()] ||
            name ||
            "Paket belum tercatat"
        );
    }

    function roomNames(booking) {
        const source =
            Array.isArray(booking.rooms) && booking.rooms.length
                ? booking.rooms
                : [booking.room];

        return source
            .map(item =>
                str(
                    typeof item === "string"
                        ? item
                        : item?.name || item?.room
                )
            )
            .filter(Boolean);
    }

    function addressOf(booking) {
        const parts = [];

        [
            booking.address,
            booking.district,
            booking.region
        ]
            .map(str)
            .filter(Boolean)
            .forEach(part => {
                const combined = parts.join(", ").toLowerCase();

                if (!combined.includes(part.toLowerCase())) {
                    parts.push(part);
                }
            });

        return parts.join(", ");
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

    /*
     * Waktu konfirmasi simulasi disimpan terpisah.
     * Data booking asli tidak diubah.
     */
    function previewOf(booking, visit) {
        let store = {};

        try {
            const data = JSON.parse(
                localStorage.getItem(DEMO_KEY) || "{}"
            );

            if (
                data &&
                typeof data === "object" &&
                !Array.isArray(data)
            ) {
                store = data;
            }
        } catch {
            // Data simulasi dapat dibuat kembali.
        }

        const key = normalize(booking.id);

        const previous = Object.hasOwn(store, key)
            ? store[key]
            : null;

        const old =
            previous && typeof previous === "object"
                ? previous
                : {};

        const confirmedAt =
            validDate(old.confirmedAt)?.toISOString() ||
            new Date(
                (visit || new Date()).getTime() -
                75 * 60000
            ).toISOString();

        const record = { confirmedAt };

        Object.defineProperty(store, key, {
            value: record,
            enumerable: true,
            configurable: true
        });

        try {
            localStorage.setItem(
                DEMO_KEY,
                JSON.stringify(store)
            );
        } catch {
            // Halaman tetap tampil jika penyimpanan penuh.
        }

        return record;
    }

    function billData(booking) {
        const items = Array.isArray(booking.addonItems)
            ? booking.addonItems
                .filter(item => item && str(item.name))
                .map(item => ({
                    name: str(item.name),
                    description: str(item.description),
                    price: amount(item.price)
                }))
            : [];

        if (Array.isArray(booking.addons)) {
            booking.addons.forEach(item => {
                const name = str(
                    typeof item === "string"
                        ? item
                        : item?.name
                );

                const alreadyExists = items.some(
                    addon =>
                        addon.name.toLowerCase() ===
                        name.toLowerCase()
                );

                if (name && !alreadyExists) {
                    items.push({
                        name,
                        description: "",

                        price:
                            typeof item === "object" && item
                                ? amount(item.price)
                                : null
                    });
                }
            });
        }

        const knownAddonTotal = items.every(
            item => item.price !== null
        )
            ? items.reduce(
                (sum, item) => sum + item.price,
                0
            )
            : null;

        const addonTotal =
            amount(booking.addonTotal) ??
            knownAddonTotal;

        let base = amount(booking.basePrice);

        let total =
            amount(booking.price) ??
            amount(booking.subtotal);

        if (
            total === null &&
            base !== null &&
            addonTotal !== null
        ) {
            total = base + addonTotal;
        }

        if (
            base === null &&
            total !== null &&
            addonTotal !== null &&
            total >= addonTotal
        ) {
            base = total - addonTotal;
        }

        return { items, base, total };
    }

    function addBillLine(container, name, description, price) {
        const row = node(
            "div",
            "flex justify-between items-start gap-3",
            ""
        );

        const copy = document.createElement("div");

        copy.append(
            node(
                "p",
                "font-bold text-[#1E3A2F]",
                name
            ),

            node(
                "p",
                "text-[11px] text-[#7A8C82]",
                description
            )
        );

        row.append(
            copy,

            node(
                "p",
                "font-bold text-[#1E3A2F] whitespace-nowrap",
                money(price)
            )
        );

        container.append(row);
    }

    function showState(message) {
        const main = document.querySelector(
            "main.booking-main"
        );

        if (!main) {
            return;
        }

        Array.from(main.children).forEach(element => {
            element.hidden = true;
        });

        let box = $("step2State");

        if (!box) {
            box = node("section", "s2-card", "");
            box.id = "step2State";
            main.prepend(box);
        }

        box.hidden = false;

        const link = node(
            "a",
            "inline-block mt-4 underline",
            "Buka Status Pemesanan"
        );

        link.href = "my-bookings 1.html";

        box.replaceChildren(
            node(
                "h2",
                "text-xl font-bold",
                "Pesanan belum tersedia"
            ),

            node("p", "mt-3", message),

            link
        );
    }

    function renderHistoryLikePart1(booking, bill, preview) {
    const list = $("s2HistoryTimeline");

    if (!list) {
        return;
    }

    list.replaceChildren();
    set("syncStatus", "Auto-Sync Aktif");

    function addActivity(title, parts, clockLabel, options = {}) {
        const item = node(
            "li",
            options.payment ? "payment-event" : "",
            ""
        );

        const card = node(
            "article",
            "h2-activity",
            ""
        );

        const head = node(
            "div",
            "h2-activity-top",
            ""
        );

        const heading = node("h3", "", title);

        if (options.payment) {
            heading.append(
                node("span", "h2-verified", " ⊙")
            );
        }

        head.append(
            heading,
            node("time", "", clockLabel)
        );

        const description = document.createElement("p");

        parts.forEach(part => {
            if (typeof part === "string") {
                description.append(
                    document.createTextNode(part)
                );
            } else {
                description.append(
                    node("strong", "", part.bold)
                );
            }
        });

        card.append(head, description);

        if (options.transactionId) {
            const tag = node(
                "div",
                "h2-transaction",
                ""
            );

            tag.append(
                node("span", "h2-file-icon", "▤"),

                node(
                    "span",
                    "",
                    "ID Transaksi: " + options.transactionId
                )
            );

            card.append(tag);
        }

        if (options.hub) {
            const hub = node(
                "div",
                "h2-hub",
                ""
            );

            const pin = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
            );

            pin.setAttribute("class", "h2-icon");
            pin.setAttribute("viewBox", "0 0 24 24");
            pin.setAttribute("aria-hidden", "true");

            const path = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
            );

            path.setAttribute(
                "d",
                "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
            );

            pin.append(path);

            hub.append(
                pin,
                node("span", "", options.hub)
            );

            card.append(hub);
        }

        item.append(card);
        list.append(item);
    }

    const created = validDate(booking.createdAt);
    const confirmed = validDate(booking.confirmedAt);

    const method =
        str(booking.payment) ||
        "Metode belum tercatat";

    const region =
        str(booking.region || booking.district) ||
        "wilayah layanan";

    const status = str(
        booking.paymentStatus
    ).toLowerCase();

    const paid = [
        "lunas",
        "paid",
        "verified",
        "terverifikasi",
        "success",
        "settled",
        "berhasil"
    ].includes(status);

    const paymentEvent = Array.isArray(
        booking.activityHistory
    )
        ? booking.activityHistory.find(
            event => event?.type === "payment_verified"
        )
        : null;

    const paymentAt =
        validDate(booking.paymentVerifiedAt) ||
        validDate(booking.paidAt) ||
        validDate(paymentEvent?.occurredAt);

    /*
     * Sama seperti part 1:
     * jika belum ada waktu asli, riwayat memakai waktu contoh.
     * Status pembayaran asli tidak diubah.
     */
    const paymentTime =
        paid && paymentAt
            ? time(paymentAt.toISOString())
            : created
                ? time(
                    new Date(
                        created.getTime() + 5 * 60000
                    ).toISOString()
                )
                : "07:40 WIB";

    const realTransactionId = str(
        booking.transactionId ||
        paymentEvent?.transactionId
    );

    const transactionId =
        paid && realTransactionId
            ? realTransactionId
            : "DEMO-" +
              method.replace(/\s+/g, "-") +
              "-" +
              normalize(booking.id);

    const visit = appointment(booking);

    const day = visit
        ? new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Jakarta",
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(visit)
        : str(booking.date) || "tanggal yang dipilih";

    // TAMBAHAN KHUSUS PART 2
    addActivity(
        "Pesanan Dikonfirmasi & Mitra Ditugaskan",

        [
            "Sistem dispatch GriyaResik mengalokasikan mitra ",

            { bold: "Siti Rahmawati" },

            " beserta perlengkapan sanitasi. Mitra sedang " +
            "mempersiapkan peralatan untuk pesanan di area " +
            region +
            ". Penugasan ini masih simulasi."
        ],

        time(
            confirmed?.toISOString() ||
            preview.confirmedAt
        )
    );

    // AKTIVITAS PEMBAYARAN SEPERTI PART 1
    addActivity(
        "Pembayaran Terverifikasi Lunas",

        [
            "Transaksi instan " + method + " senilai ",

            { bold: money(bill.total) },

            paid
                ? " tercatat lunas pada data pesanan. " +
                  "Status invoice: LUNAS."
                : " berhasil diverifikasi secara otomatis " +
                  "oleh sistem. Status invoice: LUNAS. (Simulasi)"
        ],

        paymentTime,

        {
            payment: true,
            transactionId
        }
    );

    // AKTIVITAS PEMBUATAN PESANAN SEPERTI PART 1
    addActivity(
        "Pesanan Berhasil Dibuat",

        [
            "Pelanggan " +
            (
                str(booking.customerName) ||
                "pada pesanan ini"
            ) +
            " telah menyelesaikan formulir pemesanan online " +
            "untuk jadwal pengerjaan " +
            day +
            ", slot pukul " +
            (
                str(booking.time).replace(/\s*WIB$/i, "") ||
                "—"
            ) +
            " WIB. Sistem otomatis mencari mitra terverifikasi " +
            "di area " +
            region +
            "."
        ],

        created
            ? time(created.toISOString())
            : "07:35 WIB",

        {
            hub:
                "GriyaResik " +
                region +
                " Operational Hub #04 (Simulasi)"
        }
    );
}

// Sumber pembayaran demo bersama dengan step 1.
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
        // Simulasi tetap berjalan menggunakan memori.
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
            // Gunakan waktu baru jika belum tersedia.
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
        // Tidak mengubah data booking asli.
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
    const rooms = roomNames(booking);
    const label = packageName(booking);
    const visit = appointment(booking);
    const preview = previewOf(booking, visit);
    const bill = billData(booking);
    const payment = getPaymentView(booking);

    const confirmed = validDate(
        booking.confirmedAt
    );

    const updated =
        validDate(booking.updatedAt) ||
        confirmed;

    // RINGKASAN ATAS
    set("bookingCode", "#" + normalize(booking.id));
    set("packageBadge", label);
    set("packageName", label);

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
        "areaSummary",
        booking.address || booking.region
    );

    set("workerName", "Siti Rahmawati");
    set("workerRating", "4.9");
    set("workerCode", "Mitra simulasi · ID: DEMO-1102");

    const scheduleLabel = visit
        ? new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Jakarta",
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(visit) +
          " – " +
          time(visit.toISOString())
        : "Jadwal belum tercatat";

    set("scheduledAt", scheduleLabel);

    set(
        "lastUpdated",
        updated
            ? time(updated.toISOString())
            : "—"
    );

    set(
        "progressCreated",
        time(booking.createdAt)
    );

    set(
        "progressConfirmed",
        time(
            confirmed?.toISOString() ||
            preview.confirmedAt
        ) + " (Aktif)"
    );

    const estimate = minutes =>
        visit
            ? "Est. " +
              time(
                  new Date(
                      visit.getTime() +
                      minutes * 60000
                  ).toISOString()
              )
            : "Est. belum tersedia";

    set("progressTravel", estimate(-30));
    set("progressWorking", estimate(0));
    set("progressCompleted", estimate(120));

    set(
        "step2Note",
        "Pratinjau tahap 2: konfirmasi, estimasi, dan mitra masih simulasi. Identitas customer, layanan, dan biaya mengikuti booking asli."
    );

    // RIWAYAT TETAP MEMAKAI FUNGSI YANG SUDAH ADA
    renderHistoryLikePart1(
        booking,
        bill,
        preview
    );

    // ALAMAT LENGKAP: SAMA DENGAN STEP 1
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

    set("customerName", booking.customerName);
    set("customerPhone", booking.phone);
    set("customerAddress", address);

    set(
        "customerLandmark",
        booking.landmark ||
        "Tidak ada patokan tambahan."
    );

    $("mapLink").href =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(address);

    // PEMBAYARAN: MEMBACA SUMBER DEMO YANG SAMA DENGAN STEP 1
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
        dateTime(payment.date?.toISOString())
    );

    set(
        "paymentNotice",
        payment.simulated
            ? "Pembayaran lunas dan waktu transaksi merupakan simulasi presentasi."
            : ""
    );

    $("paymentNotice").hidden =
        !payment.simulated;

    // RINCIAN TAGIHAN: STRUKTUR SAMA DENGAN STEP 1
    const container = $("billItems");

    container.replaceChildren();

    function appendLine(name, description, price) {
        const row = node(
            "div",
            "bill-line",
            ""
        );

        const copy = document.createElement("div");

        copy.append(
            node("strong", "", name),
            node("p", "", description)
        );

        row.append(
            copy,
            node("b", "", money(price))
        );

        container.append(row);
    }

    appendLine(
        "1× " +
        (rooms.join(" + ") || "Layanan") +
        " — " +
        label,

        str(booking.serviceDescription),

        bill.base
    );

    bill.items.forEach(item => {
        appendLine(
            item.name,
            "Add-on pilihan pelanggan",
            item.price
        );
    });

    // Diskon sudah ada di HTML, tidak dibuat dua kali.
    set("discountAmount", "- Rp. 0");
    set("billTotal", money(bill.total));

    // KONTAK MITRA MASIH SIMULASI
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

    // WHATSAPP CS SAMA DENGAN STEP 1
    $("supportLink").href =
        "https://wa.me/" +
        SUPPORT_PHONE +
        "?text=" +
        encodeURIComponent(
            "Halo GriyaResik, saya ingin bertanya tentang pesanan #" +
            normalize(booking.id)
        );
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
        showState(
            "Data booking belum dapat dibaca. Buka kembali halaman Status Pemesanan pada browser dan alamat situs yang sama."
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
        showState(
            id
                ? "Kode pesanan tidak ditemukan di browser ini."
                : "Buat booking dahulu pada browser dan alamat situs yang sama."
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