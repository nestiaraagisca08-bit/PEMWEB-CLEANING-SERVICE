const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// CORS dibatasi, tetapi origin lokal (localhost/127.0.0.1) tetap diizinkan
// pada port berapa pun supaya development dan uji tidak putus.
const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

function isLocalOrigin(origin) {
    try {
        return ["localhost", "127.0.0.1", "::1"].includes(
            new URL(origin).hostname
        );
    } catch (error) {
        return false;
    }
}

app.use(
    cors({
        origin(origin, callback) {
            if (
                !origin ||
                isLocalOrigin(origin) ||
                extraOrigins.includes(origin)
            ) {
                return callback(null, true);
            }

            return callback(null, false);
        }
    })
);
app.use(express.json());

// Upload harus sebelum static root
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// ALIAS URL LAMA
// ==========================================
// File sudah dipindah ke struktur baru, tetapi alamat yang
// diketik browser tetap sama. Alias ini dipasang sebelum
// static root agar URL lama tetap menemukan file.
const frontendRoot = path.join(__dirname, "..", "Frontend");

app.use("/js", express.static(path.join(frontendRoot, "shared", "js")));
app.use("/images", express.static(path.join(frontendRoot, "assets", "images")));

const pagesStatic = express.static(path.join(frontendRoot, "pages"));
app.use("/html%20dan%20css", pagesStatic);
app.use("/html dan css", pagesStatic);

// Frontend dilayankan dari satu alamat yang sama
app.use(express.static(frontendRoot));

// Urutan mount mengikuti urutan endpoint di server.js sebelumnya
// Path di setiap router sudah ditulis lengkap (/api/...),
// jadi router dipasang di root tanpa prefix tambahan.
app.use(require("./routes/system"));
app.use(require("./routes/bookings"));
app.use(require("./routes/auth"));
app.use(require("./routes/admin/customers"));
app.use(require("./routes/admin/workers"));
app.use(require("./routes/services"));
app.use(require("./routes/admin/services"));
app.use(require("./routes/profile"));
app.use(require("./routes/admin/addons"));
app.use(require("./routes/addons"));
app.use(require("./routes/admin/dashboard"));

module.exports = app;
