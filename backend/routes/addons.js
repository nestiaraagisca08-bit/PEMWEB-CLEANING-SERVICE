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

router.get("/api/addons", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                a.id,
                a.name,
                a.price,
                a.description,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id', s.id,
                            'name', s.name
                        )
                    ) FILTER (WHERE s.id IS NOT NULL),
                    '[]'
                ) AS services
            FROM addons a
            LEFT JOIN service_addons sa ON sa.addon_id = a.id
            LEFT JOIN services s ON s.id = sa.service_id
            WHERE a.is_active = TRUE
            GROUP BY a.id
            ORDER BY a.id
        `);

        res.json({
            success: true,
            addons: result.rows
        });

    } catch (error) {
        console.error("Gagal mengambil add-on customer:", error);
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data add-on"
        });
    }
});

module.exports = router;
