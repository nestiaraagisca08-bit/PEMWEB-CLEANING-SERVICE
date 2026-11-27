// ==========================================
// KONFIGURASI API PUSAT
// ==========================================
// Semua halaman memakai satu alamat backend.
// Bisa ditimpa sebelum file ini dimuat dengan:
//   window.GRIYA_API_BASE = "https://alamat-backend";
(function () {
    const isFile = window.location.protocol === "file:";

    const base =
        window.GRIYA_API_BASE ||
        (isFile ? "http://localhost:3000" : window.location.origin);

    window.API_BASE = base;
    window.API_URL = base;
})();
