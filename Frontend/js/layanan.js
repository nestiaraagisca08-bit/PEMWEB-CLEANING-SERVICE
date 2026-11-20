
        // DATA KATALOG 11 RUANGAN
        const rooms = [
            {
                name: "Kamar Tidur",
                desc: "Ruang Istirahat & Pribadi",
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
                desc: "Area Utama Kunjungan Keluarga",
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
                desc: "Area Persiapan Makanan",
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
                desc: "Anti Kerak & Bakteri",
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
                desc: "Dining Room Bersih & Rapi",
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
                desc: "Fokus Bersih Bebas Debu",
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
                desc: "Kenyamanan Belajar Anak",
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
                desc: "Area Mesin Cuci & Penjemuran",
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
                desc: "Area Outdoor Depan & Belakang",
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
                desc: "Area Parkir Kendaraan",
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
                desc: "Storage & Barang Koleksi",
                prices: [55000, 90000, 140000],
                time: "45–90 menit",
                details: [
                    "Menyapu, mengepel, debu, sampah ringan, area utama mudah dijangkau.",
                    "Basic + vacuum, rak, sudut, permukaan, area yang mudah terlewat.",
                    "Standard + detail rak, vacuum sela, area sulit, debu/kotoran berat, detail lantai/sudut."
                ]
            }
        ];

        const packageNames = ["Basic", "Standard", "Deep"];
        const packageDurations = ["60–90 menit", "90–150 menit", "180–240 menit"];
        const defaultEstimate = "Estimasi kerja: Pilih paket";
        const roomGrid = document.getElementById("roomGrid");

        function rupiah(value) {
            return "Rp " + value.toLocaleString("id-ID");
        }

        // MENAMPILKAN SEMUA KARTU RUANGAN
        let selectedRoom = null;
        let selectedPackageIndex = null;

        rooms.forEach((room, index) => {
            const card = document.createElement("article");
            card.className = "room-card";

            const priceHTML = room.prices.map((price, i) => `
                <div class="price-option ${i === 1 ? "standard" : ""} ${i === 2 ? "deep" : ""}"
                     data-package-index="${i}"
                     role="button"
                     tabindex="0">
                     <span>${packageNames[i].toUpperCase()}</span>
                     <strong>${rupiah(price)}</strong>
                </div>
            `).join("");

            const detailHTML = room.details.map((detail, i) => `
                <div class="package-detail ${i === 1 ? "standard" : ""} ${i === 2 ? "deep" : ""}">
                    <h3>Paket ${packageNames[i]}:</h3>
                    <p>${detail}</p>
                </div>
            `).join("");

            card.innerHTML = `
                <div class="room-heading">
                    <div class="room-number">${String(index + 1).padStart(2, "0")}</div>
                    <div class="room-title">
                        <h2>${room.name}</h2>
                        <p>${room.desc}</p>
                    </div>
                    <span class="package-label">3 Pilihan Paket</span>
                </div>

                <div class="price-row">${priceHTML}</div>
                ${detailHTML}

                <div class="room-footer">
                   <span class="duration" aria-live="polite">${defaultEstimate}</span>
                    <a class="book-room" href="#">
                        Booking Ruangan Ini →
                    </a>
                </div>
            `;

roomGrid.appendChild(card);

// PILIH SATU PAKET UNTUK SELURUH RUANGAN
const durationLabel = card.querySelector(".duration");
card.querySelectorAll(".price-option").forEach(option => {
    option.addEventListener("click", () => {
        const packageIndex = Number(option.dataset.packageIndex);
        const cancelSelection = option.classList.contains("selected");
        const previous = roomGrid.querySelector(".price-option.selected");

        if (previous) {
            previous.classList.remove("selected");
            previous.closest(".room-card").querySelector(".duration").textContent =
                defaultEstimate;
        }

        selectedRoom = cancelSelection ? null : index;
        selectedPackageIndex = cancelSelection ? null : packageIndex;
        if (cancelSelection) return;

        option.classList.add("selected");
        durationLabel.textContent = "Estimasi kerja: " + packageDurations[packageIndex];
    });

    option.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!event.repeat) option.click();
        }
    });
});

// BOOKING RUANGAN DAN PAKET TERPILIH
const bookButton = card.querySelector(".book-room");

bookButton.addEventListener("click", (event) => {
    event.preventDefault();

        if (selectedRoom !== index || selectedPackageIndex === null) {
            alert("Silakan pilih paket untuk ruangan ini terlebih dahulu.");
            return;
        }

        const params = new URLSearchParams({
            room: room.name,
            package: packageNames[selectedPackageIndex],
            price: room.prices[selectedPackageIndex],
            prices: JSON.stringify(room.prices),
            details: JSON.stringify(room.details),
            time: packageDurations[selectedPackageIndex]
        });

        window.location.href = "booking.html?" + params.toString();
            });
        });

        // KALKULATOR HARGA CUSTOM
        const customPrices = [
            [50000, 75000, 105000],
            [60000, 90000, 125000],
            [75000, 110000, 150000]
        ];

        const customPrice = document.getElementById("customPrice");
        const roomName = document.getElementById("roomName");

        function updateCustomPrice() {
            const area = Number(
                document.querySelector('input[name="area"]:checked').value
            );

            const selectedPackage = Number(
                document.querySelector('input[name="package"]:checked').value
            );

            customPrice.textContent = rupiah(customPrices[area][selectedPackage]);
        }

        document.querySelectorAll('input[name="area"], input[name="package"]')
            .forEach(input => input.addEventListener("change", updateCustomPrice));

        document.querySelectorAll(".preset").forEach(button => {
            button.addEventListener("click", () => {
                roomName.value = button.dataset.name;
                roomName.focus();
            });
        });

        // TAMBAH CUSTOM KE HALAMAN BOOKING
        document.getElementById("customForm").addEventListener("submit", function(event) {
            event.preventDefault();

            const name = roomName.value.trim();

            if (!name) {
                alert("Silakan isi nama ruangan terlebih dahulu.");
                roomName.focus();
                return;
            }

            const area = Number(
                document.querySelector('input[name="area"]:checked').value
            );

            const selectedPackage = Number(
                document.querySelector('input[name="package"]:checked').value
            );

            const areaLabels = ["< 10 m²", "10–20 m²", "> 20 m²"];
            const price = customPrices[area][selectedPackage];

            const params = new URLSearchParams({
                room: name,
                area: areaLabels[area],
                package: packageNames[selectedPackage],
                price: price,
                prices: JSON.stringify(customPrices[area])
            });

            window.location.href = "booking.html?" + params.toString();
        });

        updateCustomPrice();
   
