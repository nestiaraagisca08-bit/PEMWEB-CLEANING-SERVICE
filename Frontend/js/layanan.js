        // ==========================================
        // DATA LAYANAN DARI DATABASE POSTGRESQL
        // ==========================================

        const API_BASE = "http://localhost:3000";

        const packageNames = ["Basic", "Standard", "Deep"];
        const defaultEstimate = "Estimasi kerja: Pilih paket";

        const roomGrid = document.getElementById("roomGrid");

        let rooms = [];
        let selectedRoom = null;
        let selectedPackageIndex = null;

        // Format Rupiah
        function rupiah(value) {
            return "Rp " + Number(value).toLocaleString("id-ID");
        }

        // ==========================================
        // AMBIL DATA LAYANAN DARI BACKEND
        // ==========================================

        async function loadServices() {
            try {
                roomGrid.innerHTML = "<p>Memuat layanan...</p>";

                const response = await fetch(`${API_BASE}/api/services`);

                if (!response.ok) {
                    throw new Error("Gagal mengambil data layanan.");
                }

                const result = await response.json();

                rooms = result.services.map(service => {
                    const packages = packageNames.map(packageName => {
                        const item = service.packages.find(
                            p => p.name === packageName
                        );

                        return item || {
                            name: packageName,
                            price: 0,
                            description: "Detail layanan belum tersedia.",
                            duration: "-"
                        };
                    });

                    return {
                        id: service.id,
                        name: service.name,
                        desc: service.description || service.category || "",
                        category: service.category,
                        prices: packages.map(item => Number(item.price)),
                        details: packages.map(item => item.description),
                        durations: packages.map(item => item.duration)
                    };
                });

                renderServices();

            } catch (error) {
                console.error("Gagal memuat layanan:", error);

                roomGrid.innerHTML = `
                    <p style="text-align:center; padding:30px;">
                        Gagal memuat layanan. Pastikan backend GriyaResik berjalan.
                    </p>
                `;
            }
        }

        // ==========================================
        // TAMPILKAN KARTU LAYANAN
        // ==========================================

        function renderServices() {
            roomGrid.innerHTML = "";

            selectedRoom = null;
            selectedPackageIndex = null;

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
                        <div class="room-number">
                            ${String(index + 1).padStart(2, "0")}
                        </div>

                        <div class="room-title">
                            <h2>${room.name}</h2>
                            <p>${room.desc}</p>
                        </div>

                        <span class="package-label">3 Pilihan Paket</span>
                    </div>

                    <div class="price-row">
                        ${priceHTML}
                    </div>

                    ${detailHTML}

                    <div class="room-footer">
                        <span class="duration" aria-live="polite">
                            ${defaultEstimate}
                        </span>

                        <a class="book-room" href="#">
                            Booking Ruangan Ini →
                        </a>
                    </div>
                `;

                roomGrid.appendChild(card);

                const durationLabel = card.querySelector(".duration");

                // PILIH PAKET
                card.querySelectorAll(".price-option").forEach(option => {

                    option.addEventListener("click", () => {
                        const packageIndex = Number(
                            option.dataset.packageIndex
                        );

                        const cancelSelection =
                            option.classList.contains("selected");

                        const previous =
                            roomGrid.querySelector(".price-option.selected");

                        if (previous) {
                            previous.classList.remove("selected");

                            previous.closest(".room-card")
                                .querySelector(".duration")
                                .textContent = defaultEstimate;
                        }

                        selectedRoom = cancelSelection ? null : index;

                        selectedPackageIndex =
                            cancelSelection ? null : packageIndex;

                        if (cancelSelection) return;

                        option.classList.add("selected");

                        durationLabel.textContent =
                            "Estimasi kerja: " +
                            room.durations[packageIndex];
                    });

                    // AKSESIBILITAS KEYBOARD
                    option.addEventListener("keydown", event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();

                            if (!event.repeat) {
                                option.click();
                            }
                        }
                    });
                });

                // ==========================================
                // BOOKING LAYANAN
                // ==========================================

                const bookButton = card.querySelector(".book-room");

                bookButton.addEventListener("click", event => {
                    event.preventDefault();

                    if (
                        selectedRoom !== index ||
                        selectedPackageIndex === null
                    ) {
                        alert(
                            "Silakan pilih paket untuk ruangan ini terlebih dahulu."
                        );
                        return;
                    }

                    const params = new URLSearchParams({
                        room: room.name,
                        package: packageNames[selectedPackageIndex],
                        price: room.prices[selectedPackageIndex],
                        prices: JSON.stringify(room.prices),
                        details: JSON.stringify(room.details),
                        time: room.durations[selectedPackageIndex]
                    });

                    window.location.href =
                        "booking.html?" + params.toString();
                });
            });
        }

        // Jalankan pengambilan data
        loadServices();


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
   
