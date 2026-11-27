const express = require("express");
const router = express.Router();
const {
  db,
  verifyToken,
  verifyAdmin,
  bcrypt,
  crypto,
  googleClient,
  generateToken,
  uploadProfilePhoto,
  validateWorker,
  validateService,
  validateAddon
} = require("../context");

// ==========================================
// MEMBUAT BOOKING CUSTOMER
// ==========================================

router.post("/api/bookings", verifyToken, async (req, res) => {
    let client;
    let transactionStarted = false;

    try {
        const userId = req.user.id;

        const {
            service_id,
            package_name,
            booking_date,
            booking_time,
            address,
            payment_method,
            place_type,
            room_count,
            addons,
            notes
        } = req.body;

        // ==========================================
        // VALIDASI DATA BOOKING
        // ==========================================

        if (
            !service_id ||
            !package_name ||
            !booking_date ||
            !booking_time ||
            !address ||
            !payment_method
        ) {
            return res.status(400).json({
                message: "Data booking belum lengkap."
            });
        }

        if (
            !["Basic", "Standard", "Deep"].includes(package_name)
        ) {
            return res.status(400).json({
                message: "Paket cleaning tidak valid."
            });
        }

        if (
            !["qris", "bank_transfer"].includes(payment_method)
        ) {
            return res.status(400).json({
                message: "Metode pembayaran tidak valid."
            });
        }

        if (
            !Array.isArray(addons)
        ) {
            return res.status(400).json({
                message: "Data add-on tidak valid."
            });
        }

        // ==========================================
        // NILAI WAJIB YANG TIDAK ADA DI FORM
        // ==========================================
        // place_type dan room_count wajib ada di database.
        // Form customer belum menyediakan jumlah ruangan,
        // jadi kita pakai 1 sebagai nilai aman.

        const safePlaceType =
            String(place_type || "").trim() || "Lainnya";

        const parsedRoomCount = Number.parseInt(room_count, 10);

        const safeRoomCount =
            Number.isInteger(parsedRoomCount) && parsedRoomCount > 0
                ? parsedRoomCount
                : 1;

        // ==========================================
        // MULAI TRANSAKSI
        // ==========================================

        client = await db.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        // ==========================================
        // 1. CEK LAYANAN
        // ==========================================

        const serviceCheck = await client.query(
            `
            SELECT id
            FROM public.services
            WHERE id = $1
            `,
            [service_id]
        );

        if (serviceCheck.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                message: "Layanan tidak ditemukan."
            });
        }

        // ==========================================
        // 2. CEK PAKET DAN AMBIL HARGA DARI DATABASE
        // ==========================================

        const packageResult = await client.query(
            `
            SELECT
                id,
                service_id,
                package_name,
                price,
                estimated_duration
            FROM public.service_packages
            WHERE service_id = $1
              AND package_name = $2
            `,
            [
                service_id,
                package_name
            ]
        );

        if (packageResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return res.status(404).json({
                message: "Paket cleaning tidak ditemukan."
            });
        }

        const selectedPackage = packageResult.rows[0];

        const packagePrice = Number(selectedPackage.price);

        // ==========================================
        // 3. VALIDASI DAN AMBIL ADD-ON DATABASE
        // ==========================================

        const selectedAddons = [];
        let addonTotal = 0;

        for (const item of addons) {

            if (
                !item ||
                typeof item.name !== "string"
            ) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    message: "Data add-on tidak valid."
                });
            }

            const addonResult = await client.query(
                `
                SELECT
                    a.id,
                    a.name,
                    a.price
                FROM public.addons a
                JOIN public.service_addons sa
                    ON sa.addon_id = a.id
                WHERE sa.service_id = $1
                  AND LOWER(TRIM(a.name)) = LOWER(TRIM($2))
                  AND a.is_active = TRUE
                `,
                [
                    service_id,
                    item.name
                ]
            );

            if (addonResult.rows.length === 0) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    message: `Add-on ${item.name} tidak tersedia untuk layanan ini.`
                });
            }

            const addon = addonResult.rows[0];

            selectedAddons.push(addon);

            addonTotal += Number(addon.price);
        }

        // ==========================================
        // 4. HITUNG TOTAL HARGA DARI DATABASE
        // ==========================================

        const totalPrice = packagePrice + addonTotal;

        // ==========================================
        // 5. SIMPAN BOOKING
        // ==========================================

        const bookingResult = await client.query(
            `
            INSERT INTO public.bookings (
                user_id,
                service_id,
                worker_id,
                package_id,
                booking_date,
                booking_time,
                address,
                total_price,
                status,
                place_type,
                room_count,
                notes
            )
            VALUES (
                $1,
                $2,
                NULL,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11
            )
            RETURNING *
            `,
            [
                userId,
                service_id,
                selectedPackage.id,
                booking_date,
                booking_time,
                address.trim(),
                totalPrice,
                "pending",
                safePlaceType,
                safeRoomCount,
                notes || null
            ]
        );

        const booking = bookingResult.rows[0];

        // ==========================================
        // 6. SIMPAN BOOKING ADD-ON
        // ==========================================

        for (const addon of selectedAddons) {

            await client.query(
                `
                INSERT INTO public.booking_addons (
                    booking_id,
                    addon_id,
                    quantity
                )
                VALUES ($1, $2, $3)
                `,
                [
                    booking.id,
                    addon.id,
                    1
                ]
            );
        }

        // ==========================================
        // 7. SIMPAN PEMBAYARAN
        // ==========================================

        const paymentResult = await client.query(
            `
            INSERT INTO public.payments (
                booking_id,
                payment_method,
                payment_status,
                amount,
                paid_at,
                "proof image"
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                NULL,
                NULL
            )
            RETURNING *
            `,
            [
                booking.id,
                payment_method,
                "pending",
                totalPrice
            ]
        );

        // ==========================================
        // 8. COMMIT
        // ==========================================

        await client.query("COMMIT");
        transactionStarted = false;

        return res.status(201).json({
            message: "Booking berhasil dibuat.",

            booking: {
                ...booking,
                package_name: selectedPackage.package_name,
                package_price: packagePrice,
                addon_total: addonTotal,
                total_price: totalPrice
            },

            addons: selectedAddons,

            payment: paymentResult.rows[0]
        });

    } catch (error) {

        if (client && transactionStarted) {
            await client.query("ROLLBACK");
        }

        console.error(
            "Booking gagal:",
            error.code || error.message,
            error.detail || ""
        );

        return res.status(500).json({
            message: "Booking gagal dibuat."
        });

    } finally {

        if (client) {
            client.release();
        }
    }
});

// ==========================================
// AMBIL DAFTAR BOOKING
// ==========================================

function normalizeRole(role) {
    return String(role || "").trim().toLowerCase();
}

function normalizeWhatsappPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");

    if (!digits) return "62881026380060";

    if (digits.startsWith("0")) return "62" + digits.slice(1);
    if (digits.startsWith("62")) return digits;
    if (digits.startsWith("8")) return "62" + digits;

    return digits;
}

function buildBookingQuery(whereClause) {
    return `
        SELECT
            b.*,
            u.name AS customer_name,
            u.email AS customer_email,
            u.phone AS customer_phone,
            s.name AS service_name,
            sp.package_name,
            w.name AS worker_name,
            w.phone AS worker_phone,
            p.payment_method,
            p.payment_status,
            p.amount AS payment_amount,
            p.paid_at,
            p."proof image" AS proof_image
        FROM public.bookings b
        LEFT JOIN public.users u ON u.id = b.user_id
        LEFT JOIN public.services s ON s.id = b.service_id
        LEFT JOIN public.service_packages sp ON sp.id = b.package_id
        LEFT JOIN public.workers w ON w.id = b.worker_id
        LEFT JOIN public.payments p ON p.booking_id = b.id
        ${whereClause}
        ORDER BY b.id DESC
    `;
}

router.get("/api/bookings", verifyToken, async (req, res) => {
    try {
        const role = normalizeRole(req.user.role);
        const params = [];
        let whereClause = "";

        if (role === "admin") {
            whereClause = "";
        } else if (role === "worker") {
            whereClause = "WHERE w.user_id = $1";
            params.push(req.user.id);
        } else {
            whereClause = "WHERE b.user_id = $1";
            params.push(req.user.id);
        }

        const result = await db.query(buildBookingQuery(whereClause), params);

        return res.json({
            message: "Data booking berhasil diambil.",
            bookings: result.rows
        });
    } catch (error) {
        console.error("Gagal mengambil booking:", error.message);

        return res.status(500).json({
            message: "Gagal mengambil data booking."
        });
    }
});

// ==========================================
// TUGASKAN WORKER KE BOOKING
// ==========================================

router.patch("/api/bookings/:id/assign", verifyToken, async (req, res) => {
    if (normalizeRole(req.user.role) !== "admin") {
        return res.status(403).json({
            message: "Akses khusus administrator."
        });
    }

    const bookingId = Number.parseInt(req.params.id, 10);
    const workerId = Number.parseInt(req.body.worker_id, 10);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
        return res.status(400).json({
            message: "ID booking tidak valid."
        });
    }

    if (!Number.isInteger(workerId) || workerId <= 0) {
        return res.status(400).json({
            message: "ID petugas tidak valid."
        });
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const bookingCheck = await client.query(
            "SELECT id FROM public.bookings WHERE id = $1",
            [bookingId]
        );

        if (bookingCheck.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Booking tidak ditemukan."
            });
        }

        const workerCheck = await client.query(
            "SELECT id, name, phone FROM public.workers WHERE id = $1",
            [workerId]
        );

        if (workerCheck.rowCount === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Petugas tidak ditemukan."
            });
        }

        const worker = workerCheck.rows[0];

        await client.query(
            `
            UPDATE public.bookings
            SET worker_id = $1, status = 'assigned'
            WHERE id = $2
            `,
            [workerId, bookingId]
        );

        await client.query("COMMIT");

        const updated = await db.query(
            buildBookingQuery("WHERE b.id = $1"),
            [bookingId]
        );

        const booking = updated.rows[0];
        const phone = normalizeWhatsappPhone(worker.phone);
        const message =
            `Halo ${worker.name}, Anda mendapat tugas GriyaResik. ` +
            `Booking #${bookingId} - ${booking.service_name || "Layanan"} ` +
            `pada ${booking.booking_date} ${booking.booking_time}. ` +
            `Alamat: ${booking.address}. Total: ${booking.total_price}. ` +
            `Silakan buka halaman Tugas Saya di aplikasi GriyaResik ` +
            `dan klik Konfirmasi Tugas.`;

        return res.json({
            message: "Petugas berhasil ditugaskan.",
            booking,
            whatsappUrl: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        });
    } catch (error) {
        console.error("Gagal menugaskan petugas:", error.message);

        return res.status(500).json({
            message: "Gagal menugaskan petugas."
        });
    } finally {
        client.release();
    }
});

// ==========================================
// WORKER KONFIRMASI TUGAS
// ==========================================

router.patch("/api/bookings/:id/confirm", verifyToken, async (req, res) => {
    if (normalizeRole(req.user.role) !== "worker") {
        return res.status(403).json({
            message: "Hanya petugas yang dapat mengonfirmasi tugas."
        });
    }

    const bookingId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
        return res.status(400).json({
            message: "ID booking tidak valid."
        });
    }

    try {
        const check = await db.query(
            `
            SELECT b.id, b.status
            FROM public.bookings b
            INNER JOIN public.workers w ON w.id = b.worker_id
            WHERE b.id = $1 AND w.user_id = $2
            `,
            [bookingId, req.user.id]
        );

        if (check.rowCount === 0) {
            return res.status(404).json({
                message: "Tugas tidak ditemukan untuk akun Anda."
            });
        }

        const currentStatus = String(check.rows[0].status || "")
            .trim()
            .toLowerCase();

        if (currentStatus !== "assigned") {
            return res.status(400).json({
                message:
                    currentStatus === "processing"
                        ? "Tugas sudah dikonfirmasi."
                        : "Tugas belum siap dikonfirmasi."
            });
        }

        await db.query(
            "UPDATE public.bookings SET status = 'processing' WHERE id = $1",
            [bookingId]
        );

        const updated = await db.query(
            buildBookingQuery("WHERE b.id = $1"),
            [bookingId]
        );

        return res.json({
            message: "Tugas berhasil dikonfirmasi.",
            booking: updated.rows[0]
        });
    } catch (error) {
        console.error("Gagal mengonfirmasi tugas:", error.message);

        return res.status(500).json({
            message: "Gagal mengonfirmasi tugas."
        });
    }
});

// ==========================================
// UBAH STATUS BOOKING
// ==========================================

router.patch("/api/bookings/:id/status", verifyToken, async (req, res) => {
    const bookingId = Number.parseInt(req.params.id, 10);
    const status = String(req.body.status || "").trim().toLowerCase();
    const allowed = [
        "pending",
        "assigned",
        "processing",
        "completed",
        "cancelled"
    ];
    const role = normalizeRole(req.user.role);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
        return res.status(400).json({
            message: "ID booking tidak valid."
        });
    }

    if (!allowed.includes(status)) {
        return res.status(400).json({
            message: "Status booking tidak valid."
        });
    }

    try {
        let checkQuery = "SELECT id FROM public.bookings WHERE id = $1";
        const checkParams = [bookingId];

        if (role === "worker") {
            checkQuery =
                "SELECT b.id FROM public.bookings b " +
                "INNER JOIN public.workers w ON w.id = b.worker_id " +
                "WHERE b.id = $1 AND w.user_id = $2";
            checkParams.push(req.user.id);
        } else if (role !== "admin") {
            return res.status(403).json({
                message: "Akses khusus administrator atau petugas."
            });
        }

        const check = await db.query(checkQuery, checkParams);

        if (check.rowCount === 0) {
            return res.status(404).json({
                message: "Booking tidak ditemukan."
            });
        }

        await db.query(
            "UPDATE public.bookings SET status = $1 WHERE id = $2",
            [status, bookingId]
        );

        const updated = await db.query(
            buildBookingQuery("WHERE b.id = $1"),
            [bookingId]
        );

        return res.json({
            message: "Status booking berhasil diperbarui.",
            booking: updated.rows[0]
        });
    } catch (error) {
        console.error("Gagal mengubah status booking:", error.message);

        return res.status(500).json({
            message: "Gagal mengubah status booking."
        });
    }
});

module.exports = router;
