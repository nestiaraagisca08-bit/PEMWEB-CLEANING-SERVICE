
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

app.use(cors());
app.use(express.json());

// Tes server
app.get("/", (req, res) => {
  res.json({ message: "Backend GriyaResik berjalan." });
});

// Tes koneksi database
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW() AS waktu");
    res.json({
      message: "Database terhubung.",
      waktu: result.rows[0].waktu,
    });
  } catch (error) {
    console.error("Tes database gagal:", error.message);
    res.status(500).json({ message: "Database gagal diakses." });
  }
});

// Registrasi menggunakan email dan password
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
        message: "Nama, email, dan password wajib diisi.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existing = await db.query(
      "SELECT id FROM public.users WHERE email = $1",
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "Email sudah terdaftar.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO public.users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [cleanName, cleanEmail, hashedPassword, "customer"]
    );

    return res.status(201).json({
      message: "Registrasi berhasil.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registrasi gagal:", error.message);
    return res.status(500).json({
      message: "Registrasi gagal. Silakan coba lagi.",
    });
  }
});

// Login menggunakan email dan password
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
        message: "Email dan password wajib diisi.",
      });
    }

    const result = await db.query(
      `SELECT id, name, email, password, role
       FROM public.users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0 || !result.rows[0].password) {
      return res.status(401).json({
        message: "Email atau password salah.",
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email atau password salah.",
      });
    }

    return res.json({
      message: "Login berhasil.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login gagal:", error.message);
    return res.status(500).json({
      message: "Login gagal. Silakan coba lagi.",
    });
  }
});

// Login Google dan registrasi otomatis pengguna baru
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (
      typeof credential !== "string" ||
      !credential ||
      !process.env.GOOGLE_CLIENT_ID
    ) {
      return res.status(400).json({
        message: "Token Google atau konfigurasi Client ID tidak tersedia.",
      });
    }

    // Verifikasi token secara langsung ke library Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        message: "Akun Google belum terverifikasi.",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];
    const picture = payload.picture || null;

    // Jika akun Google sudah pernah digunakan, login
    const googleUser = await db.query(
      `SELECT id, name, email, role
       FROM public.users
       WHERE google_id = $1`,
      [googleId]
    );

    if (googleUser.rows.length > 0) {
      return res.json({
        message: "Login Google berhasil.",
        user: googleUser.rows[0],
      });
    }

    // Jangan otomatis menghubungkan Google ke akun password
    const emailUser = await db.query(
      `SELECT id FROM public.users WHERE email = $1`,
      [email]
    );

    if (emailUser.rows.length > 0) {
      return res.status(409).json({
        message:
          "Email ini sudah terdaftar. Silakan login menggunakan email dan password terlebih dahulu.",
        code: "EMAIL_ALREADY_REGISTERED",
      });
    }

    // Pengguna Google baru: password NULL
    const newUser = await db.query(
      `INSERT INTO public.users
         (name, email, password, role, google_id, profile_picture)
       VALUES ($1, $2, NULL, $3, $4, $5)
       RETURNING id, name, email, role`,
      [name, email, "customer", googleId, picture]
    );

    return res.status(201).json({
      message: "Registrasi dan login Google berhasil.",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Google Login gagal:", error.message);
    return res.status(401).json({
      message: "Login Google gagal. Silakan coba lagi.",
    });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Backend GriyaResik berjalan di http://localhost:${PORT}`);
});
