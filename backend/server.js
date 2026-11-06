require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const db = require("./db");
const { verifyToken, verifyAdmin } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

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

// ==========================================
// KONFIGURASI JWT
// ==========================================

function generateToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET belum diatur di file .env");
    }

    const token = jwt.sign(
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

    return token;
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
             WHERE email = $1`,
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

        const result = await db.query(
            `SELECT id, name, email, password, role
             FROM public.users
             WHERE email = $1`,
            [email.trim().toLowerCase()]
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

        console.log("EMAIL JWT CHECK:", {
            berhasilDibuat: Boolean(token),
            tipe: typeof token,
            panjang: token ? token.length : 0
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
          console.error("Verifikasi Google gagal:", error.message);

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

      // 3. Ambil informasi akun Google
      const googleId = payload.sub;
      const email = payload.email.toLowerCase();
      const name = payload.name || email.split("@")[0];
      const picture = payload.picture || null;

      // 4. Cari akun berdasarkan Google ID
      const googleUser = await db.query(
          `SELECT id, name, email, role
           FROM public.users
           WHERE google_id = $1`,
          [googleId]
      );

      let user;
      let message;

      // 5. Jika akun Google sudah terdaftar
      if (googleUser.rows.length > 0) {

          user = googleUser.rows[0];

          message = "Login Google berhasil.";

      } else {

          // 6. Periksa apakah email sudah digunakan
          const emailUser = await db.query(
              `SELECT id
               FROM public.users
               WHERE email = $1`,
              [email]
          );

          if (emailUser.rows.length > 0) {
              return res.status(409).json({
                  message: "Email sudah terdaftar menggunakan metode login lain.",
                  code: "EMAIL_ALREADY_REGISTERED"
              });
          }

          // 7. Registrasi pengguna Google baru
          const newUser = await db.query(
              `INSERT INTO public.users
                  (name, email, password, role, google_id, profile_picture)
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

      // 8. Buat JWT aplikasi
      const token = generateToken(user);

      console.log("GOOGLE JWT CHECK:", {
          berhasilDibuat: Boolean(token),
          tipe: typeof token,
          panjang: token.length
      });

      // 9. Kirim token dan data pengguna
      return res.status(200).json({
          message: message,
          token: token,
          user: user
      });

  } catch (error) {
      console.error("Google Login gagal:", error.message);

      return res.status(500).json({
          message: "Terjadi kesalahan pada proses login Google."
      });
  }
});
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
            console.error("Gagal mengambil petugas:", error.message);

            return res.status(500).json({
                message: "Gagal mengambil data petugas."
            });
        }
    }
);

// ==========================================
// TAMBAH PETUGAS
// ==========================================

app.post(
    "/api/admin/workers",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
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

            const cleanEmail = email.trim().toLowerCase();

            const existing = await db.query(
                `SELECT id
                 FROM public.workers
                 WHERE LOWER(email) = $1`,
                [cleanEmail]
            );

            if (existing.rows.length > 0) {
                return res.status(409).json({
                    message: "Email petugas sudah digunakan."
                });
            }

            const result = await db.query(
                `INSERT INTO public.workers
                    (
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
                 VALUES
                    ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [
                    name.trim(),
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

            return res.status(201).json({
                message: "Petugas berhasil ditambahkan.",
                worker: result.rows[0]
            });

        } catch (error) {
            console.error("Tambah petugas gagal:", error.message);

            return res.status(500).json({
                message: "Gagal menambahkan petugas."
            });
        }
    }
);

// ==========================================
// UPDATE DATA PETUGAS
// ==========================================

app.put(
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

            const cleanEmail = email.trim().toLowerCase();

            const existing = await db.query(
                `SELECT id
                 FROM public.workers
                 WHERE LOWER(email) = $1
                 AND id <> $2`,
                [cleanEmail, id]
            );

            if (existing.rows.length > 0) {
                return res.status(409).json({
                    message: "Email petugas sudah digunakan."
                });
            }

            const result = await db.query(
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
                    name.trim(),
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

            if (result.rows.length === 0) {
                return res.status(404).json({
                    message: "Petugas tidak ditemukan."
                });
            }

            return res.json({
                message: "Data petugas berhasil diperbarui.",
                worker: result.rows[0]
            });

        } catch (error) {
            console.error("Update petugas gagal:", error.message);

            return res.status(500).json({
                message: "Gagal memperbarui data petugas."
            });
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
            console.error("Hapus petugas gagal:", error.message);

            // Foreign key: petugas masih digunakan oleh booking
            if (error.code === "23503") {
                return res.status(409).json({
                    message: "Petugas tidak dapat dihapus karena masih terhubung dengan data pemesanan. Ubah status menjadi nonaktif."
                });
            }

            return res.status(500).json({
                message: "Gagal menghapus petugas."
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