
const rooms = [
    {name:"Kamar Tidur", icon:"🛏", desc:"Tempat tidur, lemari, dan area lantai", meta:"Ganti sprei & debu sudut", prices:[50000,80000,120000]},
    {name:"Ruang Tamu / Keluarga", icon:"🛋", desc:"Sofa, karpet, meja, jendela", meta:"Vakum bulu & serat kain", prices:[50000,85000,130000]},
    {name:"Kamar Mandi", icon:"🚿", desc:"Kloset, dinding keramik, wastafel", meta:"Anti-kerak & disinfeksi", prices:[50000,80000,120000]},
    {name:"Dapur & Pantry", icon:"🍳", desc:"Meja kompor, sink, kabinet luar", meta:"Degreasing formula aman", prices:[55000,90000,145000]},
    {name:"Ruang Kerja & Belajar", icon:"💻", desc:"Meja kerja, rak buku, kursi", meta:"Pembersihan area kerja", prices:[50000,80000,115000]},
    {name:"Ruang Makan", icon:"🍽", desc:"Meja makan, kursi, area sekitarnya", meta:"Sanitasi permukaan", prices:[50000,80000,115000]},
    {name:"Ruang Laundry & Cuci", icon:"🧺", desc:"Lantai jemuran dan area mesin cuci", meta:"Drainase & filter serat", prices:[50000,80000,115000]},
    {name:"Garasi / Teras", icon:"🏠", desc:"Lantai carport, debu dan dedaunan", meta:"Area eksterior", prices:[50000,70000,100000]},
    {name:"Ruangan Kustom (Lainnya)", icon:"✨", desc:"Musholla, studio, gym, balkon", meta:"Kebutuhan spesifik", prices:[50000,75000,105000]}
];

const packageNames = ["Basic Cleaning","Standard Cleaning","Deep Cleaning"];
const durations = ["35–45 menit","45–75 menit","60–120 menit"];

let currentStep = 0;
let selectedRoom = null;
let selectedPackage = null;

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
        <div class="room-meta"><span>♧ ${room.meta}</span><span>${index === 0 ? "Prioritas #1" : index === 1 ? "Populer" : "Detail"}</span></div>
    `;

    button.addEventListener("click", () => {
        selectedRoom = index;
        document.querySelectorAll(".room-card").forEach(card => card.classList.remove("selected"));
        button.classList.add("selected");
        updateSummary();
    });

    roomGrid.appendChild(button);
});

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
    const index = {Basic:0, Standard:1, Deep:2}[selectedPackage];
    return rooms[selectedRoom].prices[index];
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
    const roomName = selectedRoom === null ? "Belum dipilih" : rooms[selectedRoom].name;
    const packageName = selectedPackage ? packageNames[{Basic:0,Standard:1,Deep:2}[selectedPackage]] : "Belum dipilih";

    document.getElementById("sumRoom").textContent = roomName;
    document.getElementById("sumPackage").textContent = packageName;
    document.getElementById("sumAddon").textContent = getAddonNames().join(", ") || "Tidak ada";
    document.getElementById("sumDuration").textContent = selectedPackage
        ? durations[{Basic:0,Standard:1,Deep:2}[selectedPackage]]
        : "35–75 menit";
    document.getElementById("sumTotal").textContent = rupiah(getTotal());

    document.getElementById("finalService").textContent =
        roomName + " — " + packageName;
    document.getElementById("finalTotal").textContent = rupiah(getTotal());

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    document.getElementById("finalSchedule").textContent =
        date && time ? date + " pukul " + time + " WIB" : "Belum dipilih";

    if (selectedRoom !== null) {
        document.getElementById("priceBasic").textContent = rupiah(rooms[selectedRoom].prices[0]);
        document.getElementById("priceStandard").textContent = rupiah(rooms[selectedRoom].prices[1]);
        document.getElementById("priceDeep").textContent = rupiah(rooms[selectedRoom].prices[2]);
    }
}

document.querySelectorAll('input[name="addon"], #date, #time').forEach(input => {
    input.addEventListener("change", updateSummary);
});

const stepTitles = [
    "Pilih Ruangan yang Ingin Dibersihkan",
    "Pilih Jenis Pembersihan",
    "Tambahkan Layanan dan Catatan",
    "Periksa Ringkasan Pesanan",
    "Alamat dan Biodata Pelanggan"
];

const stepDescriptions = [
    "Pilih ruangan yang ingin Anda jadwalkan pembersihannya. Anda dapat memulai dari satu ruangan.",
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

    document.getElementById("backBtn").disabled = currentStep === 0;
    document.getElementById("nextBtn").textContent =
        currentStep === 4 ? "Konfirmasi Booking ✓" :
        currentStep === 3 ? "Lanjut: Alamat & Biodata →" :
        currentStep === 2 ? "Lanjut: Ringkasan & Total →" :
        currentStep === 1 ? "Lanjut: Add-on & Catatan →" :
        "Lanjut: Pilih Jenis Pembersihan →";

    updateSummary();
}

document.getElementById("backBtn").addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
        window.scrollTo({top:0, behavior:"smooth"});
    }
});

document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentStep === 0 && selectedRoom === null) {
        alert("Pilih ruangan terlebih dahulu, ya.");
        return;
    }

    if (currentStep === 1 && selectedPackage === null) {
        alert("Pilih jenis pembersihan terlebih dahulu, ya.");
        return;
    }

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
            date: document.getElementById("date").value,
            time: document.getElementById("time").value,
            payment: document.getElementById("payment").value,
            price: getTotal(),
            status: "Menunggu konfirmasi"
        };

        try {
            const bookings = JSON.parse(localStorage.getItem("griyaResikBookings") || "[]");
            bookings.push(booking);
            localStorage.setItem("griyaResikBookings", JSON.stringify(bookings));
            alert("Booking berhasil dicatat! Nomor pesanan: " + booking.id);
            window.location.href = "my-bookings.html";
        } catch (error) {
            alert("Booking belum dapat disimpan di browser. Silakan coba lagi.");
        }
        return;
    }

    currentStep++;
    renderStep();
    window.scrollTo({top:0, behavior:"smooth"});
});

const today = new Date();
document.getElementById("date").min = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

renderStep();
