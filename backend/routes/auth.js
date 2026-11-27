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
// REGISTER EMAIL DAN PASSWORD
// ==========================================

router.post("/api/auth/register", async (req, res) => {
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

router.post("/api/auth/login", async (req, res) => {
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

router.post("/api/auth/google", async (req, res) => {
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

                // 7. Auto-link hanya untuk customer.
                // Google membuktikan kepemilikan email, bukan hak akses
                // admin/worker. Akun privileged tidak boleh nhận kunci
                // hanya karena email Google-nya sama.
                const existingRole = String(
                    existingUser.role || ""
                )
                    .trim()
                    .toLowerCase();

                if (existingRole !== "customer") {
                    await client.query("ROLLBACK");
                    transactionStarted = false;

                    return res.status(403).json({
                        message:
                            "Akun admin/worker tidak dapat dihubungkan otomatis dengan Google. Silakan login dengan password atau hubungi administrator.",
                        code: "PRIVILEGED_LINK_REQUIRES_ADMIN"
                    });
                }

                // 8. Hubungkan Google dengan akun customer lama
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

                // 9. Jika belum ada, buat akun Customer baru
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

        // 10. Simpan perubahan
        await client.query("COMMIT");
        transactionStarted = false;

        // 11. Buat JWT
        const token = generateToken(user);

        // 12. Audit ringan tanpa credential/token
        console.log("GOOGLE LOGIN BERHASIL:", {
            id: user.id,
            email: user.email,
            role: user.role
        });

        // 13. Kirim respons
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

module.exports = router;
