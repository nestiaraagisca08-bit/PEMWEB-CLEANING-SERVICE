// ==========================================
// KONFIGURASI PUBLIK DARI BACKEND
// ==========================================
// Semua nilai di sini boleh dikirim ke browser.
// Nilai rahasia seperti JWT_SECRET tidak pernah dimuat dari sini.
(function () {
    "use strict";

    // Fallback dipakai hanya jika /api/config belum bisa diakses.
    const FALLBACK_GOOGLE_CLIENT_ID =
        "312360754155-ub7nf17c1p6vo9n69dsjaoj5odrucval.apps.googleusercontent.com";

    let config = {
        appName: "GriyaResik",
        googleClientId: FALLBACK_GOOGLE_CLIENT_ID
    };

    let resolveReady;

    const ready = new Promise(resolve => {
        resolveReady = resolve;
    });

    async function load() {
        try {
            const response = await fetch(
                window.API_URL + "/api/config"
            );

            if (response.ok) {
                const payload = await response.json();

                if (payload.googleClientId) {
                    config.googleClientId = payload.googleClientId;
                }

                if (payload.appName) {
                    config.appName = payload.appName;
                }
            }
        } catch (error) {
            console.warn(
                "Konfigurasi publik gagal dimuat, memakai nilai fallback.",
                error
            );
        }

        resolveReady(config);
        return config;
    }

    window.GriyaConfig = {
        ready,
        load,
        get googleClientId() {
            return config.googleClientId;
        },
        get appName() {
            return config.appName;
        }
    };

    load();
})();
