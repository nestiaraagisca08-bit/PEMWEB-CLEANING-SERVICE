require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("./db");
const { verifyToken, verifyAdmin } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// UPLOAD FOTO PROFIL
// ==========================================

const profileUploadDir = path.join(__dirname, "uploads", "profile");

// Pastikan folder upload tersedia
if (!fs.existsSync(profileUploadDir)) {
    fs.mkdirSync(profileUploadDir, { recursive: true });
}

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, profileUploadDir);
    },

    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();

        const filename = `profile-${req.user.id}-${Date.now()}${ext}`;

        cb(null, filename);
    }
});

// Validasi file foto
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Foto harus berformat JPG, PNG, atau WEBP."));
    }
};

// Batas ukuran foto 5 MB
const uploadProfilePhoto = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

// ==========================================
// KONFIGURASI GOOGLE
// ==========================================

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// Akses file upload melalui browser
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// KONFIGURASI JWT
// ==========================================

function generateToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET belum diatur di file .env");
    }

    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
}

// ==========================================
// TES SERVER
// ==========================================

app.get("/", (req, res) => {
    res.json({
        message: "Backend GriyaResik berjalan."
    });
});

// ==========================================
// TES DATABASE
// ==========================================

app.get("/test-db", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT NOW() AS waktu"
        );

        return res.json({
            message: "Database terhubung.",
            waktu: result.rows[0].waktu
        });

    } catch (error) {
        console.error("Tes database gagal:", error.message);

        return res.status(500).json({
            message: "Database gagal diakses."
        });
    }
});

// ==========================================
// REGISTER EMAIL DAN PASSWORD
// ==========================================

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Nama, email, dan password wajib diisi."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password minimal 8 karakter."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        const existing = await db.query(
            `SELECT id
             FROM public.users
             WHERE LOWER(TRIM(email)) = $1`,
            [cleanEmail]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: "Email sudah terdaftar."
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        const result = await db.query(
            `INSERT INTO public.users
                (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role`,
            [
                cleanName,
                cleanEmail,
                hashedPassword,
                "customer"
            ]
        );

        return res.status(201).json({
            message: "Registrasi berhasil.",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Registrasi gagal:", error.message);

        return res.status(500).json({
            message: "Registrasi gagal. Silakan coba lagi."
        });
    }
});

// ==========================================
// LOGIN EMAIL DAN PASSWORD
// ==========================================

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email dan password wajib diisi."
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const result = await db.query(
            `SELECT id, name, email, password, role
             FROM public.users
             WHERE LOWER(TRIM(email)) = $1`,
            [cleanEmail]
        );

        if (
            result.rows.length === 0 ||
            !result.rows[0].password
        ) {
            return res.status(401).json({
                message: "Email atau password salah."
            });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Email atau password salah."
            });
        }

        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        const token = generateToken(safeUser);

        console.log("EMAIL LOGIN BERHASIL:", {
            id: safeUser.id,
            email: safeUser.email,
            role: safeUser.role
        });

        return res.status(200).json({
            message: "Login berhasil.",
            token: token,
            user: safeUser
        });

    } catch (error) {
        console.error("Login gagal:", error.message);

        return res.status(500).json({
            message: "Login gagal. Silakan coba lagi."
        });
    }
});

// ==========================================
// LOGIN GOOGLE
// ==========================================

app.post("/api/auth/google", async (req, res) => {
    let client;
    let transactionStarted = false;

    try {
        const { credential } = req.body;

        // 1. Validasi credential
        if (
            typeof credential !== "string" ||
            !credential ||
            !process.env.GOOGLE_CLIENT_ID
        ) {
            return res.status(400).json({
                message: "Credential Google atau Client ID tidak tersedia."
            });
        }

        // 2. Verifikasi token Google
        let ticket;

        try {
            ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });

        } catch (error) {
            console.error(
                "Verifikasi Google gagal:",
                error.message
            );

            return res.status(401).json({
                message: "Token Google tidak valid."
            });
        }

        const payload = ticket.getPayload();

        if (
            !payload ||
            !payload.sub ||
            !payload.email ||
            payload.email_verified !== true
        ) {
            return res.status(401).json({
                message: "Akun Google belum terverifikasi."
            });
        }

        // 3. Informasi akun Google
        const googleId = payload.sub;
        const email = payload.email.trim().toLowerCase();
        const name = payload.name || email.split("@")[0];
        const picture = payload.picture || null;

        client = await db.connect();

        await client.query("BEGIN");
        transactionStarted = true;

        let user;
        let message;

        // 4. Cari berdasarkan Google ID
        const googleUser = await client.query(
            `SELECT id, name, email, role
             FROM public.users
             WHERE google_id = $1
             FOR UPDATE`,
            [googleId]
        );

        if (googleUser.rows.length > 0) {

            // Akun Google sudah terhubung
            user = googleUser.rows[0];

            message = "Login Google berhasil.";

        } else {

            // 5. Cari akun berdasarkan email
            const emailUser = await client.query(
                `SELECT id, name, email, role, google_id
                 FROM public.users
                 WHERE LOWER(TRIM(email)) = $1
                 FOR UPDATE`,
                [email]
            );

            if (emailUser.rows.length > 1) {
                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(409).json({
                    message: "Terdapat lebih dari satu akun dengan email tersebut. Hubungi administrator."
                });
            }

            if (emailUser.rows.length === 1) {

                const existingUser = emailUser.rows[0];

                // 6. Periksa konflik Google ID
                if (
                    existingUser.google_id &&
                    existingUser.google_id !== googleId
                ) {
                    await client.query("ROLLBACK");
                    transactionStarted = false;

                    return res.status(409).json({
                        message: "Email sudah terhubung dengan akun Google lain.",
                        code: "GOOGLE_ACCOUNT_CONFLICT"
                    });
                }

                // 7. Hubungkan Google dengan akun lama
                // Role, password, dan ID tidak diubah
                const linkedUser = await client.query(
                    `UPDATE public.users
                     SET
                        google_id = $1,
                        profile_picture = COALESCE(profile_picture, $2)
                     WHERE id = $3
                     RETURNING id, name, email, role`,
                    [
                        googleId,
                        picture,
                        existingUser.id
                    ]
                );

                user = linkedUser.rows[0];

                message = "Akun berhasil dihubungkan dengan Google.";

            } else {

                // 8. Jika belum ada, buat akun Customer baru
                const newUser = await client.query(
                    `INSERT INTO public.users
                        (
                            name,
                            email,
                            password,
                            role,
                            google_id,
                            profile_picture
                        )
                     VALUES ($1, $2, NULL, $3, $4, $5)
                     RETURNING id, name, email, role`,
                    [
                        name,
                        email,
                        "customer",
                        googleId,
                        picture
                    ]
                );

                user = newUser.rows[0];

                message = "Registrasi dan login Google berhasil.";
            }
        }

        if (!user) {
            throw new Error("Data pengguna tidak ditemukan.");
        }

        // 9. Simpan perubahan
        await client.query("COMMIT");
        transactionStarted = false;

        // 10. Buat JWT
        const token = generateToken(user);

        console.log("GOOGLE LOGIN BERHASIL:", {
            id: user.id,
            email: user.email,
            role: user.role
        });

        // 11. Kirim respons
        return res.status(200).json({
            message: message,
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
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

        console.error("Google Login gagal:", error);

        return res.status(500).json({
            message: "Terjadi kesalahan pada proses login Google."
        });

    } finally {
        if (client) {
            client.release();
        }
    }
});
// ==========================================
// DATA CUSTOMER - ADMIN
// ==========================================

app.get(
    "/api/admin/customers",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
        try {
            const result = await db.query(
                `SELECT
                    id,
                    name,
                    email,
                    google_id,
                    profile_picture
                 FROM public.users
                 WHERE LOWER(TRIM(role)) = 'customer'
                 ORDER BY id DESC`
            );

            return res.json({
                message: "Data customer berhasil diambil.",
                customers: result.rows
            });

        } catch (error) {
            console.error(
                "Gagal mengambil data customer:",
                error.message
            );

            return res.status(500).json({
                message: "Gagal mengambil data customer."
            });
        }
    }
);
// ==========================================
// DATA PETUGAS - VALIDASI
// ==========================================

function validateWorker(data) {
    const {
        name,
        email,
        phone,
        address,
        region,
        packages,
        status,
        availability
    } = data;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof phone !== "string" ||
        !phone.trim()
    ) {
        return "Nama dan nomor telepon wajib diisi.";
    }

    if (name.trim().length > 100) {
        return "Nama maksimal 100 karakter.";
    }

    if (phone.trim().length > 20) {
        return "Nomor telepon maksimal 20 karakter.";
    }

    if (
        typeof email !== "string" ||
        !email.trim() ||
        email.length > 100
    ) {
        return "Email wajib diisi dan maksimal 100 karakter.";
    }

    if (
        typeof address !== "string" ||
        !address.trim()
    ) {
        return "Alamat wajib diisi.";
    }

    const allowedRegions = ["SB", "ST", "SU", "SS", "SP"];

    if (!allowedRegions.includes(region)) {
        return "Wilayah operasional tidak valid.";
    }

    const allowedPackages = ["Basic", "Standard", "Deep"];

    if (
        !Array.isArray(packages) ||
        packages.length < 2 ||
        packages.some(item => !allowedPackages.includes(item))
    ) {
        return "Pilih minimal dua paket cleaning yang valid.";
    }

    if (
        packages.length === 2 &&
        packages.includes("Basic") &&
        packages.includes("Deep")
    ) {
        return "Kombinasi Basic dan Deep saja tidak diperbolehkan.";
    }

    if (!["Aktif", "Nonaktif"].includes(status)) {
        return "Status petugas tidak valid.";
    }

    if (!["Tersedia", "Sedang Bertugas"].includes(availability)) {
        return "Ketersediaan petugas tidak valid.";
    }

    return null;
}

// ==========================================
// GET SEMUA DATA PETUGAS
// ==========================================

app.get(
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

app.post(
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

app.put(
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

app.delete(
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

// ==========================================
// LAYANAN - CUSTOMER
// ==========================================

// Customer mengambil layanan aktif beserta paketnya
app.get("/api/services", async (req, res) => {
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

// ==========================================
// LAYANAN - ADMIN
// ==========================================

// Admin mengambil seluruh layanan
app.get(
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
// VALIDASI DATA LAYANAN
// ==========================================

function validateService(data) {
    const {
        name,
        category,
        basic,
        standard,
        deep,
        status
    } = data;

    if (
        typeof name !== "string" ||
        !name.trim() ||
        name.trim().length > 100
    ) {
        return "Nama layanan wajib diisi dan maksimal 100 karakter.";
    }

    if (
        typeof category !== "string" ||
        !["Ruangan", "Area Rumah", "Custom"].includes(category)
    ) {
        return "Kategori layanan tidak valid.";
    }

    for (const price of [basic, standard, deep]) {
        if (
            typeof price !== "number" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            return "Harga paket harus berupa angka dan tidak boleh negatif.";
        }
    }

    if (!["active", "inactive"].includes(status)) {
        return "Status layanan tidak valid.";
    }

    return null;
}
// ==========================================
// TAMBAH LAYANAN
// ==========================================

app.post(
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

app.put(
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

app.delete(
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

// ==========================================
// PROFIL CUSTOMER
// ==========================================

// ==========================================
// PROFIL CUSTOMER
// ==========================================

// GET PROFIL PENGGUNA
app.get("/api/profile", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT
                id,
                name,
                email,
                phone,
                role,
                profile_picture
             FROM public.users
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Data pengguna tidak ditemukan."
            });
        }

        const user = result.rows[0];

        // Jika foto merupakan file lokal, ubah menjadi URL
        if (
            user.profile_picture &&
            !user.profile_picture.startsWith("http")
        ) {
            user.profile_picture = `${req.protocol}://${req.get("host")}${user.profile_picture}`;
        }

        return res.json({
            message: "Profil berhasil diambil.",
            user
        });

    } catch (error) {
        console.error("GET profil gagal:", error.message);

        return res.status(500).json({
            message: "Gagal mengambil profil."
        });
    }
});


// UPDATE PROFIL PENGGUNA + FOTO
app.put(
    "/api/profile",
    verifyToken,
    uploadProfilePhoto.single("profilePhoto"),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { name, phone } = req.body;

            if (
                typeof name !== "string" ||
                !name.trim()
            ) {
                return res.status(400).json({
                    message: "Nama lengkap wajib diisi."
                });
            }

            if (name.trim().length > 100) {
                return res.status(400).json({
                    message: "Nama maksimal 100 karakter."
                });
            }

            if (
                phone &&
                !/^[0-9+\-\s]{8,20}$/.test(phone.trim())
            ) {
                return res.status(400).json({
                    message: "Format nomor telepon tidak valid."
                });
            }

            // Ambil foto lama
            const oldProfile = await db.query(
                `SELECT profile_picture
                 FROM public.users
                 WHERE id = $1`,
                [userId]
            );

            if (oldProfile.rows.length === 0) {
                return res.status(404).json({
                    message: "Pengguna tidak ditemukan."
                });
            }

            const oldPhoto = oldProfile.rows[0].profile_picture;

            // Foto baru jika ada upload
            let profilePicture = oldPhoto;

            if (req.file) {
                profilePicture = `/uploads/profile/${req.file.filename}`;
            }

            // Update database
            const result = await db.query(
                `UPDATE public.users
                 SET
                    name = $1,
                    phone = $2,
                    profile_picture = $3
                 WHERE id = $4
                 RETURNING
                    id,
                    name,
                    email,
                    phone,
                    role,
                    profile_picture`,
                [
                    name.trim(),
                    phone ? phone.trim() : null,
                    profilePicture,
                    userId
                ]
            );

            const user = result.rows[0];

            // Buat URL foto agar dapat ditampilkan browser
            if (
                user.profile_picture &&
                !user.profile_picture.startsWith("http")
            ) {
                user.profile_picture = `${req.protocol}://${req.get("host")}${user.profile_picture}`;
            }

            return res.json({
                message: "Profil berhasil diperbarui.",
                user
            });

        } catch (error) {
            console.error("UPDATE profil gagal:", error);

            return res.status(500).json({
                message: "Gagal memperbarui profil."
            });
        }
    }
);

// ==========================================
// DASHBOARD ADMIN
// ==========================================

app.get(
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
                            'selesai',
                            'completed',
                            'complete'
                        )
                    ) AS completed,

                    COUNT(*) FILTER (
                        WHERE LOWER(TRIM(status)) IN (
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

// ==========================================
// MENJALANKAN SERVER
// ==========================================

app.listen(PORT, () => {
    console.log("====================================");
    console.log("Backend GriyaResik berhasil dijalankan");
    console.log(`URL        : http://localhost:${PORT}`);
    console.log(`SERVER FILE: ${__filename}`);
    console.log(`GOOGLE_CLIENT_ID tersedia: ${Boolean(process.env.GOOGLE_CLIENT_ID)}`);
    console.log(`JWT_SECRET tersedia: ${Boolean(process.env.JWT_SECRET)}`);
    console.log("====================================");
});