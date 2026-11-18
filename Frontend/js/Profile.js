(() => {
  "use strict";

  const KEY = "griyaResikProfile";
  const MAX_PHOTO = 2 * 1024 * 1024;

  const $ = id => document.getElementById(id);

  let saved = null;
  let photo = "";
  let photoVersion = 0;
  let processingPhoto = false;

  const text = value =>
    typeof value === "string" ? value.trim() : "";

  function phoneDigits(value) {
    let digits = value.replace(/[^0-9]/g, "");

    if (digits.startsWith("62")) {
      digits = digits.slice(2);
    } else if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    return /^8\d{8,12}$/.test(digits) ? digits : "";
  }

  function feedback(message, error = false) {
    $("profileFeedback").textContent = message;
    $("profileFeedback").classList.toggle("error", error);
  }

  function getSaved() {
    try {
      const item = JSON.parse(
        localStorage.getItem(KEY) || "null"
      );

      return item &&
        typeof item === "object" &&
        !Array.isArray(item)
          ? item
          : null;
    } catch {
      return null;
    }
  }

  function showPhoto(value) {
    photo = /^data:image\/(jpeg|png|webp);base64,/i.test(value)
      ? value
      : "";

    $("profilePreview").hidden = !photo;
    $("avatarPlaceholder").toggleAttribute("hidden", !!photo);

    if (photo) {
      $("profilePreview").src = photo;
    } else {
      $("profilePreview").removeAttribute("src");
    }
  }

  function restore() {
    photoVersion++;
    processingPhoto = false;
    $("saveProfile").disabled = false;

    saved = getSaved();

    $("profileName").value = text(saved?.name);
    $("profileEmail").value = text(saved?.email);
    $("profilePhone").value = text(saved?.phone);

    showPhoto(text(saved?.photoDataUrl));

    $("profilePhoto").value = "";
    $("profilePhone").setCustomValidity("");
    $("profilePhone").removeAttribute("aria-invalid");

    $("phoneFeedback").textContent = "";
    $("photoFeedback").textContent = "";
  }

  function validate() {
    $("profileName").value = $("profileName").value.trim();
    $("profileEmail").value = $("profileEmail").value.trim();
    $("profilePhone").value = $("profilePhone").value.trim();

    const validPhone = !!phoneDigits(
      $("profilePhone").value
    );

    const message = validPhone
      ? ""
      : "Masukkan nomor Indonesia yang valid, misalnya 08129843210 atau +628129843210.";

    $("profilePhone").setCustomValidity(message);

    $("profilePhone").setAttribute(
      "aria-invalid",
      String(!validPhone)
    );

    $("phoneFeedback").textContent = message;

    return $("profileForm").reportValidity();
  }

  $("profilePhone").addEventListener("input", () => {
  const input = $("profilePhone");

  // Hanya izinkan angka 0–9, termasuk saat paste.
  input.value = input.value.replace(/[^0-9]/g, "");

  input.setCustomValidity("");
  input.removeAttribute("aria-invalid");
  $("phoneFeedback").textContent = "";
});

  // PILIH DAN PRATINJAU FOTO
  $("profilePhoto").addEventListener("change", async () => {
    const file = $("profilePhoto").files[0];

    if (!file) return;

    const version = ++photoVersion;

    processingPhoto = false;
    $("saveProfile").disabled = false;
    $("photoFeedback").textContent = "";

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (
      !allowedTypes.includes(file.type) ||
      file.size > MAX_PHOTO
    ) {
      $("photoFeedback").textContent =
        "Gunakan JPG, PNG, atau WEBP dengan ukuran maksimal 2MB.";

      $("profilePhoto").value = "";
      return;
    }

    processingPhoto = true;
    $("saveProfile").disabled = true;

    const url = URL.createObjectURL(file);

    try {
      const image = new Image();
      image.src = url;

      await image.decode();

      if (version !== photoVersion) return;

      // Perkecil foto agar lebih ringan disimpan di browser.
      const scale = Math.min(
        1,
        640 / Math.max(
          image.naturalWidth,
          image.naturalHeight
        )
      );

      const canvas = document.createElement("canvas");

      canvas.width = Math.max(
        1,
        Math.round(image.naturalWidth * scale)
      );

      canvas.height = Math.max(
        1,
        Math.round(image.naturalHeight * scale)
      );

      const context = canvas.getContext("2d");

      context.fillStyle = "#ffffff";
      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      showPhoto(
        canvas.toDataURL("image/jpeg", 0.85)
      );

      $("photoFeedback").textContent =
        "Foto siap. Klik Simpan Perubahan untuk menyimpannya.";
    } catch {
      if (version === photoVersion) {
        $("photoFeedback").textContent =
          "Foto tidak dapat dibaca. Pilih gambar lain.";
      }
    } finally {
      URL.revokeObjectURL(url);

      if (version === photoVersion) {
        processingPhoto = false;
        $("saveProfile").disabled = false;
      }

      $("profilePhoto").value = "";
    }
  });

  // SIMPAN PROFIL
  $("profileForm").addEventListener("submit", event => {
    event.preventDefault();

    if (processingPhoto || !validate()) return;

    const profile = {
      version: 1,
      name: $("profileName").value,
      email: $("profileEmail").value,
      phone: $("profilePhone").value,
      photoDataUrl: photo,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(profile)
      );

      saved = profile;

      feedback(
        "Profil tersimpan. Data siap disalin untuk booking."
      );

      $("photoFeedback").textContent = "";

      alert("profil berhasil disimpan");
    } catch {
      feedback(
        "Profil belum tersimpan. Penyimpanan browser tidak tersedia atau penuh. Coba gunakan foto yang lebih kecil.",
        true
      );
    }
  });

  // BATAL: KEMBALIKAN DATA TERAKHIR YANG TERSIMPAN
  $("cancelProfile").addEventListener("click", () => {
    restore();

    feedback(
      "Perubahan dibatalkan. Form kembali ke profil terakhir yang tersimpan."
    );
  });

  async function copyText(value) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // Gunakan metode cadangan di bawah.
    }

    const field = document.createElement("textarea");
    field.value = value;

    field.style.cssText =
      "position:fixed;left:-9999px;top:0;";

    document.body.append(field);
    field.select();

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    field.remove();
    $("copyProfile").focus();

    return copied;
  }

  // SALIN DATA PROFIL UNTUK BOOKING
  $("copyProfile").addEventListener("click", async () => {
    if (
      !saved ||
      !text(saved.name) ||
      !text(saved.email) ||
      !phoneDigits(text(saved.phone))
    ) {
      feedback(
        "Isi profil lalu klik Simpan Perubahan terlebih dahulu.",
        true
      );
      return;
    }

    const unsavedChanges =
      saved.name !== $("profileName").value.trim() ||
      saved.email !== $("profileEmail").value.trim() ||
      saved.phone !== $("profilePhone").value.trim() ||
      photo !== text(saved.photoDataUrl);

    if (unsavedChanges) {
      feedback(
        "Ada perubahan yang belum disimpan. Klik Simpan Perubahan sebelum menyalin profil.",
        true
      );
      return;
    }

    // Foto tidak disalin karena input booking memakai data kontak.
    const payload = JSON.stringify(
      {
        format: "griyaresik-profile",
        version: 1,
        name: saved.name,
        email: saved.email,
        phone: saved.phone
      },
      null,
      2
    );

    const copied = await copyText(payload);

    feedback(
      copied
        ? "Data profil berhasil disalin. Buka Booking lalu tempel di kolom Nama Lengkap Pemesan."
        : "Data belum berhasil disalin. Izinkan akses clipboard atau buka website melalui localhost/HTTPS.",
      !copied
    );
  });

  restore();
})();