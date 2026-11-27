(() => {
    const label = document.querySelector("[data-account-name]");
    const logout = document.getElementById("logoutBtn");
    if (!label) return;

    const guestLabel = label.textContent.trim();

    function updateNavbar() {
        let user;

        try {
            user = JSON.parse(sessionStorage.getItem("griyaresikUser") || "null");
        } catch {
            user = null;
        }

        const email = typeof user?.email === "string" ? user.email.trim() : "";
        const signedIn = /^[^\s@]+@[^\s@]+$/.test(email);
        const name = typeof user?.name === "string" ? user.name.trim() : "";
        const emailName = email.split("@")[0].split("+")[0];
        const fallback = emailName.replace(/\d+$/, "") || emailName;

        label.textContent = signedIn ? name || fallback : guestLabel;
        if (logout) logout.hidden = !signedIn;
    }

    logout?.addEventListener("click", () => {
        sessionStorage.removeItem("griyaresikUser");
        sessionStorage.removeItem("token");
        window.location.replace("login.html");
    });

    window.addEventListener("pageshow", updateNavbar);
    updateNavbar();
})();