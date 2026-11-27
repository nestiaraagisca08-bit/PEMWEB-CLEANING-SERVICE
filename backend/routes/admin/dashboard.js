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
} = require("../../context");

// ==========================================
// DASHBOARD ADMIN
// ==========================================

router.get(
    "/api/admin/dashboard",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        try {
            // ==========================================
            // 1. STATISTIK CUSTOMER
            // ==========================================

            const customerResult = await db.query(`
                SELECT COUNT(*) AS total
                FROM public.users
                WHERE LOWER(TRIM(role)) = 'customer'
            `);

            // ==========================================
            // 2. STATISTIK PETUGAS
            // ==========================================

            const workerResult = await db.query(`
                SELECT COUNT(*) AS total
                FROM public.workers
            `);

            // ==========================================
            // 3. STATISTIK PEMESANAN
            // ==========================================

            const bookingResult = await db.query(`
                SELECT
                    COUNT(*) AS total,

                    COUNT(*) FILTER (
                        WHERE LOWER(TRIM(status)) IN (
                            'pending',
                            'menunggu',
                            'menunggu konfirmasi'
                        )
                    ) AS pending,

                    COUNT(*) FILTER (
                        WHERE LOWER(TRIM(status)) IN (
                            'assigned',
                            'ditugaskan',
                            'menunggu konfirmasi worker'
                        )
                    ) AS assigned,

                    COUNT(*) FILTER (
                        WHERE LOWER(TRIM(status)) IN (
                            'selesai',
                            'completed',
                            'complete'
                        )
                    ) AS completed,

                    COUNT(*) FILTER (
                        WHERE LOWER(TRIM(status)) IN (
                            'assigned',
                            'ditugaskan',
                            'diproses',
                            'processing',
                            'confirmed',
                            'dikonfirmasi'
                        )
                    ) AS processing

                FROM public.bookings
            `);

            // ==========================================
            // 4. TOTAL PENDAPATAN
            // ==========================================

            const revenueResult = await db.query(`
                SELECT COALESCE(SUM(amount), 0) AS total_revenue
                FROM public.payments
                WHERE LOWER(TRIM(payment_status)) IN (
                    'paid',
                    'success',
                    'successful',
                    'completed',
                    'lunas'
                )
            `);

            // ==========================================
            // 5. PEMESANAN TERBARU
            // ==========================================

            const recentBookingResult = await db.query(`
                SELECT
                    b.id,
                    b.booking_date,
                    b.booking_time,
                    b.status,
                    b.total_price,

                    u.name AS customer_name,

                    s.name AS service_name

                FROM public.bookings b

                LEFT JOIN public.users u
                    ON b.user_id = u.id

                LEFT JOIN public.services s
                    ON b.service_id = s.id

                ORDER BY b.id DESC

                LIMIT 5
            `);

            // ==========================================
            // 6. KIRIM DATA KE FRONTEND
            // ==========================================

            return res.json({
                message: "Dashboard berhasil mengambil data.",

                statistics: {
                    totalCustomers: Number(
                        customerResult.rows[0].total
                    ),

                    totalWorkers: Number(
                        workerResult.rows[0].total
                    ),

                    totalBookings: Number(
                        bookingResult.rows[0].total
                    ),

                    pendingBookings: Number(
                        bookingResult.rows[0].pending
                    ),

                    assignedBookings: Number(
                        bookingResult.rows[0].assigned
                    ),

                    processingBookings: Number(
                        bookingResult.rows[0].processing
                    ),

                    completedBookings: Number(
                        bookingResult.rows[0].completed
                    ),

                    totalRevenue: Number(
                        revenueResult.rows[0].total_revenue
                    )
                },

                recentBookings: recentBookingResult.rows
            });

        } catch (error) {

            console.error(
                "Dashboard admin gagal mengambil data:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal mengambil data dashboard."
            });
        }
    }
);

module.exports = router;
