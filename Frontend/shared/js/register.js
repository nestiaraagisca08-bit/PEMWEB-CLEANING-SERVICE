const API_URL = window.API_URL;

// GANTI dengan Client ID yang sama seperti login.js
const GOOGLE_CLIENT_ID = "312360754155-ub7nf17c1p6vo9n69dsjaoj5odrucval.apps.googleusercontent.com";

const form = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const registerBtn = document.getElementById("registerBtn");
const registerMessage = document.getElementById("registerMessage");

function showError(input, errorId, message) {
  input.classList.toggle("invalid", Boolean(message));
  document.getElementById(errorId).textContent = message;
}

function clearErrors() {
  showError(nameInput, "nameError", "");
  showError(emailInput, "emailError", "");
  showError(passwordInput, "passwordError", "");
  showError(confirmPasswordInput, "confirmPasswordError", "");

  registerMessage.textContent = "";
  registerMessage.style.color = "";
}

function validateForm() {
  clearErrors();

  let valid = true;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!name) {
    showError(nameInput, "nameError", "Nama lengkap wajib diisi.");
    valid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    showError(emailInput, "emailError", "Email wajib diisi.");
    valid = false;
  } else if (!emailPattern.test(email)) {
    showError(emailInput, "emailError", "Format email tidak valid.");
    valid = false;
  }

  if (!password) {
    showError(passwordInput, "passwordError", "Password wajib diisi.");
    valid = false;
  } else if (password.length < 8) {
    showError(passwordInput, "passwordError", "Password minimal 8 karakter.");
    valid = false;
  }

  if (!confirmPassword) {
    showError(
      confirmPasswordInput,
      "confirmPasswordError",
      "Konfirmasi password wajib diisi."
    );
    valid = false;
  } else if (password !== confirmPassword) {
    showError(
      confirmPasswordInput,
      "confirmPasswordError",
      "Password tidak cocok."
    );
    valid = false;
  }

  return valid;
}

// REGISTRASI EMAIL
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) return;

  registerBtn.disabled = true;
  registerBtn.textContent = "Memproses...";
  registerMessage.textContent = "";

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Pendaftaran gagal.");
    }

    registerMessage.style.color = "#2e7d32";
    registerMessage.textContent =
      result.message || "Registrasi berhasil.";

    if (result.token && result.user) {
      sessionStorage.setItem("token", result.token);
      sessionStorage.setItem(
        "griyaresikUser",
        JSON.stringify(result.user)
      );

      window.location.href = "Beranda after login.html";
    } else {
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    }

  } catch (error) {
    console.error("Kesalahan registrasi:", error);

    registerMessage.style.color = "#c0392b";
    registerMessage.textContent =
      error instanceof TypeError
        ? "Tidak dapat terhubung ke server. Periksa backend."
        : error.message;

  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = "Daftar Sekarang";
  }
});

// LOGIN / REGISTRASI GOOGLE
function handleGoogleRegister(response) {
  registerMessage.textContent = "Menghubungkan akun Google...";
  registerMessage.style.color = "#555";

  fetch(`${API_URL}/api/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      credential: response.credential
    })
  })
    .then(async (res) => {
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Registrasi Google gagal.");
      }

      if (!result.token || !result.user) {
        throw new Error("Backend tidak mengirim token atau data pengguna.");
      }

      sessionStorage.setItem("token", result.token);
      sessionStorage.setItem(
        "griyaresikUser",
        JSON.stringify(result.user)
      );

      registerMessage.style.color = "#2e7d32";
      registerMessage.textContent = "Berhasil masuk dengan Google.";

      window.location.href = "Beranda after login.html";
    })
    .catch((error) => {
      console.error("Google registration error:", error);

      registerMessage.style.color = "#c0392b";
      registerMessage.textContent = error.message;
    });
}

// TAMPILKAN TOMBOL GOOGLE
function initializeGoogleButton() {
  if (!window.google || !window.google.accounts) {
    setTimeout(initializeGoogleButton, 300);
    return;
  }

  if (
    !GOOGLE_CLIENT_ID ||
    GOOGLE_CLIENT_ID === "GANTI_DENGAN_GOOGLE_CLIENT_ID"
  ) {
    console.error("Google Client ID belum diisi.");
    registerMessage.textContent = "Konfigurasi Google belum lengkap.";
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleRegister
  });

  google.accounts.id.renderButton(
    document.getElementById("googleBtn"),
    {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "signup_with",
      width: 300
    }
  );
}

window.addEventListener("load", initializeGoogleButton);