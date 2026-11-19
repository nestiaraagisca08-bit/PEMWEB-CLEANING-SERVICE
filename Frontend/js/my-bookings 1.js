(() => {
    "use strict";

    const BOOKINGS_KEY = "griyaResikBookings";
    const CS_PHONE = "62881026380060";
    const TIME_ZONE = "Asia/Jakarta";

    const $ = id => document.getElementById(id);
    const form = $("searchForm");
    const searchInput = $("orderSearch");

    if (!form || !searchInput) return;

    const currency = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    });

    const dateFormat = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeZone: TIME_ZONE
    });

    const timeFormat = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: TIME_ZONE
    });

    const stages = [
        "Pesanan Dibuat",
        "Dikonfirmasi",
        "Menuju Lokasi",
        "Pengerjaan",
        "Selesai & Review"
    ];

    const packageNames = {
        Basic: "Basic Cleaning",
        Standard: "Standard Cleaning",
        Deep: "Deep Cleaning"
    };

    function text(value) {
        return String(value ?? "").trim();
    }

    function normalizeId(value) {
        return text(value).replace(/^#\s*/, "").toUpperCase();
    }

    function put(id, value) {
        const element = $(id);
        if (element) element.textContent = text(value) || "—";
    }

    function make(tag, className, value = "") {
        const element = document.createElement(tag);
        if (className) element.className = className;
        element.textContent = value;
        return element;
    }

    function dateValue(value) {
        if (!value) return null;

        const input = /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? `${value}T12:00:00+07:00`
            : value;

        const date = new Date(input);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function clock(value) {
        const date = dateValue(value);
        return date ? `${timeFormat.format(date)} WIB` : "—";
    }

    function getBookings() {
        const stored = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
        return Array.isArray(stored)
            ? stored.filter(booking => booking && normalizeId(booking.id))
            : [];
    }

    function activeStage(status) {
        const label = text(status).toLowerCase();

        if (/^(selesai|rampung|completed)\b/.test(label)) return 4;
        if (/^(pengerjaan|sedang dikerjakan|in progress)\b/.test(label)) return 3;
        if (/^(menuju lokasi|dalam perjalanan|on the way)\b/.test(label)) return 2;
        if (/^(dikonfirmasi|confirmed)\b/.test(label)) return 1;

        return 0;
    }

    function renderProgress(booking) {
        const active = activeStage(booking.status);

        const timestamps = [
            booking.createdAt,
            booking.confirmedAt,
            booking.travelAt,
            booking.startedAt,
            booking.completedAt
        ];

        const items = stages.map((label, index) => {
            const item = make(
                "li",
                index < active ? "done" : index === active ? "current" : ""
            );

            if (index === active) item.setAttribute("aria-current", "step");

            const dot = make("span", "step-dot", String(index + 1));
            dot.setAttribute("aria-hidden", "true");

            const time = datesForStage(index);
            item.append(dot, make("strong", "", label), make("small", "", time));
            return item;

            function datesForStage(stage) {
                if (dateValue(timestamps[stage])) return clock(timestamps[stage]);
                return stage <= active ? "Waktu belum tercatat" : "Menunggu tahap";
            }
        });

        $("progress").replaceChildren(...items);
    }

    function addActivity(title, description, timestamp) {
        const item = make("li", "");
        const card = make("div", "activity");
        const header = make("div", "activity-top");

        header.append(make("h3", "", title), make("time", "", clock(timestamp)));
        card.append(header, make("p", "", description));
        item.append(card);
        $("timeline").append(item);
    }

    function billLine(title, description, amount) {
        const row = make("div", "bill-line");
        const detail = make("div", "");
        detail.append(make("strong", "", title));

        if (description) detail.append(make("p", "", description));

        const hasAmount = amount != null && text(amount) !== "";
        const price = hasAmount && Number.isFinite(Number(amount))
            ? currency.format(Number(amount))
            : "—";

        row.append(detail, make("b", "", price));
        return row;
    }

    function renderBooking(booking) {
        const id = normalizeId(booking.id);
        const packageName = packageNames[booking.package] || text(booking.package);
        const room = text(booking.room);
        const date = dateValue(booking.date);
        const session = text(booking.sessionLabel || booking.time);

        const address = [
            booking.address, booking.district, booking.region
        ].reduce((parts, value) => {
            const part = text(value);
            if (part && !parts.join(", ").toLowerCase().includes(part.toLowerCase())) {
                parts.push(part);
            }
            return parts;
        }, []).join(", ");

        put("orderCode", `#${id}`);
        put("orderStatus", booking.status || "Menunggu konfirmasi");
        put("packageBadge", packageName);
        put("arrival", [
            date ? dateFormat.format(date) : "",
            session && (/WIB$/i.test(session) ? session : `${session} WIB`)
        ].filter(Boolean).join(" – "));

        put("overviewPackage", packageName);
        put("overviewRoom", room ? `1× ${room}` : "");
        put("overviewDistrict", booking.district || booking.region);
        put("overviewAddress", booking.address);
        put("lastUpdated", clock(booking.updatedAt || booking.createdAt));

        put("customerName", booking.customerName);
        put("customerPhone", booking.phone);
        put("customerAddress", address);
        put("customerLandmark", booking.landmark || "Belum ada catatan patokan");

        const mapLink = $("mapLink");
        if (address) {
            mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        } else {
            mapLink.removeAttribute("href");
        }

        const note = text(booking.notes);
        put("cleanerNotes", note ? `Instruksi khusus: ${note}` : "");
        $("cleanerNotes").hidden = !note;
        $("roomPhoto").src = "../images/Gambar%20Panjang.png";

        const addons = Array.isArray(booking.addonItems) && booking.addonItems.length
            ? booking.addonItems.filter(item => item && text(item.name))
            : Array.isArray(booking.addons)
                ? booking.addons.filter(name => typeof name === "string").map(name => ({ name }))
                : [];

        const total = booking.price ?? booking.subtotal;
        const basePrice = booking.basePrice ?? (
            addons.length === 0 || booking.addonTotal != null
                ? Number(total) - Number(booking.addonTotal ?? 0)
                : null
        );

        $("billItems").replaceChildren(
            billLine([room, packageName].filter(Boolean).join(" — ") || "Layanan", booking.serviceDescription, basePrice),
            ...addons.map(addon => billLine(addon.name, "", addon.price))
        );

        const totalNumber = Number(total);
        put("billTotal", total != null && Number.isFinite(totalNumber)
            ? currency.format(totalNumber)
            : "—");

        const discount = Number(booking.discount || 0);
        put("discountAmount", `- ${currency.format(discount > 0 ? discount : 0)}`);

        const payment = text(booking.payment).toUpperCase();
        const paymentStatus = text(booking.paymentStatus) || "Belum diverifikasi";
        put("paymentBadge", [paymentStatus, payment].filter(Boolean).join(" · "));
        put("paymentTimestamp", clock(booking.paidAt || booking.paymentAt));

        const timeline = $("timeline");
timeline.replaceChildren();

const showDemoHistory = true;
const isPaid = /^(lunas|paid|terverifikasi)$/i.test(paymentStatus);
const isBankTransfer = /\bTRANSFER\b/i.test(payment);
const isDemoPayment = showDemoHistory && !isPaid
    && (payment === "QRIS" || isBankTransfer);const region = text(booking.region || booking.district);
const showDemoHub = showDemoHistory && Boolean(region);

const recordedCreatedAt = dateValue(booking.createdAt);
const demoDate = date ? new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
}).format(date) : "";

const createdAt = recordedCreatedAt
    ? recordedCreatedAt.toISOString()
    : showDemoHistory && demoDate
        ? `${demoDate}T07:35:00+07:00`
        : null;

if (isPaid || isDemoPayment) {
    const paymentTime = isDemoPayment
        ? (createdAt ? new Date(new Date(createdAt).getTime() + 5 * 60_000).toISOString() : null)
        : (booking.paidAt || booking.paymentAt);

    addActivity("Pembayaran Terverifikasi Lunas", "", paymentTime);

    const card = timeline.lastElementChild.querySelector(".activity");
    card.querySelector("h3").insertAdjacentHTML("beforeend", `
        <svg class="history-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="8"/>
            <circle cx="12" cy="12" r="1" fill="currentColor"/>
        </svg>
    `);

    const paragraph = card.querySelector("p");
    const method = /\bTRANSFER\b/i.test(payment) && /\bBCA\b/i.test(payment)
    ? "Transfer Bank BCA"
    : payment || "pembayaran";    paragraph.append(isDemoPayment ? `Transaksi instan ${method}` : `Transaksi ${method}`);

    if (total != null && Number.isFinite(totalNumber)) {
        paragraph.append(" senilai ", make("strong", "", currency.format(totalNumber)));
    }

    paragraph.append(isDemoPayment
        ? " berhasil diverifikasi secara otomatis oleh sistem. Status invoice: LUNAS. (Simulasi)"
        : " telah terverifikasi. Status invoice: LUNAS."
    );

    const transactionId = isDemoPayment
    ? `DEMO-${method.trim().replace(/\s+/g, "-")}-${id}`
    : text(booking.transactionId);

    if (transactionId) {
        card.append(make("span", "history-transaction", `▤ ID Transaksi: ${transactionId}`));
    }
}

const customer = text(booking.customerName);
const slot = session && (/WIB$/i.test(session) ? session : `${session} WIB`);
const schedule = date ? ` untuk jadwal pengerjaan ${dateFormat.format(date)}` : "";
const slotCopy = slot ? `, slot pukul ${slot}` : "";
const hubCopy = showDemoHub
    ? ` Sistem otomatis mencari mitra terverifikasi di area ${region}.`
    : "";

addActivity(
    "Pesanan Berhasil Dibuat",
    `Pelanggan${customer ? ` ${customer}` : ""} telah menyelesaikan formulir pemesanan online${schedule}${slotCopy}.${hubCopy}`,
    createdAt
);

if (showDemoHub) {
    const hub = make("span", "history-hub");
    hub.innerHTML = `
        <svg class="history-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/>
            <circle cx="12" cy="10" r="2.5"/>
        </svg>
    `;

    hub.append(make("span", "", `GriyaResik ${region} Operational Hub #04 (Simulasi)`));
    timeline.lastElementChild.querySelector(".activity").append(hub);
}

const demoNote = $("historyDemoNote");
demoNote.textContent = "Mode simulasi: contoh konfirmasi, verifikasi pembayaran, waktu yang belum tercatat, dan hub operasional. Tidak mengubah status pembayaran asli.";
demoNote.hidden = !(isDemoPayment || showDemoHub || (!recordedCreatedAt && createdAt));
put("historySyncText", "Auto-Sync Aktif");

        const message = `Halo GriyaResik, saya ingin bertanya tentang pesanan #${id}.`;
        const whatsappUrl = `https://wa.me/${CS_PHONE}?text=${encodeURIComponent(message)}`;

        $("supportLink").href = whatsappUrl;

        renderProgress(booking);
    }

    function displayOrder(id) {
        const bookingId = normalizeId(id);
        const message = $("message");

        $("orderContent").hidden = true;
        $("empty").hidden = true;
        message.hidden = true;

        try {
            const bookings = getBookings();

            if (!bookings.length) {
                $("empty").hidden = false;
                return;
            }

           const booking = bookingId
                ? bookings.find(item => normalizeId(item.id) === bookingId)
                : bookings[bookings.length - 1];

            if (!booking) {
                message.textContent = `Pesanan #${bookingId} tidak ditemukan. Periksa kode reservasinya.`;
                message.hidden = false;
                return;
            }

            renderBooking(booking);
            searchInput.value = `#${normalizeId(booking.id)}`;
            $("orderContent").hidden = false;
        } catch {
            message.textContent = "Data pesanan di browser tidak bisa dibaca.";
            message.hidden = false;
        }
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const id = normalizeId(searchInput.value);
        if (!id) return;

        const url = new URL(window.location.href);
        url.searchParams.set("id", id);
        window.history.replaceState(null, "", url.href);

        searchInput.value = `#${id}`;
        displayOrder(id);
    });

    $("roomPhoto").addEventListener("error", event => {
        event.currentTarget.hidden = true;
    });

    put("year", new Date().getFullYear());

    const initialId = normalizeId(
        new URLSearchParams(window.location.search).get("id")
    );

    if (initialId) searchInput.value = `#${initialId}`;
    displayOrder(initialId);

    window.addEventListener("storage", event => {
        if (event.key === BOOKINGS_KEY) {
            displayOrder(new URLSearchParams(window.location.search).get("id"));
        }
    });
})();