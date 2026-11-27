const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const multer = require("multer");
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
function validateAddon(data) {
    const {
        name,
        price,
        description,
        services
    } = data;

    if (
        typeof name !== "string" ||
        !name.trim()
    ) {
        return "Nama add-on wajib diisi.";
    }

    if (name.trim().length > 100) {
        return "Nama add-on maksimal 100 karakter.";
    }

    if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0
    ) {
        return "Harga add-on tidak valid.";
    }

    if (
        description !== undefined &&
        typeof description !== "string"
    ) {
        return "Deskripsi add-on tidak valid.";
    }

    if (
        !Array.isArray(services) ||
        services.length === 0
    ) {
        return "Pilih minimal satu layanan.";
    }

    if (
        services.some(
            serviceId =>
                !Number.isInteger(Number(serviceId)) ||
                Number(serviceId) <= 0
        )
    ) {
        return "ID layanan tidak valid.";
    }

    return null;
}

module.exports = {
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
  validateAddon,
  profileUploadDir
};
