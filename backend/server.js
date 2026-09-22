const express = require("express");
const db = require("./db");

const app = express();

app.use(express.json());

// Halaman utama
app.get("/", (req, res) => {
    res.json({
        message: "Backend Cleaning Service berhasil berjalan!"
    });
});

// Tes koneksi database
app.get("/test-db", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");

        res.json({
            message: "Database berhasil terhubung!",
            waktu: result.rows[0].now
        });
    } catch (error) {
        console.error("Error database:", error.message);

        res.status(500).json({
            message: "Database gagal terhubung!",
            error: error.message
        });
    }
});

// Menjalankan server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});