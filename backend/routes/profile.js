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
// PROFIL CUSTOMER
// ==========================================

// ==========================================
// PROFIL CUSTOMER
// ==========================================

// GET PROFIL PENGGUNA
router.get("/api/profile", verifyToken, async (req, res) => {
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
router.put(
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

module.exports = router;
