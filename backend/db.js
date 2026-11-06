const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Tes koneksi database
pool.query("SELECT NOW()")
    .then(() => {
        console.log("Database PostgreSQL berhasil terhubung!");
    })
    .catch((err) => {
        console.error("Koneksi database gagal:", err.message);
    });

// Menangani error koneksi idle
pool.on("error", (err) => {
    console.error("Database pool error:", err.message);
});

module.exports = pool;