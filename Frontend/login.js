
const API_URL = "http://localhost:3000";

// GANTI dengan Client ID terbaru milikmu dari Google Cloud Console
const GOOGLE_CLIENT_ID ="312360754155-ub7nf17c1p6vo9n69dsjaoj5odrucval.apps.googleusercontent.com";

// Elemen HTML
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("identity");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("identityError");
const passwordError = document.getElementById("passwordError");
const submitBtn = document.getElementById("submitBtn");
const loginMessage = document.getElementById("loginMessage");

// Menampilkan pesan
function showMessage(element, message) {
  element.textContent = message;
}

// LOGIN EMAIL DAN PASSWORD
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  emailError.textContent = "";
  passwordError.textContent = "";
  loginMessage.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

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

  if (!password) {
    passwordError.textContent = "Password wajib diisi.";
    passwordInput.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses...";

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      passwordError.textContent =
        data.message || "Email atau password salah.";
      return;
    }

    sessionStorage.setItem(
      "griyaresikUser",
      JSON.stringify(data.user)
    );

    window.location.href = "index.html";
  } catch (error) {
    console.error("Login error:", error);
    showMessage(
      loginMessage,
      "Server tidak terhubung. Pastikan backend berjalan."
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Masuk ke Akun";
  }
});

// GOOGLE LOGIN
function initializeGoogleLogin() {
  if (!window.google?.accounts?.id) {
    setTimeout(initializeGoogleLogin, 300);
    return;
  }

  if (
    !GOOGLE_CLIENT_ID ||
    GOOGLE_CLIENT_ID === "TEMPEL_CLIENT_ID_KAMU"
  ) {
    showMessage(
      loginMessage,
      "Client ID Google belum diisi."
    );
    return;
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleLogin,
  });

  window.google.accounts.id.renderButton(
    document.getElementById("googleBtn"),
    {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: 300,
    }
  );
}

async function handleGoogleLogin(response) {
  loginMessage.textContent = "";

  try {
    const result = await fetch(`${API_URL}/api/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential: response.credential,
      }),
    });

    const data = await result.json();

    if (!result.ok) {
      showMessage(
        loginMessage,
        data.message || "Login Google gagal."
      );
      return;
    }

    sessionStorage.setItem(
      "griyaresikUser",
      JSON.stringify(data.user)
    );

    window.location.href = "index.html";
  } catch (error) {
    console.error("Google Login error:", error);
    showMessage(
      loginMessage,
      "Server tidak terhubung. Pastikan backend berjalan."
    );
  }
}

// Jalankan Google Login
initializeGoogleLogin();
