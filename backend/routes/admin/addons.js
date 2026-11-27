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
// ADD-ON - ADMIN
// ==========================================

// ==========================================
// GET SEMUA ADD-ON
// ==========================================

router.get(
    "/api/admin/addons",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        try {
            const result = await db.query(`
                SELECT
                    a.id,
                    a.name,
                    a.price,
                    a.description,
                    a.is_active,

                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', s.id,
                                'name', s.name
                            )
                        ) FILTER (WHERE s.id IS NOT NULL),
                        '[]'
                    ) AS services

                FROM public.addons a

                LEFT JOIN public.service_addons sa
                    ON a.id = sa.addon_id

                LEFT JOIN public.services s
                    ON sa.service_id = s.id

                GROUP BY
                    a.id,
                    a.name,
                    a.price,
                    a.description,
                    a.is_active

                ORDER BY a.id ASC
            `);

            return res.json({
                message: "Data add-on berhasil diambil.",
                addons: result.rows
            });

        } catch (error) {
            console.error(
                "Gagal mengambil data add-on:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal mengambil data add-on."
            });
        }
    }
);
// ==========================================
// TAMBAH ADD-ON
// ==========================================

router.post(
    "/api/admin/addons",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        const client = await db.connect();

        try {
            const validationError = validateAddon(req.body);

            if (validationError) {
                return res.status(400).json({
                    message: validationError
                });
            }

            const {
                name,
                price,
                description,
                services
            } = req.body;

            await client.query("BEGIN");

            // Cek nama add-on
            const duplicate = await client.query(
                `
                SELECT id
                FROM public.addons
                WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
                `,
                [name]
            );

            if (duplicate.rows.length > 0) {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    message: "Nama add-on sudah tersedia."
                });
            }

            // Validasi layanan
            const serviceCheck = await client.query(
                `
                SELECT id
                FROM public.services
                WHERE id = ANY($1::int[])
                `,
                [services.map(Number)]
            );

            if (
                serviceCheck.rows.length !==
                [...new Set(services.map(Number))].length
            ) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: "Terdapat layanan yang tidak valid."
                });
            }

            // Insert add-on
            const addonResult = await client.query(
                `
                INSERT INTO public.addons
                    (name, price, description, is_active)
                VALUES
                    ($1, $2, $3, TRUE)
                RETURNING *
                `,
                [
                    name.trim(),
                    price,
                    description?.trim() || null
                ]
            );

            const addonId = addonResult.rows[0].id;

            // Insert hubungan layanan
            for (const serviceId of [...new Set(services.map(Number))]) {
                await client.query(
                    `
                    INSERT INTO public.service_addons
                        (service_id, addon_id)
                    VALUES
                        ($1, $2)
                    `,
                    [
                        serviceId,
                        addonId
                    ]
                );
            }

            await client.query("COMMIT");

            return res.status(201).json({
                message: "Add-on berhasil ditambahkan.",
                addon: addonResult.rows[0]
            });

        } catch (error) {
            await client.query("ROLLBACK");

            console.error(
                "Tambah add-on gagal:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal menambahkan add-on."
            });

        } finally {
            client.release();
        }
    }
);

// ==========================================
// EDIT ADD-ON
// ==========================================

router.put(
    "/api/admin/addons/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        const client = await db.connect();

        try {
            const id = Number(req.params.id);

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {
                return res.status(400).json({
                    message: "ID add-on tidak valid."
                });
            }

            const validationError = validateAddon(req.body);

            if (validationError) {
                return res.status(400).json({
                    message: validationError
                });
            }

            const {
                name,
                price,
                description,
                services
            } = req.body;

            await client.query("BEGIN");

            // Cek add-on
            const addonCheck = await client.query(
                `
                SELECT id
                FROM public.addons
                WHERE id = $1
                `,
                [id]
            );

            if (addonCheck.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    message: "Add-on tidak ditemukan."
                });
            }

            // Cek nama duplikat
            const duplicate = await client.query(
                `
                SELECT id
                FROM public.addons
                WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
                AND id <> $2
                `,
                [
                    name,
                    id
                ]
            );

            if (duplicate.rows.length > 0) {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    message: "Nama add-on sudah digunakan."
                });
            }

            // Validasi layanan
            const serviceCheck = await client.query(
                `
                SELECT id
                FROM public.services
                WHERE id = ANY($1::int[])
                `,
                [services.map(Number)]
            );

            if (
                serviceCheck.rows.length !==
                [...new Set(services.map(Number))].length
            ) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    message: "Terdapat layanan yang tidak valid."
                });
            }

            // Update data add-on
            const updatedAddon = await client.query(
                `
                UPDATE public.addons
                SET
                    name = $1,
                    price = $2,
                    description = $3
                WHERE id = $4
                RETURNING *
                `,
                [
                    name.trim(),
                    price,
                    description?.trim() || null,
                    id
                ]
            );

            // Hapus relasi lama
            await client.query(
                `
                DELETE FROM public.service_addons
                WHERE addon_id = $1
                `,
                [id]
            );

            // Buat relasi baru
            for (const serviceId of [...new Set(services.map(Number))]) {
                await client.query(
                    `
                    INSERT INTO public.service_addons
                        (service_id, addon_id)
                    VALUES
                        ($1, $2)
                    `,
                    [
                        serviceId,
                        id
                    ]
                );
            }

            await client.query("COMMIT");

            return res.json({
                message: "Add-on berhasil diperbarui.",
                addon: updatedAddon.rows[0]
            });

        } catch (error) {
            await client.query("ROLLBACK");

            console.error(
                "Edit add-on gagal:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal memperbarui add-on."
            });

        } finally {
            client.release();
        }
    }
);

// ==========================================
// AKTIF / NONAKTIF ADD-ON
// ==========================================

router.patch(
    "/api/admin/addons/:id/status",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            const {
                is_active
            } = req.body;

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {
                return res.status(400).json({
                    message: "ID add-on tidak valid."
                });
            }

            if (
                typeof is_active !== "boolean"
            ) {
                return res.status(400).json({
                    message: "Status add-on tidak valid."
                });
            }

            const result = await db.query(
                `
                UPDATE public.addons
                SET is_active = $1
                WHERE id = $2
                RETURNING *
                `,
                [
                    is_active,
                    id
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Add-on tidak ditemukan."
                });
            }

            return res.json({
                message: "Status add-on berhasil diperbarui.",
                addon: result.rows[0]
            });

        } catch (error) {
            console.error(
                "Update status add-on gagal:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal mengubah status add-on."
            });
        }
    }
);

module.exports = router;
