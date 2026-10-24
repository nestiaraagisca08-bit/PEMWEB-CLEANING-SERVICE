
const API_URL = "http://localhost:3000";

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
    showError(
      passwordInput,
      "passwordError",
      "Password minimal 8 karakter."
    );
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

    // Jika backend mengembalikan data pengguna,
    // simpan sesi lalu masuk ke beranda setelah login.
    if (result.user) {
      sessionStorage.setItem(
        "griyaresikUser",
        JSON.stringify(result.user)
      );

      window.location.href = "Beranda after login.html";
    } else {
      // Jika backend hanya mengembalikan pesan sukses,
      // pengguna perlu login terlebih dahulu.
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    }

  } catch (error) {
    console.error("Kesalahan registrasi:", error);

    registerMessage.style.color = "#c0392b";

    if (error instanceof TypeError) {
      registerMessage.textContent =
        "Tidak dapat terhubung ke server. Periksa backend dan koneksi API.";
    } else {
      registerMessage.textContent = error.message;
    }
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = "Daftar Sekarang";
  }
});
