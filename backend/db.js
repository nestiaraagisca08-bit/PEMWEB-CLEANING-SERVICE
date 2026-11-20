const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    ssl: {
        rejectUnauthorized: false
    },

    max: 5,
});

// Tes koneksi database
pool.query("SELECT NOW()")
    .then((result) => {
        console.log("Database Supabase berhasil terhubung!");
        console.log("Waktu database:", result.rows[0].now);
    })
    .catch((err) => {
        console.error("Koneksi database gagal:", err.message);
    });

// Menangani error koneksi idle
pool.on("error", (err) => {
    console.error("Database pool error:", err.message);
});

module.exports = pool;