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
} = require("../../context");

// ==========================================
// DATA CUSTOMER - ADMIN
// ==========================================

router.get(
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

module.exports = router;
