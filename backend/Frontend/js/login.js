
// ==========================================
// KONFIGURASI
// ==========================================

const API_URL = "http://localhost:3000";

const GOOGLE_CLIENT_ID =
    "312360754155-ub7nf17c1p6vo9n69dsjaoj5odrucval.apps.googleusercontent.com";


// ==========================================
// ELEMEN HTML
// ==========================================

const form = document.getElementById("loginForm");

const emailInput = document.getElementById("identity");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("identityError");
const passwordError = document.getElementById("passwordError");

const submitBtn = document.getElementById("submitBtn");
const loginMessage = document.getElementById("loginMessage");

console.log("Form login ditemukan:", form);


// ==========================================
// MENAMPILKAN PESAN
// ==========================================

function showMessage(element, message) {
    if (element) {
        element.textContent = message;
    }
}


// ==========================================
// REDIRECT BERDASARKAN ROLE
// ==========================================

function redirectByRole(user) {

    if (!user || !user.role) {
        showMessage(
            loginMessage,
            "Role akun tidak ditemukan. Silakan hubungi admin."
        );
        return;
    }

    if (user.role === "admin") {

        window.location.href = "dashboard_admin.html";

    } else if (user.role === "customer") {

        window.location.href = "Beranda after login.html";

    } else if (user.role === "staff") {

        showMessage(
            loginMessage,
            "Halaman petugas belum tersedia."
        );

    } else {

        showMessage(
            loginMessage,
            "Role akun tidak dikenali."
        );

    }
}


// ==========================================
// MENYIMPAN DATA LOGIN
// ==========================================

function saveLoginData(data) {

    console.log("Respons login dari backend:", {
        keys: Object.keys(data || {}),
        hasToken: !!data?.token,
        hasUser: !!data?.user
    });

    if (!data || !data.token || !data.user) {
        throw new Error(
            "Backend belum mengirim token atau data pengguna dengan benar."
        );
    }

    // Simpan JWT Token
    sessionStorage.setItem("token", data.token);

    // Simpan informasi pengguna
    sessionStorage.setItem(
        "griyaresikUser",
        JSON.stringify(data.user)
    );

    console.log("Token dan data pengguna berhasil disimpan.");

}


// ==========================================
// LOGIN EMAIL DAN PASSWORD
// ==========================================

form?.addEventListener("submit", async (event) => {

    event.preventDefault();

    emailError.textContent = "";
    passwordError.textContent = "";
    loginMessage.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validasi email
    if (!email) {

        emailError.textContent = "Email wajib diisi.";
        emailInput.focus();
        return;

    }

    if (!emailInput.validity.valid) {

        emailError.textContent = "Format email tidak valid.";
        emailInput.focus();
        return;

    }

    // Validasi password
    if (!password) {

        passwordError.textContent = "Password wajib diisi.";
        passwordInput.focus();
        return;

    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Memproses...";

    try {

        const response = await fetch(
            `${API_URL}/api/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        // Debug respons login email
        console.log("HASIL EMAIL LOGIN:", {
            status: response.status,
            keys: Object.keys(data || {}),
            hasToken: !!data?.token,
            hasUser: !!data?.user,
            message: data?.message
        });

        if (!response.ok) {

            passwordError.textContent =
                data.message || "Email atau password salah.";

            return;

        }

        // Simpan token dan data pengguna
        saveLoginData(data);

        // Redirect sesuai role
        redirectByRole(data.user);

    } catch (error) {

        console.error("Login email error:", error);

        showMessage(
            loginMessage,
            error.message || "Server tidak terhubung."
        );

    } finally {

        submitBtn.disabled = false;
        submitBtn.textContent = "Masuk ke Akun";

    }

});


// ==========================================
// GOOGLE LOGIN
// ==========================================

function initializeGoogleLogin() {

    if (!window.google?.accounts?.id) {

        setTimeout(initializeGoogleLogin, 300);
        return;

    }

    if (!GOOGLE_CLIENT_ID) {

        showMessage(
            loginMessage,
            "Client ID Google belum diisi."
        );

        return;

    }

    window.google.accounts.id.initialize({

        client_id: GOOGLE_CLIENT_ID,

        callback: handleGoogleLogin

    });

    const googleButton = document.getElementById("googleBtn");

    if (!googleButton) {

        console.error("Elemen googleBtn tidak ditemukan.");
        return;

    }

    window.google.accounts.id.renderButton(

        googleButton,

        {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 300
        }

    );

    console.log("Google Login berhasil diinisialisasi.");

}


// ==========================================
// PROSES GOOGLE LOGIN
// ==========================================

async function handleGoogleLogin(googleResponse) {

    loginMessage.textContent = "";

    try {

        const result = await fetch(
            `${API_URL}/api/auth/google`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    credential: googleResponse.credential
                })
            }
        );

        const data = await result.json();

        // Debug respons Google Login
        console.log("HASIL GOOGLE LOGIN:", {
            status: result.status,
            keys: Object.keys(data || {}),
            hasToken: !!data?.token,
            hasUser: !!data?.user,
            message: data?.message
        });

        if (!result.ok) {

            showMessage(
                loginMessage,
                data.message || "Login Google gagal."
            );

            return;

        }

        // Simpan token dan data pengguna
        saveLoginData(data);

        // Redirect sesuai role
        redirectByRole(data.user);

    } catch (error) {

        console.error("Google Login error:", error);

        showMessage(
            loginMessage,
            error.message || "Server tidak terhubung."
        );

    }

}


// ==========================================
// JALANKAN GOOGLE LOGIN
// ==========================================
initializeGoogleLogin();
