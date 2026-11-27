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
// LAYANAN - CUSTOMER
// ==========================================

// Customer mengambil layanan aktif beserta paketnya
router.get("/api/services", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                s.id AS service_id,
                s.name,
                s.description AS service_description,
                s.category,
                s.status,

                sp.id AS package_id,
                sp.package_name,
                sp.description AS package_description,
                sp.price,
                sp.estimated_duration

            FROM public.services s

            LEFT JOIN public.service_packages sp
                ON s.id = sp.service_id

            WHERE LOWER(TRIM(s.status)) IN ('aktif', 'active')

            ORDER BY s.id,
                CASE sp.package_name
                    WHEN 'Basic' THEN 1
                    WHEN 'Standard' THEN 2
                    WHEN 'Deep' THEN 3
                    ELSE 4
                END
        `);

        const servicesMap = new Map();

        for (const row of result.rows) {
            if (!servicesMap.has(row.service_id)) {
                servicesMap.set(row.service_id, {
                    id: row.service_id,
                    name: row.name,
                    description: row.service_description,
                    category: row.category,
                    packages: []
                });
            }

            if (row.package_id) {
                servicesMap.get(row.service_id).packages.push({
                    id: row.package_id,
                    name: row.package_name,
                    description: row.package_description,
                    price: Number(row.price),
                    duration: row.estimated_duration
                });
            }
        }

        return res.json({
            message: "Data layanan berhasil diambil.",
            services: Array.from(servicesMap.values())
        });

    } catch (error) {
        console.error("Gagal mengambil layanan:", error.message);

        return res.status(500).json({
            message: "Gagal mengambil data layanan."
        });
    }
});

module.exports = router;
