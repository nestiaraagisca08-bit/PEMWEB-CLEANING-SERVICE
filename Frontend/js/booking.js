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

// =========================
// FOTO SETIAP RUANGAN
// =========================

const roomImages = {
    "Kamar Tidur": "../images/1. Kamar Tidur.png",
    "Ruang Tamu": "../images/2. Ruang Tamu.png",
    "Dapur (Kitchen)": "../images/3. Dapur.png",
    "Kamar Mandi": "../images/4. Kamar Mandi.png",
    "Ruang Makan": "../images/5. Ruang Makan.png",
    "Ruang Kerja (Home Office)": "../images/6. Ruang Kerja.png",
    "Ruang Belajar": "../images/7. Ruang Belajar.png",
    "Ruang Laundry": "../images/8. Ruang laundry.png",
    "Teras Rumah": "../images/9. Teras.png",
    "Garasi / Carport": "../images/10. Garasi : Carport.png",
    "Gudang Penyimpanan": "../images/11. Gudang.png",
    "Ruangan Kustom": "../images/12. Studio Kreatif.png"
};

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
    const roomChanged = selectedRoom !== index;

    selectedRoom = index;

    document.querySelectorAll(".room-card").forEach(card => {
        card.classList.remove("selected");
    });

    button.classList.add("selected");

    if (roomChanged) {
        selectedPackage = null;

        document.querySelectorAll("[data-package]").forEach(card => {
            card.classList.remove("selected");
        });
    }

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

    const packageIndex = {
        Basic: 0,
        Standard: 1,
        Deep: 2
    }[selectedPackage];

    const currentRoom = rooms[selectedRoom];

    // Harga kustom berdasarkan daftar harga kalkulator Layanan
    if (
        areaFromLayanan &&
        currentRoom.name === "Ruangan Kustom" &&
        Array.isArray(pricesFromLayanan) &&
        pricesFromLayanan.length === 3
    ) {
        const customPrice = Number(pricesFromLayanan[packageIndex]);

        if (Number.isFinite(customPrice) && customPrice > 0) {
            return customPrice;
        }
    }

    // Harga asli dari Layanan untuk paket yang sedang dipilih
    if (
        !areaFromLayanan &&
        roomFromLayanan === currentRoom.name &&
        Array.isArray(pricesFromLayanan) &&
        pricesFromLayanan.length === 3
    ) {
        const servicePrice = Number(pricesFromLayanan[packageIndex]);

        if (Number.isFinite(servicePrice) && servicePrice > 0) {
            return servicePrice;
        }
    }

    // Harga kalkulator tunggal hanya untuk paket asal
    if (
        areaFromLayanan &&
        currentRoom.name === "Ruangan Kustom" &&
        selectedPackage === packageFromLayanan &&
        Number.isFinite(priceFromLayanan) &&
        priceFromLayanan > 0
    ) {
        return priceFromLayanan;
    }

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

// UPDATE LABEL RUANGAN TERPILIH DI STEP 2 DAN STEP 3
function updateSelectedRoomLabels() {
    const roomName = selectedRoom === null
        ? "Belum dipilih"
        : rooms[selectedRoom].name;

    document.querySelectorAll(".selected-room-label").forEach(label => {
        label.innerHTML = `
            ♧ Ruangan: ${roomName}
            <span>•</span>
            <a href="#" class="changeRoomBtn">Ubah Ruangan</a>
        `;

        label.querySelector(".changeRoomBtn").addEventListener("click", event => {
            event.preventDefault();
            currentStep = 0;
            renderStep();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });
}

function updateSummary() {
    updateSelectedRoomLabels();

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
        ? (
            roomFromLayanan === roomName &&
            selectedPackage === packageFromLayanan &&
            timeFromLayanan
                ? timeFromLayanan
                : durations[packageIndex[selectedPackage]]
        )
        : "Belum dipilih";

document.getElementById("sumTotal").textContent = rupiah(getTotal());

// SINKRONISASI RINCIAN PESANAN STEP 5
const finalSubtotal = document.getElementById("finalSubtotal");
const finalGrandTotal = document.getElementById("finalGrandTotal");
const finalOrderItems = document.getElementById("finalOrderItems");

const subtotal = getTotal();

if (finalSubtotal) {
    finalSubtotal.textContent = rupiah(subtotal);
}

if (finalGrandTotal) {
    finalGrandTotal.textContent = rupiah(subtotal);
}

if (finalOrderItems) {
    finalOrderItems.replaceChildren();

    if (
        selectedRoom !== null &&
        selectedRoom >= 0 &&
        rooms[selectedRoom] &&
        selectedPackage
    ) {
        const packageIndex = {
            Basic: 0,
            Standard: 1,
            Deep: 2
        }[selectedPackage];

        const orderLine = document.createElement("div");
        orderLine.className = "final-order-line";

        const roomName = document.createElement("span");
        roomName.textContent = "1x " + rooms[selectedRoom].name;

        const packageName = document.createElement("strong");
        packageName.textContent = packageNames[packageIndex];

        orderLine.append(roomName, packageName);
        finalOrderItems.appendChild(orderLine);

        getAddonNames().forEach(addon => {
            const addonLine = document.createElement("div");
            addonLine.className = "final-order-line addon";

            const addonName = document.createElement("span");
            addonName.textContent = "+ " + addon;

            const addonBadge = document.createElement("strong");
            addonBadge.textContent = "Add-on";

            addonLine.append(addonName, addonBadge);
            finalOrderItems.appendChild(addonLine);
        });

    } else {
        const emptyLine = document.createElement("div");
        emptyLine.className = "final-order-empty";
        emptyLine.textContent =
            "Pilih ruangan dan paket terlebih dahulu.";

        finalOrderItems.appendChild(emptyLine);
    }
}

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

// UPDATE FOTO RUANGAN STEP 3
const detailRoomImage = document.getElementById("detailRoomImage");

if (detailRoomImage && selectedRoom !== null) {
    const currentRoomName = rooms[selectedRoom].name;

    detailRoomImage.src = roomImages[currentRoomName];
    detailRoomImage.alt = "Foto " + currentRoomName;
}

if (detailPackageNow) {
    detailPackageNow.textContent = packageName;
}

if (detailDurationNow) {
    detailDurationNow.textContent =
        document.getElementById("sumDuration").textContent;
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
            (
                (areaFromLayanan && currentRoom.name === "Ruangan Kustom") ||
                (!areaFromLayanan && roomFromLayanan === currentRoom.name)
            ) &&
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

document.querySelectorAll('input[name="addon"], input[name="cleanerPreference"], #notes').forEach(input => {
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
    
const selectionInfo = document.querySelector(
    ".navigation-buttons .selection-info"
);

if (selectionInfo) {
    selectionInfo.style.display =
        currentStep === 0 ? "flex" : "none";
}

// SEMBUNYIKAN NAVIGASI DEFAULT KHUSUS STEP 5
const navigationButtons = document.querySelector(
    ".navigation-buttons"
);

if (navigationButtons) {
    navigationButtons.style.display =
        currentStep === 4 ? "none" : "flex";
}

const backBtn = document.getElementById("backBtn");

if (backBtn) {
    backBtn.style.display =
        currentStep > 0 ? "inline-block" : "none";
}

    document.getElementById("nextBtn").textContent =
        currentStep === 4 ? "Konfirmasi Booking ✓" :
        currentStep === 3 ? "Lanjut: Alamat & Biodata →" :
        currentStep === 2 ? "Lanjut: Ringkasan & Total →" :
        currentStep === 1 ? "Lanjut: Add-on & Catatan →" :
        "Lanjut: Pilih Jenis Pembersihan →";

    const selectedRoomLabel = document.getElementById("selectedRoomLabel");
 
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
    if (
        selectedRoom === null ||
        !["Basic", "Standard", "Deep"].includes(selectedPackage)
    ) {
        alert("Silakan lengkapi pilihan ruangan dan paket terlebih dahulu.");
        currentStep = selectedRoom === null ? 0 : 1;
        renderStep();
        return;
    }

    const form = document.getElementById("bookingForm");

    if (!form || !form.reportValidity()) return;
        const phoneInput = document.getElementById("finalCustomerPhone");
        const phoneNumber = phoneInput.value.trim().replace(/\D/g, "").replace(/^0/, "");

        if (!/^8\d{8,12}$/.test(phoneNumber)) {
            alert("Masukkan nomor WhatsApp Indonesia yang valid, tanpa +62.");
            phoneInput.focus();
            return;
        }

        const district = document.getElementById("district");
        const region = document.getElementById("region");
        const selectedDistrict = district.options[district.selectedIndex];

        if (!district.value || !selectedDistrict.dataset.zone || !region.value.trim()) {
            alert("Pilih kecamatan yang terlayani agar wilayah terisi otomatis.");
            district.focus();
            return;
        }

const selectedPayment = document.querySelector(
    'input[name="paymentMethod"]:checked'
);

if (!selectedBookingDate) {
    alert("Silakan pilih tanggal kunjungan terlebih dahulu.");
    return;
}

if (selectedBookingDate < getLocalDateValue(new Date())) {
    alert("Tanggal kunjungan tidak boleh di masa lalu.");
    return;
}

updateAvailableSessions();

const validSelectedTime = document.querySelector(
    'input[name="session_time"]:checked:not(:disabled)'
);

if (!validSelectedTime) {
    alert("Pilih sesi jam yang masih tersedia.");
    return;
}

if (!selectedPayment) {
    alert("Silakan pilih metode pembayaran.");
    return;
}

        const booking = {
            id: "GR-" + Date.now().toString().slice(-8),
            customerName: document.getElementById("finalCustomerName").value.trim(),
            phone: "+62" + phoneNumber,
            email: document.getElementById("finalCustomerEmail").value.trim(),
            propertyType: document.querySelector('input[name="propertyType"]:checked')?.value || "",
            landmark: document.getElementById("landmark").value.trim(),
            region: document.getElementById("region").value,
            district: document.getElementById("district").value,
            address: document.getElementById("address").value.trim(),
            room: rooms[selectedRoom].name,
            package: selectedPackage,
            addons: getAddonNames(),
            addonItems: [...document.querySelectorAll('input[name="addon"]:checked')]
                .map(input => ({
                    name: input.dataset.name,
                    price: Number(input.value)
                })),

            duration: document.getElementById("sumDuration").textContent,

            serviceDescription: rooms[selectedRoom].details[
                { Basic: 0, Standard: 1, Deep: 2 }[selectedPackage]
            ],
            notes: document.getElementById("notes").value.trim(),
            cleanerPreference: document.querySelector('input[name="cleanerPreference"]:checked')?.value || "Bebas",
            date: selectedBookingDate,
            time: validSelectedTime.value,
            payment: selectedPayment.value,
            basePrice: getBasePrice(),
            addonTotal: getAddonTotal(),
            subtotal: getTotal(),
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

            showBookingConfirmation(booking);

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

renderStep();


// =====================================
// STEP 5 — INTERAKSI TANGGAL, JAM, LOKASI
// =====================================

// FORMAT TANGGAL KE BAHASA INDONESIA
function formatBookingDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue + "T00:00:00");

    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


 // STEP 5 — PILIHAN TANGGAL KUNJUNGAN
let selectedBookingDate = "";

const finalDateOptions = document.getElementById("finalDateOptions");

function getLocalDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function selectBookingDate(dateValue) {
    selectedBookingDate = dateValue;

    document.querySelectorAll(".final-date-option").forEach(button => {
        button.classList.toggle(
            "selected",
            button.dataset.date === dateValue
        );
    });

    const customDateCard = document.querySelector(".final-date-custom");
    const customDateInput = document.getElementById("finalCustomDate");

    if (customDateCard && customDateInput) {
        const isCustomDate =
            dateValue !== "" &&
            !document.querySelector(
                `.final-date-option[data-date="${dateValue}"]`
            );

        customDateCard.classList.toggle("selected", isCustomDate);

        const customTitle = customDateCard.querySelector("strong");
const customSubtitle = customDateCard.querySelector("small");
const customIcon = customDateCard.querySelector("svg");

if (isCustomDate) {
    customDateInput.value = dateValue;

    const selectedDate = new Date(dateValue + "T12:00:00");

    customTitle.textContent = selectedDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short"
    });

    customSubtitle.textContent = selectedDate.toLocaleDateString("id-ID", {
        weekday: "long"
    });

    if (customIcon) customIcon.style.display = "none";

} else {
    customDateInput.value = "";

    customTitle.textContent = "Pilih Tanggal";
    customSubtitle.textContent = "Tanggal lainnya";

    if (customIcon) customIcon.style.display = "";
}
    }

    updateAvailableSessions();
    updateFinalBookingSummary();
}

function updateAvailableSessions() {
    const now = new Date();
    const today = getLocalDateValue(now);

    document.querySelectorAll('input[name="session_time"]').forEach(radio => {
        const sessionDateTime = new Date(
            `${selectedBookingDate}T${radio.value}:00`
        );

        const unavailable =
            !selectedBookingDate ||
            selectedBookingDate < today ||
            (selectedBookingDate === today && sessionDateTime <= now);

        radio.disabled = unavailable;

        if (unavailable && radio.checked) {
            radio.checked = false;
        }

        const option = radio.closest(".final-time-option");

        if (option) {
            option.style.opacity = unavailable ? "0.45" : "1";
            option.style.cursor = unavailable ? "not-allowed" : "pointer";
        }
    });
}

function renderFinalDateOptions() {
    if (!finalDateOptions) return;

    finalDateOptions.innerHTML = "";

    const today = new Date();

    for (let offset = 0; offset < 3; offset++) {
        const date = new Date(today);
        date.setDate(today.getDate() + offset);

        const dateValue = getLocalDateValue(date);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "final-date-option";
        button.dataset.date = dateValue;

        const dayLabel = offset === 0
            ? "Hari Ini"
            : offset === 1
                ? "Besok"
                : "Lusa";

        const monthLabel = date.toLocaleDateString("id-ID", {
            month: "short"
        });

        const weekdayLabel = date.toLocaleDateString("id-ID", {
            weekday: "long"
        });

        button.innerHTML = `
            <small>${dayLabel}</small>
            <strong>${date.getDate()} ${monthLabel}</strong>
            <span class="date-weekday">${weekdayLabel}</span>
        `;

        button.addEventListener("click", () => {
            selectBookingDate(dateValue);
        });

        finalDateOptions.appendChild(button);
    }

    // PILIH TANGGAL LAINNYA
    const customLabel = document.createElement("label");
    customLabel.className = "final-date-custom";

    customLabel.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2">
        <use href="#s5-calendar"></use>
    </svg>
    <strong>Pilih Tanggal</strong>
    <small>Tanggal lainnya</small>
    <input type="date" id="finalCustomDate"
           min="${getLocalDateValue(today)}">
    `;

    finalDateOptions.appendChild(customLabel);

    const customInput = document.getElementById("finalCustomDate");

    // Buka kalender bawaan browser saat kartu diklik
    customInput.addEventListener("click", () => {
        if (typeof customInput.showPicker === "function") {
            try {
                customInput.showPicker();
            } catch (error) {
                customInput.focus();
            }
        } else {
            customInput.focus();
        }
    });

    // Proses tanggal yang dipilih (kode lama)
    customInput.addEventListener("change", () => {
        if (!customInput.value) return;

        const minimumDate = getLocalDateValue(new Date());

        if (customInput.value < minimumDate) {
            alert("Tanggal kunjungan tidak boleh di masa lalu.");
            customInput.value = "";
            return;
        }

        selectBookingDate(customInput.value);
    });
}

renderFinalDateOptions();
updateAvailableSessions();

 // PILIH SESI JAM KEDATANGAN STEP 5
document.querySelectorAll('input[name="session_time"]').forEach(radio => {
    radio.addEventListener("change", () => {
        updateFinalBookingSummary();
    });
});


// =====================================
// STEP 5 — SINKRONISASI LOKASI SURABAYA
// =====================================

const districtInput = document.getElementById("district");

const regionNames = {
    Barat: "Surabaya Barat",
    Timur: "Surabaya Timur",
    Selatan: "Surabaya Selatan",
    Utara: "Surabaya Utara",
    Pusat: "Surabaya Pusat"
};

function updateDistrictLocation() {
    if (!districtInput) return;

    const selectedOption =
        districtInput.options[districtInput.selectedIndex];

    const selectedZone = selectedOption?.dataset.zone || "";
    const selectedDistrict = districtInput.value;

    const regionInput = document.getElementById("region");
    const mapDistrictLabel = document.getElementById("mapDistrictLabel");

    const regionName = regionNames[selectedZone] || "";

    // Wilayah otomatis mengikuti kecamatan
    if (regionInput) {
        regionInput.value = regionName;
    }

    // Label peta mengikuti kecamatan dan wilayah
    if (mapDistrictLabel) {
        mapDistrictLabel.textContent = selectedDistrict && regionName
            ? `${selectedDistrict}, ${regionName}`
            : "Pilih kecamatan terlebih dahulu";
    }
}

// Perbarui ketika kecamatan berubah
if (districtInput) {
    districtInput.addEventListener("change", updateDistrictLocation);
}

// Sinkronisasi pilihan awal tanpa menghapus input pengguna
updateDistrictLocation();

// UPDATE PREFERENSI CLEANER DI SIDEBAR
function updateFinalCleaner() {
    const cleanerSelected = document.querySelector(
        'input[name="cleanerPreference"]:checked'
    );

    const finalCleaner = document.getElementById("finalCleaner");

    if (finalCleaner) {
        finalCleaner.textContent = cleanerSelected
            ? cleanerSelected.value
            : "Bebas";
    }
}


function updateFinalBookingSummary() {
    updateSummary();
    updateFinalCleaner();

    const finalSchedule = document.getElementById("finalScheduleSummary");
    const selectedTime = document.querySelector(
        'input[name="session_time"]:checked'
    );

    if (finalSchedule) {
        if (selectedBookingDate && selectedTime) {
            finalSchedule.textContent =
                `${formatBookingDate(selectedBookingDate)}, pukul ${selectedTime.value} WIB`;
        } else if (selectedBookingDate) {
            finalSchedule.textContent =
                formatBookingDate(selectedBookingDate) + " — pilih sesi jam";
        } else {
            finalSchedule.textContent = "Belum memilih jadwal";
        }
    }
}

// PANTAU PERUBAHAN DATA STEP 5
[
    "#finalCustomerName",
    "#finalCustomerPhone",
    "#finalCustomerEmail",
    "#landmark",
    "#district",
    "#address"

].forEach(selector => {
    const element = document.querySelector(selector);

    if (element) {
        element.addEventListener("input", () => {

            // Nomor WhatsApp hanya boleh berisi angka 0-9
            if (element.id === "finalCustomerPhone") {
                element.value = element.value.replace(/[^0-9]/g, "");
            }

            updateFinalBookingSummary();
        });

        element.addEventListener("change", updateFinalBookingSummary);
    }
});

// TOMBOL KONFIRMASI PADA SIDEBAR STEP 5
const finalConfirmBtn = document.getElementById("finalConfirmButton");

if (finalConfirmBtn) {
    finalConfirmBtn.addEventListener("click", () => {
        if (currentStep !== 4) return;

        const nextBtn = document.getElementById("nextBtn");

        if (nextBtn) {
            nextBtn.click();
        }
    });
}

// TOMBOL KEMBALI KE STEP 4 DARI SIDEBAR STEP 5
const finalBackSummaryBtn = document.getElementById(
    "finalBackSummaryButton"
);

if (finalBackSummaryBtn) {
    finalBackSummaryBtn.addEventListener("click", () => {
        if (currentStep !== 4) return;

        const backBtn = document.getElementById("backBtn");

        if (backBtn) {
            backBtn.click();
        }
    });
}

// TAMPILKAN RINGKASAN AWAL
updateFinalBookingSummary();

// TAMPILKAN DETAIL METODE PEMBAYARAN
const paymentRadios = document.querySelectorAll(
    'input[name="paymentMethod"]'
);

const bankPaymentInfo = document.getElementById("bankPaymentInfo");
const qrisPaymentInfo = document.getElementById("qrisPaymentInfo");

function updatePaymentDetails() {
    const selectedPayment = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    const paymentValue = selectedPayment?.value || "";

    if (bankPaymentInfo) {
        bankPaymentInfo.hidden =
            paymentValue !== "Transfer Bank BCA";
    }

    if (qrisPaymentInfo) {
        qrisPaymentInfo.hidden =
            paymentValue !== "QRIS";
    }
}

paymentRadios.forEach(radio => {
    radio.addEventListener("change", updatePaymentDetails);
});

updatePaymentDetails();

// KONFIRMASI PESANAN DALAM HALAMAN BOOKING YANG SAMA
function showBookingConfirmation(booking) {
    const section = document.getElementById("bookingConfirmation");

    updateBookingConfirmationProgress(booking);

// Informasi lanjutan mengikuti lokasi pesanan.
document.getElementById("bcNextAssignment").textContent =
    "Sistem mengalokasikan staf terlatih dan bersertifikasi " +
    "SKCK resmi dengan rating minimum 4.9/5.0 di area " +
    (booking.region || "Kota Surabaya") + ".";

// Jam kedatangan mengikuti pilihan step 5.
document.getElementById("bcNextArrival").textContent =
    booking.time + " WIB";

// Metode dan nominal mengikuti pesanan aktual.
document.getElementById("bcNextPayment").textContent =
    "Periksa hasil kebersihan bersama mitra. " +
    "Jika sudah sesuai, konfirmasikan penyelesaian layanan. " +
    "Pembayaran dilakukan sebelum kunjungan, sehingga tidak " +
    "ada pembayaran ulang untuk layanan yang telah dibayar.";

        const set = (id, value) => {
        document.getElementById(id).textContent = value;
    };

    const money = value =>
        "Rp " + Number(value).toLocaleString("id-ID");

    function row(target, label, amount) {
        const item = document.createElement("div");
        item.className = "bc-row";

        const name = document.createElement("span");
        name.textContent = label;

        const price = document.createElement("strong");
        price.textContent = money(amount);

        item.append(name, price);
        document.getElementById(target).appendChild(item);
    }

    set("bcName", booking.customerName);
    set("bcCode", booking.id);
    set("bcPhone", booking.phone);

    set("bcStatus", "Pesanan tercatat • " + booking.status);

    // Tanggal kunjungan mengikuti pilihan customer.
const visitDate = new Date(booking.date + "T12:00:00+07:00");

const dateLabel = visitDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta"
});

// Bandingkan tanggal berdasarkan WIB.
const todayParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
}).formatToParts(new Date());

const datePart = type =>
    todayParts.find(part => part.type === type).value;

const todayValue =
    `${datePart("year")}-${datePart("month")}-${datePart("day")}`;

const dayDifference = Math.round(
    (
        Date.parse(booking.date + "T00:00:00Z") -
        Date.parse(todayValue + "T00:00:00Z")
    ) / 86400000
);

const relativeLabel = {
    0: "Hari ini",
    1: "Besok",
    2: "Lusa"
}[dayDifference];

set(
    "bcDate",
    relativeLabel ? relativeLabel + ", " + dateLabel : dateLabel
);

// Ambil tulisan rentang sesi langsung dari pilihan step 5.
const sessionInput = [
    ...document.querySelectorAll('input[name="session_time"]')
].find(input => input.value === booking.time);

const sessionLabel = sessionInput
    ?.closest(".final-time-option")
    ?.querySelector("strong")
    ?.textContent.trim();

set(
    "bcTime",
    sessionLabel
        ? "Sesi " + sessionLabel
        : "Kedatangan " + booking.time + " WIB"
);

// Jenis properti sesuai input; tidak menambahkan lantai fiktif.
set("bcProperty", booking.propertyType);

// Area singkat di kartu properti.
set(
    "bcArea",
    "Area Layanan: " +
    [booking.region, booking.district].filter(Boolean).join(" — ")
);

set("bcVisitCustomer", booking.customerName);

// Alamat lengkap pada bagian bawah.
const locationParts = [
    booking.district,
    booking.region,
    "Kota Surabaya",
    "Jawa Timur"
].filter(Boolean);

let fullAddress = booking.address.trim();

locationParts.forEach(part => {
    if (!fullAddress.toLowerCase().includes(part.toLowerCase())) {
        fullAddress += (fullAddress ? ", " : "") + part;
    }
});

set("bcAddress", fullAddress);

set(
    "bcLandmark",
    booking.landmark?.trim() || "Tidak ada patokan tambahan."
);

    set("bcTotal", money(booking.price));

const paymentMethod = booking.payment || "";
const isCod = /COD|tunai|bayar di tempat/i.test(paymentMethod);

set(
    "bcPaymentBadge",
    isCod ? "COD Pasca Kerja" : paymentMethod
);

set(
    "bcPayment",
    isCod
        ? "Bayar di Tempat (COD)"
        : "Pembayaran " + paymentMethod
);

set(
    "bcPaymentHint",
    isCod
        ? "Inspeksi terlebih dahulu sebelum membayar"
        : "Sesuai metode pembayaran pilihan Anda"
);

set(
    "bcPaymentDescription",
    isCod
        ? "Pembayaran dilakukan di tempat setelah pemeriksaan hasil kebersihan."
        : "Ikuti instruksi pembayaran " + paymentMethod +
          " dari tim GriyaResik. Pembayaran belum diverifikasi."
);

// Status menggunakan halaman pemesanan yang sudah ada.
document.getElementById("bcTrack").href =
    "my-bookings.html?id=" + encodeURIComponent(booking.id);

// Pakai nomor bantuan yang sama dengan footer website.
const footerSupport = document.querySelector(
    '.footer a[href*="wa.me/"]'
);

if (footerSupport) {
    const supportUrl = new URL(footerSupport.href);

    supportUrl.searchParams.set(
        "text",
        "Halo GriyaResik, saya ingin bertanya tentang pesanan " +
        booking.id + "."
    );

    document.getElementById("bcSupport").href = supportUrl.href;
}

const itemsContainer = document.getElementById("bcItems");
itemsContainer.replaceChildren();

document.getElementById("bcBillItems").replaceChildren();

const packageName = {
    Basic: "Basic Clean",
    Standard: "Standard Clean",
    Deep: "Deep Clean"
}[booking.package] || booking.package;

// Ikon SVG, bukan emoji.
const packageIcons = {
    room: `
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M7 13v-3a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3"/>
        <path d="M6 12a2 2 0 0 1 2 2v1h8v-1a2 2 0 0 1 2-2v6H6Z"/>
    `,
    addon: `
        <path d="M9 3h8M13 3v4M13 5h5l2 3"/>
        <path d="M10 8h5l2 4v9H6v-9Z"/>
        <path d="M9 14h5M11.5 11.5v5"/>
        <path d="M21 10s-2 2-2 3a2 2 0 0 0 4 0c0-1-2-3-2-3Z"/>
    `,
    garage: `
        <path d="m3 9 9-6 9 6v12H3Z"/>
        <path d="M6 21V10h12v11M6 14h12M6 18h12"/>
    `,
    kitchen: `
        <rect x="4" y="3" width="16" height="18" rx="2"/>
        <path d="M4 9h16M8 6h1M15 6h1"/>
        <rect x="7" y="12" width="10" height="6" rx="1"/>
    `
};

const mainIcon = /Garasi|Carport/i.test(booking.room)
    ? packageIcons.garage
    : /Dapur/i.test(booking.room)
        ? packageIcons.kitchen
        : packageIcons.room;

function makePackageCard({
    title,
    badge,
    description,
    price,
    icon,
    addon = false,
    features = []
}) {
    const card = document.createElement("article");
    card.className = "bc-package-item" + (addon ? " is-addon" : "");

    // Kerangka tetap; data customer diisi menggunakan textContent.
    card.innerHTML = `
        <span class="bc-package-item-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">${icon}</svg>
        </span>

        <div class="bc-package-item-copy">
            <div class="bc-package-item-title">
                <h3></h3>
                <span class="bc-package-item-badge"></span>
            </div>
            <p class="bc-package-item-description"></p>
        </div>

        <strong class="bc-package-item-price"></strong>
    `;

    card.querySelector("h3").textContent = title;
    card.querySelector(".bc-package-item-badge").textContent = badge;
    card.querySelector(".bc-package-item-description").textContent =
        description;
    card.querySelector(".bc-package-item-price").textContent =
        money(price);

    if (features.length) {
        const list = document.createElement("ul");
        list.className = "bc-package-item-features";

        features.forEach(feature => {
            const item = document.createElement("li");

            item.innerHTML = `
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m5 12 4 4L19 6"/>
                </svg>
            `;

            const text = document.createElement("span");
            text.textContent = feature;

            item.appendChild(text);
            list.appendChild(item);
        });

        card.querySelector(".bc-package-item-copy").appendChild(list);
    }

    itemsContainer.appendChild(card);
}

// Kartu layanan utama mengikuti step 1–2.
makePackageCard({
    title: "1× " + booking.room,
    badge: packageName,
    description: booking.serviceDescription,
    price: booking.basePrice,
    icon: mainIcon,
    features: [
        "Formula Bio-Enzim Netral",
        "Kain Microfiber Kategori Higienis"
    ]
});

row(
    "bcBillItems",
    "Subtotal " + booking.room,
    booking.basePrice
);

// Cari deskripsi dari kartu add-on yang dipilih pada step 3.
const addonInputs = [
    ...document.querySelectorAll('input[name="addon"]')
];

const addons = Array.isArray(booking.addonItems)
    ? booking.addonItems
    : [];

addons.forEach(addon => {
    const input = addonInputs.find(
        item => item.dataset.name === addon.name
    );

    const sourceCard = input?.closest("label");
    const description = sourceCard?.querySelector("p")
        ?.textContent.trim();

    makePackageCard({
        title: "1× " + addon.name,
        badge: "Layanan Tambahan",
        description: description ||
            "Layanan tambahan sesuai pilihan pada reservasi Anda.",
        price: addon.price,
        icon: packageIcons.addon,
        addon: true
    });

    row(
        "bcBillItems",
        "Add-on " + addon.name,
        addon.price
    );
});

if (!addons.length) {
    row("bcBillItems", "Add-on: tidak ada", 0);
}

// Tampilkan catatan hanya jika memang ada,
// agar tidak menyisakan kotak kosong seperti sebelumnya.
const cleaner = document.getElementById("bcCleaner");
const notes = document.getElementById("bcNotes");

const hasCleanerPreference = Boolean(
    booking.cleanerPreference &&
    booking.cleanerPreference !== "Bebas"
);

const hasNotes = Boolean(booking.notes?.trim());

cleaner.textContent =
    "Preferensi cleaner: " + (booking.cleanerPreference || "Bebas");
cleaner.hidden = !hasCleanerPreference;

notes.textContent = "Instruksi khusus: " + (booking.notes || "");
notes.hidden = !hasNotes;

document.getElementById("bcPackageNotes").hidden =
    !hasCleanerPreference && !hasNotes;

    document.getElementById("bcCopy").onclick = async () => {
        try {
            await navigator.clipboard.writeText(booking.id);
            set("bcFeedback", "Kode reservasi tersalin.");
        } catch {
            set(
                "bcFeedback",
                "Salin kode ini secara manual: " + booking.id
            );
        }
    };

        document.getElementById("bcPrint").onclick = () => {
        printBookingReceipt(booking);
    };

    document.querySelector("main.booking-container").hidden = true;
    section.hidden = false;
    document.body.classList.add("booking-confirmed");

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("bcTitle").focus({ preventScroll: true });
}

// Enter pada form mengikuti proses konfirmasi yang sama.
document.getElementById("bookingForm").addEventListener("submit", event => {
    event.preventDefault();

    if (currentStep === 4) {
        document.getElementById("nextBtn").click();
    }
});

// ISI PROGRES KONFIRMASI DARI DATA BOOKING
function updateBookingConfirmationProgress(booking) {
    const setText = (id, value) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    };

    // Pilihan ruangan dari step 1.
    setText(
        "bcProgressRoom",
        "1 " + booking.room
    );

    // Pilihan paket dari step 2.
    const packageLabels = {
        Basic: "Basic Clean",
        Standard: "Standard Clean",
        Deep: "Deep Clean"
    };

    setText(
        "bcProgressPackage",
        packageLabels[booking.package] || booking.package
    );

    // Semua tambahan yang benar-benar dipilih pada step 3.
    const addonNames = Array.isArray(booking.addonItems)
        ? booking.addonItems.map(item => item.name)
        : Array.isArray(booking.addons)
            ? booking.addons
            : [];

    const addonDescription = addonNames.length
        ? addonNames.join(", ")
        : "Tanpa layanan tambahan";

    setText(
        "bcProgressAddon",
        booking.notes?.trim()
            ? addonDescription + " • Catatan ditambahkan"
            : addonDescription
    );

    // Tahap ringkasan sudah dilewati sebelum booking disimpan.
    setText(
        "bcProgressSummary",
        "Ringkasan selesai"
    );

    // Status aktual pesanan.
    setText(
        "bcProgressStatus",
        booking.status || "Menunggu konfirmasi"
    );
}

// CETAK BUKTI RESERVASI KHUSUS
function printBookingReceipt(booking) {
    document.getElementById("bookingReceiptFrame")?.remove();

    const frame = document.createElement("iframe");
    frame.id = "bookingReceiptFrame";
    frame.title = "Bukti Reservasi";
    frame.style.cssText =
        "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;";

    document.body.appendChild(frame);

    const doc = frame.contentDocument;

    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>Bukti Reservasi GriyaResik</title>

            <style>
                @page {
                    size: A4 portrait;
                    margin: 14mm;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Inter, Arial, sans-serif;
                    color: #193e2f;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                .receipt {
                    padding: 32px;
                    border: 1px solid #eadbd7;
                    border-radius: 18px;
                    background: white;
                }

                header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 18px;
                    padding-bottom: 25px;
                    border-bottom: 1px solid #FAE9E9;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 13px;
                }

                .logo {
                    display: grid;
                    place-items: center;
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: #FAE9E9;
                }

                .logo img {
                    display: block;
                    width: 34px;
                    height: 34px;
                    object-fit: contain;
                }

                h1 {
                    margin: 0 0 5px;
                    font-size: 23px;
                    letter-spacing: -.5px;
                }

                .subtitle {
                    margin: 0;
                    color: #64748b;
                    font-size: 14px;
                }

                .status {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    max-width: 180px;
                    padding: 8px 12px;
                    border: 1px solid #d4e4d8;
                    border-radius: 30px;
                    background: #e8eee5;
                    font-size: 12px;
                    font-weight: 600;
                }

                .dot {
                    flex-shrink: 0;
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: #193e2f;
                }

                .reservation {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin: 27px 0 24px;
                    padding: 22px 20px;
                    border: 1px solid #FAE9E9;
                    border-radius: 14px;
                    background: #fdfbfb;
                }

                .label {
                    margin-bottom: 8px;
                    color: #94a3b8;
                    font-size: 12px;
                    font-weight: 700;
                }

                #receiptCode {
                    font-family: monospace;
                    font-size: 24px;
                    font-weight: 800;
                    overflow-wrap: anywhere;
                }

                .payment {
                    max-width: 170px;
                    text-align: right;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .payment span {
                    display: block;
                    color: #64748b;
                }

                dl {
                    margin: 0;
                }

                .row {
                    display: grid;
                    grid-template-columns: 100px minmax(0, 1fr);
                    gap: 22px;
                    padding: 18px 0;
                    border-bottom: 1px solid #FAE9E9;
                    font-size: 14px;
                    line-height: 1.65;
                    break-inside: avoid;
                }

                dt {
                    color: #64748b;
                }

                dd {
                    margin: 0;
                    text-align: right;
                    white-space: pre-line;
                    overflow-wrap: anywhere;
                }

                .total {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    gap: 18px;
                    padding-top: 25px;
                }

                .total > span {
                    color: #475569;
                    font-size: 16px;
                    font-weight: 700;
                }

                .total div {
                    text-align: right;
                }

                #receiptTotal {
                    font-size: 25px;
                    font-weight: 800;
                }

                #receiptTotalMethod {
                    color: #64748b;
                    font-size: 12px;
                }

                #receiptPaymentStatus {
                    margin: 14px 0 0;
                    color: #64748b;
                    font-size: 10px;
                    text-align: right;
                }
            </style>
        </head>

        <body>
            <article class="receipt">
                <header>
                    <div class="brand">
                        <span class="logo">
                            <img src="../images/logo griya resik.png" alt="Logo GriyaResik">
                        </span>

                        <div>
                            <h1>Bukti Reservasi</h1>
                            <p class="subtitle">
                                GriyaResik Layanan Resmi
                            </p>
                        </div>
                    </div>

                    <div class="status">
                        <span class="dot"></span>
                        <span id="receiptStatus"></span>
                    </div>
                </header>

                <section class="reservation">
                    <div>
                        <div class="label">KODE RESERVASI</div>
                        <div id="receiptCode"></div>
                    </div>

                    <div class="payment">
                        <span>Pembayaran</span>
                        <strong id="receiptPayment"></strong>
                    </div>
                </section>

                <dl>
                    <div class="row">
                        <dt>Pelanggan</dt>
                        <dd><strong id="receiptCustomer"></strong></dd>
                    </div>

                    <div class="row">
                        <dt>Layanan</dt>
                        <dd id="receiptServices"></dd>
                    </div>

                    <div class="row">
                        <dt>Waktu</dt>
                        <dd id="receiptSchedule"></dd>
                    </div>

                    <div class="row">
                        <dt>Lokasi</dt>
                        <dd id="receiptAddress"></dd>
                    </div>

                    <div class="row">
                        <dt>Mitra</dt>
                        <dd><strong id="receiptWorker"></strong></dd>
                    </div>
                </dl>

                <footer class="total">
                    <span>Total Tagihan</span>
                    <div>
                        <strong id="receiptTotal"></strong>
                        <span id="receiptTotalMethod"></span>
                    </div>
                </footer>

                <p id="receiptPaymentStatus"></p>
            </article>
        </body>
        </html>
    `);

    doc.close();

    const set = (id, value) => {
        doc.getElementById(id).textContent = value;
    };

    const packageName = {
        Basic: "Basic Clean",
        Standard: "Standard Clean",
        Deep: "Deep Clean"
    }[booking.package] || booking.package || "";

    const addons = Array.isArray(booking.addonItems)
        ? booking.addonItems.map(item => item.name)
        : Array.isArray(booking.addons)
            ? booking.addons
            : [];

    const sessionInput = [
        ...document.querySelectorAll('input[name="session_time"]')
    ].find(input => input.value === booking.time);

    const sessionLabel =
        booking.sessionLabel ||
        sessionInput
            ?.closest(".final-time-option")
            ?.querySelector("strong")
            ?.textContent.trim() ||
        (booking.time ? booking.time + " WIB" : "Belum ditentukan");

    const visitDate = new Date(
        booking.date + "T12:00:00+07:00"
    );

    const dateLabel = Number.isNaN(visitDate.getTime())
        ? "Belum ditentukan"
        : visitDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Jakarta"
        });

    let address = booking.address?.trim() || "";

    [
        booking.district,
        booking.region,
        "Kota Surabaya",
        "Jawa Timur"
    ].filter(Boolean).forEach(part => {
        if (!address.toLowerCase().includes(part.toLowerCase())) {
            address += (address ? ", " : "") + part;
        }
    });

    const payment = booking.payment || "Belum dipilih";

    set(
        "receiptCode",
        "#" + String(booking.id || "—").replace(/^#/, "")
    );

    set("receiptStatus", booking.status || "Menunggu konfirmasi");
    set("receiptCustomer", booking.customerName || "—");
    set("receiptPayment", payment);

    set(
        "receiptServices",
        "1× " + booking.room + " — " + packageName +
        (addons.length ? "\n+ " + addons.join("\n+ ") : "")
    );

    set("receiptSchedule", dateLabel + ", " + sessionLabel);
    set("receiptAddress", address);

    set(
        "receiptWorker",
        booking.workerName ||
        booking.worker?.name ||
        "Belum ditugaskan"
    );

    set(
        "receiptTotal",
        "Rp " + Number(booking.price).toLocaleString("id-ID")
    );

    set("receiptTotalMethod", "(" + payment + ")");

    set(
        "receiptPaymentStatus",
        "Status pembayaran: " +
        (booking.paymentStatus || "Belum diverifikasi")
    );

    doc.title = "Bukti Reservasi " + booking.id;

    // Gunakan font yang sama dengan halaman booking.
    document.querySelectorAll(
        'link[rel="stylesheet"][href*="fonts.googleapis.com"]'
    ).forEach(link => {
        doc.head.appendChild(link.cloneNode(true));
    });

    const fontsReady = doc.fonts
        ? doc.fonts.ready
        : Promise.resolve();

    Promise.race([
        fontsReady,
        new Promise(resolve => setTimeout(resolve, 2500))
    ]).then(() => {
        frame.contentWindow.requestAnimationFrame(() => {
            frame.contentWindow.requestAnimationFrame(() => {
                frame.contentWindow.focus();
                frame.contentWindow.print();
            });
        });
    });
}

// ==========================================
// TEMPEL DATA PROFIL KE KONTAK BOOKING
// ==========================================
(() => {
  "use strict";

  function initializeProfilePaste() {
    const name = document.getElementById(
      "finalCustomerName"
    );

    const email = document.getElementById(
      "finalCustomerEmail"
    );

    const phone = document.getElementById(
      "finalCustomerPhone"
    );

    const status = document.getElementById(
      "profilePasteStatus"
    );

    if (!name || !email || !phone) return;

    function say(message, error = false) {
      if (!status) {
        if (error) alert(message);
        return;
      }

      status.textContent = message;
      status.style.color = error
        ? "#a84c43"
        : "#193e2f";
    }

    [name, email, phone].forEach(input => {
      input.addEventListener("paste", event => {
        const raw =
          event.clipboardData?.getData("text/plain") || "";

        let data;

        try {
          data = JSON.parse(raw);
        } catch {
          // Teks biasa tetap ditempel seperti biasanya.
          return;
        }

        if (
          !data ||
          typeof data !== "object" ||
          data.format !== "griyaresik-profile"
        ) {
          return;
        }

        event.preventDefault();

        const validText = value =>
          typeof value === "string" &&
          !!value.trim();

        if (
          data.version !== 1 ||
          !validText(data.name) ||
          !validText(data.email) ||
          !validText(data.phone)
        ) {
          say(
            "Data profil tidak lengkap. Salin ulang dari halaman Pengaturan Akun.",
            true
          );
          return;
        }

        const profileName = data.name.trim();
        const profileEmail = data.email.trim();

        let digits = data.phone.replace(
          /[^0-9]/g,
          ""
        );

        // Booking sudah menampilkan awalan +62.
        if (digits.startsWith("62")) {
          digits = digits.slice(2);
        } else if (digits.startsWith("0")) {
          digits = digits.slice(1);
        }

        const emailCheck = document.createElement("input");
        emailCheck.type = "email";
        emailCheck.required = true;
        emailCheck.value = profileEmail;

        if (
          profileName.length > 120 ||
          profileEmail.length > 254 ||
          !emailCheck.checkValidity() ||
          !/^8\d{8,12}$/.test(digits)
        ) {
          say(
            "Data profil tidak valid. Periksa nama, email, dan nomor telepon di Pengaturan Akun, lalu salin ulang.",
            true
          );
          return;
        }

        const fields = [
          [name, profileName],
          [email, profileEmail],
          [phone, digits]
        ];

        fields.forEach(([field, value]) => {
          field.value = value;
          field.setCustomValidity("");

          field.dispatchEvent(
            new Event("input", { bubbles: true })
          );

          field.dispatchEvent(
            new Event("change", { bubbles: true })
          );
        });

        say(
          "Data profil berhasil ditempel. Nama, email, dan nomor WhatsApp sudah terisi."
        );
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeProfilePaste,
      { once: true }
    );
  } else {
    initializeProfilePaste();
  }
})();