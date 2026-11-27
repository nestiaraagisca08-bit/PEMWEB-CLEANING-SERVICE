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
// GET SEMUA DATA PETUGAS
// ==========================================

router.get(
    "/api/admin/workers",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        try {
            const result = await db.query(
                `SELECT
                    id,
                    name,
                    email,
                    phone,
                    photo,
                    address,
                    region,
                    packages,
                    status,
                    availability
                 FROM public.workers
                 ORDER BY id DESC`
            );

            return res.json({
                message: "Data petugas berhasil diambil.",
                workers: result.rows
            });

        } catch (error) {
            console.error(
                "Gagal mengambil petugas:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal mengambil data petugas."
            });
        }
    }
);

// ==========================================
// TAMBAH PETUGAS + MEMBUAT AKUN WORKER
// ==========================================

router.post(
    "/api/admin/workers",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        let client;
        let transactionStarted = false;

        try {
            const validationError = validateWorker(req.body);

            if (validationError) {
                return res.status(400).json({
                    message: validationError
                });
            }

            const {
                name,
                email,
                phone,
                photo,
                address,
                region,
                packages,
                status,
                availability
            } = req.body;

            const cleanName = name.trim();
            const cleanEmail = email.trim().toLowerCase();

            client = await db.connect();

            await client.query("BEGIN");
            transactionStarted = true;

            // 1. Periksa email pada users
            const existingUser = await client.query(
                `SELECT id
                 FROM public.users
                 WHERE LOWER(TRIM(email)) = $1`,
                [cleanEmail]
            );

            if (existingUser.rows.length > 0) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(409).json({
                    message: "Email sudah digunakan oleh akun lain."
                });
            }

            // 2. Periksa email pada workers
            const existingWorker = await client.query(
                `SELECT id
                 FROM public.workers
                 WHERE LOWER(TRIM(email)) = $1`,
                [cleanEmail]
            );

            if (existingWorker.rows.length > 0) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(409).json({
                    message: "Email petugas sudah digunakan."
                });
            }

            // 3. Buat password sementara
            const temporaryPassword = crypto
                .randomBytes(9)
                .toString("base64url");

            const hashedPassword = await bcrypt.hash(
                temporaryPassword,
                12
            );

            // 4. Buat akun Worker
            const userResult = await client.query(
                `INSERT INTO public.users
                    (name, email, password, role)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, name, email, role`,
                [
                    cleanName,
                    cleanEmail,
                    hashedPassword,
                    "worker"
                ]
            );

            const user = userResult.rows[0];

            // 5. Simpan profil Worker
            const workerResult = await client.query(
                `INSERT INTO public.workers
                    (
                        user_id,
                        name,
                        email,
                        phone,
                        photo,
                        address,
                        region,
                        packages,
                        status,
                        availability
                    )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING *`,
                [
                    user.id,
                    cleanName,
                    cleanEmail,
                    phone.trim(),
                    photo || null,
                    address.trim(),
                    region,
                    JSON.stringify(packages),
                    status,
                    availability
                ]
            );

            // 6. Simpan transaksi
            await client.query("COMMIT");
            transactionStarted = false;

            return res.status(201).json({
                message: "Akun Worker dan data petugas berhasil dibuat.",
                worker: workerResult.rows[0],
                account: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                temporaryPassword
            });

        } catch (error) {

            if (client && transactionStarted) {
                try {
                    await client.query("ROLLBACK");
                } catch (rollbackError) {
                    console.error(
                        "Rollback gagal:",
                        rollbackError.message
                    );
                }
            }

            console.error(
                "Tambah Worker gagal:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal membuat akun dan data petugas."
            });

        } finally {
            if (client) {
                client.release();
            }
        }
    }
);

// ==========================================
// UPDATE DATA PETUGAS + SINKRONISASI USERS
// ==========================================

router.put(
    "/api/admin/workers/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        let client;
        let transactionStarted = false;

        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID petugas tidak valid."
                });
            }

            const validationError = validateWorker(req.body);

            if (validationError) {
                return res.status(400).json({
                    message: validationError
                });
            }

            const {
                name,
                email,
                phone,
                photo,
                address,
                region,
                packages,
                status,
                availability
            } = req.body;

            const cleanName = name.trim();
            const cleanEmail = email.trim().toLowerCase();

            client = await db.connect();

            await client.query("BEGIN");
            transactionStarted = true;

            // 1. Cari petugas dan akun yang terhubung
            const workerResult = await client.query(
                `SELECT
                    w.id,
                    w.user_id,
                    u.id AS account_id
                 FROM public.workers w
                 INNER JOIN public.users u
                    ON u.id = w.user_id
                 WHERE w.id = $1
                 FOR UPDATE OF w, u`,
                [id]
            );

            if (workerResult.rows.length === 0) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(404).json({
                    message: "Petugas atau akun pengguna tidak ditemukan."
                });
            }

            const accountId = workerResult.rows[0].account_id;

            // 2. Periksa email duplikat di users
            const duplicateUser = await client.query(
                `SELECT id
                 FROM public.users
                 WHERE LOWER(TRIM(email)) = $1
                 AND id <> $2`,
                [cleanEmail, accountId]
            );

            if (duplicateUser.rows.length > 0) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(409).json({
                    message: "Email sudah digunakan oleh akun lain."
                });
            }

            // 3. Periksa email duplikat di workers
            const duplicateWorker = await client.query(
                `SELECT id
                 FROM public.workers
                 WHERE LOWER(TRIM(email)) = $1
                 AND id <> $2`,
                [cleanEmail, id]
            );

            if (duplicateWorker.rows.length > 0) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(409).json({
                    message: "Email petugas sudah digunakan."
                });
            }

            // 4. Perbarui akun users
            const userUpdate = await client.query(
                `UPDATE public.users
                 SET
                    name = $1,
                    email = $2
                 WHERE id = $3
                 AND role = 'worker'
                 RETURNING id, name, email, role`,
                [
                    cleanName,
                    cleanEmail,
                    accountId
                ]
            );

            if (userUpdate.rows.length === 0) {
                throw new Error(
                    "Akun Worker tidak ditemukan atau role tidak sesuai."
                );
            }

            // 5. Perbarui data workers
            const updatedWorker = await client.query(
                `UPDATE public.workers
                 SET
                    name = $1,
                    email = $2,
                    phone = $3,
                    photo = $4,
                    address = $5,
                    region = $6,
                    packages = $7,
                    status = $8,
                    availability = $9
                 WHERE id = $10
                 RETURNING *`,
                [
                    cleanName,
                    cleanEmail,
                    phone.trim(),
                    photo || null,
                    address.trim(),
                    region,
                    JSON.stringify(packages),
                    status,
                    availability,
                    id
                ]
            );

            // 6. Simpan kedua perubahan
            await client.query("COMMIT");
            transactionStarted = false;

            return res.json({
                message: "Data petugas dan akun berhasil diperbarui.",
                worker: updatedWorker.rows[0],
                account: userUpdate.rows[0]
            });

        } catch (error) {

            if (client && transactionStarted) {
                try {
                    await client.query("ROLLBACK");
                } catch (rollbackError) {
                    console.error(
                        "Rollback gagal:",
                        rollbackError.message
                    );
                }
            }

            console.error(
                "Update petugas gagal:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal memperbarui data petugas."
            });

        } finally {
            if (client) {
                client.release();
            }
        }
    }
);
// ==========================================
// HAPUS PETUGAS
// ==========================================

router.delete(
    "/api/admin/workers/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({
                    message: "ID petugas tidak valid."
                });
            }

            const result = await db.query(
                `DELETE FROM public.workers
                 WHERE id = $1
                 RETURNING id`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Petugas tidak ditemukan."
                });
            }

            return res.json({
                message: "Petugas berhasil dihapus."
            });

        } catch (error) {
            console.error(
                "Hapus petugas gagal:",
                error.message
            );

            if (error.code === "23503") {
                return res.status(409).json({
                    message: "Petugas tidak dapat dihapus karena masih terhubung dengan data pemesanan. Ubah status menjadi nonaktif."
                });
            }

            return res.status(500).json({
                message: "Gagal menghapus data petugas."
            });
        }
    }
);

module.exports = router;
