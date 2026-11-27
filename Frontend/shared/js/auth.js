// ==========================================
// GUARD LOGIN & ROLE (DIPAKAI BERSAMA)
// ==========================================
// Pakai:
//   const user = window.GriyaAuth.require({
//       role: "admin",
//       loginUrl: "login.html",
//       homeUrl: "Beranda after login.html"
//   });
(function () {
    "use strict";

    function normalizeRole(role) {
        return String(role || "").trim().toLowerCase();
    }

    function getToken() {
        return sessionStorage.getItem("token");
    }

    function getUser() {
        try {
            const raw = sessionStorage.getItem("griyaresikUser");
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function clearSession() {
        sessionStorage.removeItem("griyaresikUser");
        sessionStorage.removeItem("token");
    }

    function requireAuth(options) {
        const config = Object.assign(
            {
                role: null,
                loginUrl: "login.html",
                homeUrl: "Beranda after login.html"
            },
            options || {}
        );

        const token = getToken();
        const user = getUser();

        if (!token || !user) {
            clearSession();
            window.location.replace(config.loginUrl);
            return null;
        }

        if (
            config.role &&
            normalizeRole(user.role) !== normalizeRole(config.role)
        ) {
            window.location.replace(config.homeUrl);
            return null;
        }

        const current = {
            user,
            token,
            role: normalizeRole(user.role)
        };

        window.GriyaAuth.current = current;
        return user;
    }

    window.GriyaAuth = {
        require: requireAuth,
        getUser,
        getToken,
        normalizeRole,
        clearSession,
        current: null
    };
})();
