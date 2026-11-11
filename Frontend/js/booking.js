// =========================
// DATA RUANGAN BOOKING
// =========================

const rooms = [
    {
        name: "Kamar Tidur",
        icon: "🛏",
        desc: "Ruang Istirahat & Pribadi",
        meta: "Ganti sprei & debu sudut",
        label: "Prioritas #1",
        prices: [50000, 80000, 120000],
        time: "45–90 menit",
        details: [
            "Sapu, pel, lap meja, lap furnitur, bersihkan debu, rapikan tempat tidur, area sekitar tempat tidur, tempat sampah, sudut mudah dijangkau.",
            "Semua Basic + vacuum seluruh lantai, vacuum karpet, kaca/cermin, lemari luar, bawah furnitur mudah dijangkau, sudut/sela, kursi/sofa, detail area tempat tidur.",
            "Semua Standard + deep vacuum karpet, vacuum kasur, bantal, guling, sofa/kursi, kolong tempat tidur, sela furnitur, kusen/sela jendela, noda membandel, detail seluruh kamar."
        ]
    },
    {
        name: "Ruang Tamu",
        icon: "🛋",
        desc: "Area Utama Kunjungan Keluarga",
        meta: "Vakum sofa & karpet",
        label: "Populer",
        prices: [50000, 85000, 130000],
        time: "50–90 menit",
        details: [
            "Sapu, pel, lap meja, lap furnitur, debu, sampah, area utama.",
            "Basic + vacuum lantai, vacuum karpet, vacuum ringan sofa, kaca/cermin, sudut, detail furnitur, bawah furnitur mudah dijangkau.",
            "Standard + deep vacuum sofa/karpet, sela dan bawah sofa, detail meja/furnitur, noda membandel, seluruh sudut, area sulit dijangkau."
        ]
    },
    {
        name: "Dapur (Kitchen)",
        icon: "🍳",
        desc: "Area Persiapan Makanan",
        meta: "Pembersihan area dapur",
        label: "Detail",
        prices: [55000, 90000, 145000],
        time: "60–120 menit",
        details: [
            "Sapu, pel, lap meja dapur, lap permukaan, debu/kotoran ringan, sampah.",
            "Basic + kompor, wastafel, backsplash, kabinet luar, area sekitar peralatan, minyak ringan, sudut.",
            "Standard + deep cleaning kompor, kerak, deep cleaning wastafel, kabinet dalam yang kosong, sela kabinet, minyak membandel, belakang/bawah peralatan yang terjangkau, detail seluruh dapur."
        ]
    },
    {
        name: "Kamar Mandi",
        icon: "🚿",
        desc: "Anti Kerak & Bakteri",
        meta: "Sanitasi area kamar mandi",
        label: "Higienis",
        prices: [50000, 80000, 120000],
        time: "45–90 menit",
        details: [
            "Sapu, pel, toilet, wastafel, permukaan, sampah.",
            "Basic + sikat lantai, shower, kaca/cermin, dinding, detail toilet, noda ringan, sudut.",
            "Standard + kerak membandel, deep toilet, deep shower, deep wastafel, sela lantai, sudut sulit, detail seluruh kamar mandi."
        ]
    },
    {
        name: "Ruang Makan",
        icon: "🍽",
        desc: "Dining Room Bersih & Rapi",
        meta: "Sanitasi permukaan",
        label: "Keluarga",
        prices: [50000, 80000, 115000],
        time: "35–75 menit",
        details: [
            "Sapu & pel, lap meja makan, lap kursi, debu, sampah.",
            "Basic + vacuum lantai, kaca, furnitur, sudut, area bawah meja mudah dijangkau.",
            "Standard + vacuum karpet, kursi/sofa, kolong meja, sela furnitur, detail rak, seluruh area, area sulit."
        ]
    },
    {
        name: "Ruang Kerja (Home Office)",
        icon: "💻",
        desc: "Fokus Bersih Bebas Debu",
        meta: "Pembersihan area kerja",
        label: "Fokus",
        prices: [50000, 80000, 115000],
        time: "35–75 menit",
        details: [
            "Sapu & pel, lap meja kerja, debu, lap furnitur, sampah, area utama.",
            "Basic + vacuum lantai, kursi, kaca, rak luar, sudut, detail meja/furnitur.",
            "Standard + vacuum karpet, kursi/sofa, kolong meja, sela furnitur, detail rak, seluruh area kerja, area sulit."
        ]
    },
    {
        name: "Ruang Belajar",
        icon: "📚",
        desc: "Kenyamanan Belajar Anak",
        meta: "Area belajar bersih",
        label: "Produktif",
        prices: [50000, 80000, 115000],
        time: "35–75 menit",
        details: [
            "Sapu & pel, lap meja, debu, lap furnitur, sampah.",
            "Basic + vacuum lantai, rak luar, kursi, kaca, sudut, detail furnitur.",
            "Standard + vacuum karpet, kursi, detail rak, sela furnitur, kolong meja, area sulit."
        ]
    },
    {
        name: "Ruang Laundry",
        icon: "🧺",
        desc: "Area Mesin Cuci & Penjemuran",
        meta: "Area mesin cuci",
        label: "Utilitas",
        prices: [50000, 80000, 115000],
        time: "35–75 menit",
        details: [
            "Sapu & pel, lap permukaan, debu, sampah.",
            "Basic + lap mesin cuci luar, wastafel, vacuum, sudut, area sekitar peralatan.",
            "Standard + detail mesin cuci, bawah mesin, sela mesin, kerak, detail lantai/sudut/area sulit."
        ]
    },
    {
        name: "Teras Rumah",
        icon: "🏡",
        desc: "Area Outdoor Depan & Belakang",
        meta: "Pembersihan area luar",
        label: "Eksterior",
        prices: [50000, 70000, 100000],
        time: "30–60 menit",
        details: [
            "Menyapu, mengepel, lap permukaan, debu/kotoran ringan, sampah.",
            "Basic + pintu, kaca, furnitur, sudut.",
            "Standard + detail lantai, noda membandel, sela-sela, sudut, area sulit."
        ]
    },
    {
        name: "Garasi / Carport",
        icon: "🚗",
        desc: "Area Parkir Kendaraan",
        meta: "Pembersihan area parkir",
        label: "Eksterior",
        prices: [50000, 80000, 115000],
        time: "40–75 menit",
        details: [
            "Menyapu, mengepel area sesuai, debu, area utama, sampah ringan.",
            "Basic + detail lantai, sudut, lap permukaan, noda ringan, area bawah mudah dijangkau.",
            "Standard + detail lantai, bercak/noda membandel, sudut, sela, area sulit."
        ]
    },
    {
        name: "Gudang Penyimpanan",
        icon: "📦",
        desc: "Storage & Barang Koleksi",
        meta: "Pembersihan rak dan sudut",
        label: "Penyimpanan",
        prices: [55000, 90000, 140000],
        time: "45–90 menit",
        details: [
            "Menyapu, mengepel, debu, sampah ringan, area utama mudah dijangkau.",
            "Basic + vacuum, rak, sudut, permukaan, area yang mudah terlewat.",
            "Standard + detail rak, vacuum sela, area sulit, debu/kotoran berat, detail lantai/sudut."
        ]
    },
    {
        name: "Ruangan Kustom",
        icon: "🛋️",
        desc: "Musholla, studio, gym, balkon",
        meta: "Kebutuhan spesifik",
        label: "Kustom",
        prices: [50000, 75000, 105000],
        time: "Sesuai luas ruangan",
        details: [
            "Pembersihan dasar sesuai kondisi ruangan.",
            "Pembersihan lebih detail sesuai kebutuhan ruangan.",
            "Pembersihan menyeluruh sesuai kondisi ruangan."
        ]
    }
];

const packageNames = ["Basic Cleaning","Standard Cleaning","Deep Cleaning"];
const durations = ["35–45 menit","45–75 menit","60–120 menit"];

let currentStep = 0;
let selectedRoom = null;
let selectedPackage = null;

// AMBIL DATA DARI HALAMAN LAYANAN
const bookingParams = new URLSearchParams(window.location.search);

const roomFromLayanan = bookingParams.get("room");
const packageFromLayanan = bookingParams.get("package");
const priceFromLayanan = Number(bookingParams.get("price"));
const areaFromLayanan = bookingParams.get("area");
const timeFromLayanan = bookingParams.get("time");

let pricesFromLayanan = null;
let detailsFromLayanan = null;

try {
    const pricesParam = bookingParams.get("prices");
    const detailsParam = bookingParams.get("details");

    pricesFromLayanan = pricesParam
        ? JSON.parse(pricesParam)
        : null;

    detailsFromLayanan = detailsParam
        ? JSON.parse(detailsParam)
        : null;
} catch (error) {
    console.error("Data paket dari Layanan tidak dapat dibaca:", error);
}

const roomGrid = document.getElementById("roomGrid");

rooms.forEach((room, index) => {
    
    const button = document.createElement("button");
    button.type = "button";
    button.className = "room-card";
    button.innerHTML = `
        <span class="room-check">✓</span>
        <span class="room-icon">${room.icon}</span>
        <h3>${room.name}</h3>
        <p>${room.desc}</p>
    <div class="room-meta">
         <span>♧ ${room.meta}</span>
         <span>${room.label}</span>
    </div>
    `;

    button.addEventListener("click", () => {
        selectedRoom = index;
        document.querySelectorAll(".room-card").forEach(card => card.classList.remove("selected"));
        button.classList.add("selected");
        updateSummary();
    });

    roomGrid.appendChild(button);
});

// OTOMATIS MEMILIH DATA DARI HALAMAN LAYANAN
if (roomFromLayanan && packageFromLayanan) {

    const roomName = areaFromLayanan
        ? "Ruangan Kustom"
        : roomFromLayanan;

    selectedRoom = rooms.findIndex(
        room => room.name === roomName
    );

    const validPackages = ["Basic", "Standard", "Deep"];

    if (
        selectedRoom !== -1 &&
        validPackages.includes(packageFromLayanan)
    ) {
        selectedPackage = packageFromLayanan;

        document.querySelectorAll(".room-card").forEach((card, index) => {
            card.classList.toggle("selected", index === selectedRoom);
        });

        const packageButton = document.querySelector(
            `[data-package="${selectedPackage}"]`
        );

        if (packageButton) {
            packageButton.classList.add("selected");
        }

        currentStep = 2;

    } else {
        selectedRoom = null;
        selectedPackage = null;
        currentStep = 0;
    }

} else {
    currentStep = 0;
}

document.querySelectorAll("[data-package]").forEach(button => {
    button.addEventListener("click", () => {
        selectedPackage = button.dataset.package;
        document.querySelectorAll("[data-package]").forEach(card => card.classList.remove("selected"));
        button.classList.add("selected");
        updateSummary();
    });
});

function rupiah(number) {
    return "Rp " + number.toLocaleString("id-ID");
}

function getBasePrice() {
    if (selectedRoom === null || selectedPackage === null) return 0;

    const packageIndex = { Basic: 0, Standard: 1, Deep: 2 }[selectedPackage];
    const currentRoom = rooms[selectedRoom];

    // Ruangan kustom: gunakan harga hasil kalkulator dari halaman Layanan.
    if (
        areaFromLayanan &&
        Number.isFinite(priceFromLayanan) &&
        priceFromLayanan > 0
    ) {
        return priceFromLayanan;
    }

    // Ruangan standar dari Layanan: gunakan harga paket sesuai ruangan tersebut.
    if (
        roomFromLayanan === currentRoom.name &&
        Array.isArray(pricesFromLayanan) &&
        pricesFromLayanan.length === 3 &&
        Number.isFinite(Number(pricesFromLayanan[packageIndex]))
    ) {
        return Number(pricesFromLayanan[packageIndex]);
    }

    // Booking dibuka langsung atau user mengganti ruangan: gunakan harga default Booking.
    return currentRoom.prices[packageIndex];
}

function getAddonTotal() {
    return [...document.querySelectorAll('input[name="addon"]:checked')]
        .reduce((sum, item) => sum + Number(item.value), 0);
}

function getAddonNames() {
    return [...document.querySelectorAll('input[name="addon"]:checked')]
        .map(item => item.dataset.name);
}

function getTotal() {
    return getBasePrice() + getAddonTotal();
}

function updateSummary() {
    const roomName = selectedRoom === null
        ? "Belum dipilih"
        : rooms[selectedRoom].name;

    const selectedRoomText = document.getElementById("selectedRoomText");

    if (selectedRoomText) {
        selectedRoomText.textContent = selectedRoom === null
            ? "Pilih ruangan terlebih dahulu"
            : "Ruangan terpilih: " + roomName;
    }

    const packageIndex = { Basic: 0, Standard: 1, Deep: 2 };

    const packageName = selectedPackage
        ? packageNames[packageIndex[selectedPackage]]
        : "Belum dipilih";

    document.getElementById("sumRoom").textContent = roomName;
    document.getElementById("sumPackage").textContent = packageName;
    document.getElementById("sumAddon").textContent =
        getAddonNames().join(", ") || "Tidak ada";

    document.getElementById("sumDuration").textContent =
        selectedPackage
            ? (roomFromLayanan === roomName && timeFromLayanan
                ? timeFromLayanan
                : rooms[selectedRoom].time)
            : "35–75 menit";

    document.getElementById("sumTotal").textContent = rupiah(getTotal());
    const cleanerSelected = document.querySelector(
    'input[name="cleanerPreference"]:checked'
    );

    const sumCleaner = document.getElementById("sumCleaner");

    if (sumCleaner) {
        sumCleaner.textContent = cleanerSelected
            ? cleanerSelected.value
            : "Bebas";
    }
    const notesInput = document.getElementById("notes");
    const sumNotes = document.getElementById("sumNotes");

    if (sumNotes) {
    sumNotes.textContent = notesInput
        ? notesInput.value.trim() || "Belum ada instruksi khusus"
        : "Belum ada instruksi khusus";
    }

    // UPDATE RINCIAN RUANGAN SAAT INI
const detailRoomNow = document.getElementById("detailRoomNow");
const detailPackageNow = document.getElementById("detailPackageNow");
const detailDurationNow = document.getElementById("detailDurationNow");
const detailBasePriceNow = document.getElementById("detailBasePriceNow");
const detailAddonPriceNow = document.getElementById("detailAddonPriceNow");
const detailSubtotalNow = document.getElementById("detailSubtotalNow");

if (detailRoomNow) {
    detailRoomNow.textContent = roomName;
}

if (detailPackageNow) {
    detailPackageNow.textContent = packageName;
}

if (detailDurationNow) {
    detailDurationNow.textContent = selectedPackage && selectedRoom !== null
        ? rooms[selectedRoom].time
        : "-";
}

if (detailBasePriceNow) {
    detailBasePriceNow.textContent = rupiah(getBasePrice());
}

if (detailAddonPriceNow) {
    detailAddonPriceNow.textContent = rupiah(getAddonTotal());
}

if (detailSubtotalNow) {
    detailSubtotalNow.textContent = rupiah(getTotal());
}

    document.getElementById("finalService").textContent =
        roomName + " — " + packageName;

    document.getElementById("finalTotal").textContent = rupiah(getTotal());

    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");

    const date = dateInput ? dateInput.value : "";
    const time = timeInput ? timeInput.value : "";

document.getElementById("finalSchedule").textContent =
    date && time ? date + " pukul " + time + " WIB" :
    time ? "Pukul " + time + " WIB" : "Belum dipilih";

    if (selectedRoom !== null) {
        const currentRoom = rooms[selectedRoom];

        let currentPrices = currentRoom.prices;
        let currentDetails = currentRoom.details;

        if (
            areaFromLayanan &&
            currentRoom.name === "Ruangan Kustom" &&
            Array.isArray(pricesFromLayanan) &&
            pricesFromLayanan.length === 3
        ) {
            currentPrices = pricesFromLayanan;
        } else if (
            roomFromLayanan === currentRoom.name &&
            Array.isArray(pricesFromLayanan) &&
            pricesFromLayanan.length === 3
        ) {
            currentPrices = pricesFromLayanan;
        }

        if (
            roomFromLayanan === currentRoom.name &&
            Array.isArray(detailsFromLayanan) &&
            detailsFromLayanan.length === 3
        ) {
            currentDetails = detailsFromLayanan;
        }

        document.getElementById("priceBasic").textContent = rupiah(currentPrices[0]);
        document.getElementById("priceStandard").textContent = rupiah(currentPrices[1]);
        document.getElementById("priceDeep").textContent = rupiah(currentPrices[2]);

        const detailBasic = document.getElementById("detailBasic");
        const detailStandard = document.getElementById("detailStandard");
        const detailDeep = document.getElementById("detailDeep");

        if (detailBasic) detailBasic.textContent = currentDetails[0];
        if (detailStandard) detailStandard.textContent = currentDetails[1];
        if (detailDeep) detailDeep.textContent = currentDetails[2];
    }
}

document.querySelectorAll('input[name="addon"], input[name="cleanerPreference"], #date, #time, #notes').forEach(input => {
    input.addEventListener("change", updateSummary);
});
const notesInput = document.getElementById("notes");

if (notesInput) {
    notesInput.addEventListener("input", updateSummary);
}

const stepTitles = [
    "Pilih Ruangan yang Ingin Dibersihkan",
    "Pilih Jenis Pembersihan",
    "Tambahkan Layanan dan Catatan",
    "Periksa Ringkasan Pesanan",
    "Alamat dan Biodata Pelanggan"
];

const stepDescriptions = [
    "Pilih satu ruangan yang ingin Anda jadwalkan pembersihannya. Anda dapat menambahkan ruangan lain setelah langkah ini dengan rekomendasi formula ramah lingkungan.",
    "Tentukan paket sesuai kebutuhan dan tingkat kebersihan yang diinginkan.",
    "Pilih layanan tambahan bila dibutuhkan dan tuliskan instruksi khusus.",
    "Periksa ruangan, paket, tambahan layanan, serta total estimasi.",
    "Lengkapi informasi kontak, alamat, dan jadwal untuk menyelesaikan reservasi."
];

const stepEyebrows = [
    "▣ TAHAP 01 — RUANG UTAMA",
    "▣ TAHAP 02 — JENIS PEMBERSIHAN",
    "▣ TAHAP 03 — ADD-ON & CATATAN",
    "▣ TAHAP 04 — RINGKASAN PESANAN",
    "▣ TAHAP 05 — DATA PELANGGAN"
];

function renderStep() {
    document.querySelectorAll(".booking-step").forEach((section, index) => {
        section.classList.toggle("active", index === currentStep);
    });

    document.querySelectorAll(".progress-step").forEach((step, index) => {
        step.classList.toggle("active", index === currentStep);
        step.classList.toggle("done", index < currentStep);
        step.querySelector(".step-number").textContent = index < currentStep ? "✓" : index + 1;
    });

    document.getElementById("stepLabel").textContent = `Langkah ${currentStep + 1} dari 5`;
    document.getElementById("stepTitle").textContent = stepTitles[currentStep];
    document.getElementById("stepDescription").textContent = stepDescriptions[currentStep];
    document.getElementById("eyebrow").textContent = stepEyebrows[currentStep];

    // Tampilkan kartu sesuai langkah booking
    document.getElementById("cleaningImageCard").style.display =
    currentStep === 0 ? "flex" : "none";

    document.getElementById("hospitalCard").style.display =
    currentStep === 1 ? "flex" : "none";
    const selectionInfo = document.querySelector(".navigation-buttons .selection-info");

    if (selectionInfo) {
        selectionInfo.style.display = currentStep === 0 ? "flex" : "none";
    }
    const backBtn = document.getElementById("backBtn");

    if (backBtn) {
    backBtn.style.display = currentStep > 0 ? "inline-block" : "none";
    }

    document.getElementById("nextBtn").textContent =
        currentStep === 4 ? "Konfirmasi Booking ✓" :
        currentStep === 3 ? "Lanjut: Alamat & Biodata →" :
        currentStep === 2 ? "Lanjut: Ringkasan & Total →" :
        currentStep === 1 ? "Lanjut: Add-on & Catatan →" :
        "Lanjut: Pilih Jenis Pembersihan →";

    const selectedRoomLabel = document.getElementById("selectedRoomLabel");

if (selectedRoomLabel) {
    selectedRoomLabel.innerHTML = selectedRoom === null
        ? '♧ Ruangan: Belum dipilih'
        : `♧ Ruangan: ${rooms[selectedRoom].name}
           <span>•</span>
           <a href="#" id="changeRoomBtn">Ubah Ruangan</a>`;

    const changeRoomBtn = document.getElementById("changeRoomBtn");

    if (changeRoomBtn) {
        changeRoomBtn.addEventListener("click", (event) => {
            event.preventDefault();
            currentStep = 0;
            renderStep();
        });
    }
}
 
const standardCard = document.querySelector(".standard-card");

    if (standardCard) {
    standardCard.style.display = currentStep === 0 ? "flex" : "none";
        }

    updateSummary();
}

const nextBtn = document.getElementById("nextBtn");

nextBtn.addEventListener("click", () => {
    // Validasi pilihan ruangan pada langkah pertama
    if (currentStep === 0 && selectedRoom === null) {
        alert("Pilih ruangan terlebih dahulu, ya!");
        return;
    }

    // Validasi pilihan paket pada langkah kedua
    if (currentStep === 1 && selectedPackage === null) {
        alert("Pilih jenis pembersihan terlebih dahulu, ya!");
        return;
    }

    // Proses konfirmasi booking pada langkah kelima
    if (currentStep === 4) {
        const form = document.getElementById("bookingForm");

        if (!form.reportValidity()) return;

        const booking = {
            id: "GR-" + Date.now().toString().slice(-8),
            customerName: document.getElementById("customerName").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            address: document.getElementById("address").value.trim(),
            room: rooms[selectedRoom].name,
            package: selectedPackage,
            addons: getAddonNames(),
            notes: document.getElementById("notes").value.trim(),
            cleanerPreference: document.querySelector('input[name="cleanerPreference"]:checked')?.value || "Bebas",
            date: document.getElementById("date").value,
            time: document.getElementById("time").value,
            payment: document.getElementById("payment").value,
            price: getTotal(),
            status: "Menunggu konfirmasi"
        };

        try {
            const bookings = JSON.parse(
                localStorage.getItem("griyaResikBookings") || "[]"
            );

            bookings.push(booking);

            localStorage.setItem(
                "griyaResikBookings",
                JSON.stringify(bookings)
            );

            alert("Booking berhasil dicatat! Nomor pesanan: " + booking.id);
            window.location.href = "my-bookings.html";
        } catch (error) {
            alert("Booking belum dapat disimpan di browser. Silakan coba lagi.");
        }

        return;
    }

    // Pindah ke langkah berikutnya
    currentStep++;
    renderStep();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        renderStep();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
});

const today = new Date();
const dateInput = document.getElementById("date");

if (dateInput) {
    dateInput.min = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];
}

renderStep();
