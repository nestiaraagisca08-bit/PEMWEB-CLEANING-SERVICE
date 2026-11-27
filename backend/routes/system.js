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
// TES SERVER
// ==========================================

router.get("/", (req, res) => {
    res.redirect("/html%20dan%20css/Beranda%20before%20login.html");
});

router.get("/health", (req, res) => {
    res.json({
        message: "Backend GriyaResik berjalan."
    });
});

// ==========================================
// TES DATABASE
// ==========================================

router.get("/test-db", async (req, res) => {
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

module.exports = router;
