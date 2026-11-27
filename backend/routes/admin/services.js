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
// LAYANAN - ADMIN
// ==========================================

// Admin mengambil seluruh layanan
router.get(
    "/api/admin/services",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        try {
            const result = await db.query(`
                SELECT
                    s.id,
                    s.name,
                    s.description,
                    s.category,
                    s.status,

                    sp.package_name,
                    sp.price,
                    sp.description AS package_description,
                    sp.estimated_duration

                FROM public.services s

                LEFT JOIN public.service_packages sp
                    ON s.id = sp.service_id

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
                if (!servicesMap.has(row.id)) {
                    servicesMap.set(row.id, {
                        id: row.id,
                        name: row.name,
                        description: row.description,
                        category: row.category,
                        status: ["aktif", "active"].includes(
                            String(row.status || "").toLowerCase()
                        )
                            ? "active"
                            : "inactive",
                        packages: {}
                    });
                }

                if (row.package_name) {
                    servicesMap.get(row.id).packages[row.package_name] = {
                        price: Number(row.price),
                        description: row.package_description,
                        duration: row.estimated_duration
                    };
                }
            }

            return res.json({
                message: "Data layanan berhasil diambil.",
                services: Array.from(servicesMap.values())
            });

        } catch (error) {
            console.error(
                "Gagal mengambil layanan admin:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal mengambil data layanan."
            });
        }
    }
);
// ==========================================
// TAMBAH LAYANAN
// ==========================================

router.post(
    "/api/admin/services",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        const client = await db.connect();

        try {
            const validationError = validateService(req.body);

            if (validationError) {
                return res.status(400).json({
                    message: validationError
                });
            }

            const {
                name,
                category,
                basic,
                standard,
                deep,
                status
            } = req.body;

            await client.query("BEGIN");

            const duplicate = await client.query(
                `SELECT id
                 FROM public.services
                 WHERE LOWER(name) = LOWER($1)`,
                [name.trim()]
            );

            if (duplicate.rows.length > 0) {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    message: "Nama layanan sudah tersedia."
                });
            }

            const serviceResult = await client.query(
                `INSERT INTO public.services
                    (name, description, price, category, status)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [
                    name.trim(),
                    "",
                    basic,
                    category,
                    status === "active" ? "aktif" : "nonaktif"
                ]
            );

            const serviceId = serviceResult.rows[0].id;

            const packages = [
                {
                    name: "Basic",
                    price: basic,
                    duration: "45–60 menit"
                },
                {
                    name: "Standard",
                    price: standard,
                    duration: "60–120 menit"
                },
                {
                    name: "Deep",
                    price: deep,
                    duration: "120–180 menit"
                }
            ];

            for (const item of packages) {
                await client.query(
                    `INSERT INTO public.service_packages
                        (service_id, package_name, description, price, estimated_duration)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        serviceId,
                        item.name,
                        "",
                        item.price,
                        item.duration
                    ]
                );
            }

            await client.query("COMMIT");

            return res.status(201).json({
                message: "Layanan berhasil ditambahkan.",
                serviceId
            });

        } catch (error) {
            await client.query("ROLLBACK");

            console.error("Tambah layanan gagal:", error.message);

            return res.status(500).json({
                message: "Gagal menambahkan layanan."
            });

        } finally {
            client.release();
        }
    }
);

// ==========================================
// EDIT LAYANAN
// ==========================================

router.put(
    "/api/admin/services/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        const client = await db.connect();

        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID layanan tidak valid."
                });
            }

            const validationError = validateService(req.body);

            if (validationError) {
                return res.status(400).json({
                    message: validationError
                });
            }

            const {
                name,
                category,
                basic,
                standard,
                deep,
                status
            } = req.body;

            await client.query("BEGIN");

            const duplicate = await client.query(
                `SELECT id
                 FROM public.services
                 WHERE LOWER(name) = LOWER($1)
                 AND id <> $2`,
                [name.trim(), id]
            );

            if (duplicate.rows.length > 0) {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    message: "Nama layanan sudah digunakan."
                });
            }

            const updated = await client.query(
                `UPDATE public.services
                 SET
                    name = $1,
                    category = $2,
                    price = $3,
                    status = $4
                 WHERE id = $5
                 RETURNING id`,
                [
                    name.trim(),
                    category,
                    basic,
                    status === "active" ? "aktif" : "nonaktif",
                    id
                ]
            );

            if (updated.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    message: "Layanan tidak ditemukan."
                });
            }

            const prices = [
                ["Basic", basic],
                ["Standard", standard],
                ["Deep", deep]
            ];

            for (const [packageName, price] of prices) {

                const packageUpdate = await client.query(
                    `UPDATE public.service_packages
                     SET price = $1
                     WHERE service_id = $2
                     AND package_name = $3`,
                    [price, id, packageName]
                );

                if (packageUpdate.rowCount === 0) {
                    await client.query(
                        `INSERT INTO public.service_packages
                            (service_id, package_name, description, price, estimated_duration)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [
                            id,
                            packageName,
                            "",
                            price,
                            "60–120 menit"
                        ]
                    );
                }
            }

            await client.query("COMMIT");

            return res.json({
                message: "Layanan berhasil diperbarui."
            });

        } catch (error) {
            await client.query("ROLLBACK");

            console.error("Update layanan gagal:", error.message);

            return res.status(500).json({
                message: "Gagal memperbarui layanan."
            });

        } finally {
            client.release();
        }
    }
);

// ==========================================
// HAPUS LAYANAN
// ==========================================

router.delete(
    "/api/admin/services/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID layanan tidak valid."
                });
            }

            const result = await db.query(
                `DELETE FROM public.services
                 WHERE id = $1
                 RETURNING id`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Layanan tidak ditemukan."
                });
            }

            return res.json({
                message: "Layanan berhasil dihapus."
            });

        } catch (error) {
            console.error("Hapus layanan gagal:", error.message);

            if (error.code === "23503") {
                return res.status(409).json({
                    message: "Layanan tidak dapat dihapus karena sudah digunakan pada data pemesanan. Nonaktifkan layanan sebagai gantinya."
                });
            }

            return res.status(500).json({
                message: "Gagal menghapus layanan."
            });
        }
    }
);

module.exports = router;
