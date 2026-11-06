const jwt = require("jsonwebtoken");

// Memeriksa token login
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Silakan login terlebih dahulu."
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET belum dikonfigurasi.");

        return res.status(500).json({
            message: "Konfigurasi autentikasi server belum tersedia."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Token tidak valid atau sudah kedaluwarsa."
        });
    }
}

// Memeriksa role admin
function verifyAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Akses khusus administrator."
        });
    }

    next();
}

module.exports = {
    verifyToken,
    verifyAdmin
};