(() => {
  "use strict";

  const BOOKINGS = "griyaResikBookings";
  const REVIEWS = "griyaResikReviews";
  const TIMES = "griyaResikStep5Demo";
  const PAYMENT = "griyaResikPaymentDemo";

  const CS = "62881026380060";
  const ZONE = "Asia/Jakarta";

  const $ = id => document.getElementById(id);

  const clean = value =>
    typeof value === "string" || typeof value === "number"
      ? String(value).trim()
      : "";

  const normalize = value =>
    clean(value).replace(/^#+/, "").toUpperCase();

  const put = (id, value) => {
    $(id).textContent = clean(value) || "—";
  };

  const node = (tag, value, cls) => {
    const el = document.createElement(tag);
    if (value !== undefined) el.textContent = clean(value);
    if (cls) el.className = cls;
    return el;
  };

  const date = value => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const number = value =>
    value !== null &&
    value !== undefined &&
    value !== "" &&
    typeof value !== "boolean" &&
    Number.isFinite(Number(value)) &&
    Number(value) >= 0
      ? Number(value)
      : null;

  const money = value =>
    value === null
      ? "—"
      : "Rp " + new Intl.NumberFormat("id-ID").format(value);

  const time = value => {
    const d = date(value);
    return d
      ? new Intl.DateTimeFormat("id-ID", {
          timeZone: ZONE,
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23"
        }).format(d).replace(/\./g, ":") + " WIB"
      : "Waktu belum tercatat";
  };

  const stamp = value => {
    const d = date(value);
    return d
      ? new Intl.DateTimeFormat("id-ID", {
          timeZone: ZONE,
          day: "numeric",
          month: "short"
        }).format(d) + ", " + time(d)
      : "Belum tercatat";
  };

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function recordStore(key) {
    const value = read(key, {});
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function entry(store, id) {
    return Object.hasOwn(store, id) &&
      store[id] &&
      typeof store[id] === "object"
        ? store[id]
        : {};
  }

  function assign(store, id, value) {
    Object.defineProperty(store, id, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  }

  function svg(name, cls = "icon") {
    const s = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

    const use = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "use"
    );

    s.setAttribute("class", cls);
    s.setAttribute("aria-hidden", "true");
    use.setAttribute("href", "#i-" + name);
    s.append(use);

    return s;
  }

  // Data contoh hanya digunakan saat belum ada booking tersimpan.
  const example = {
    id: "GR-2025-0894",
    customerName: "Dr. Hendra Wijaya",
    phone: "+62 812-8877-6521",
    address: "Jl. Raya Darmo No. 48, RT 004 / RW 002, Kel. Darmo",
    district: "Wonokromo",
    region: "Surabaya Selatan",
    landmark:
      "Pagar hitam depan Taman Bungkul, samping minimarket, pos gerbang 1.",
    room: "Kamar Tidur Utama + Ruang Tamu",
    package: "Deep",
    serviceDescription:
      "Pembersihan menyeluruh sesuai paket dan area pesanan.",
    date: "2026-11-16",
    time: "09:00",
    payment: "QRIS Instant Pay",
    basePrice: 80000,
    addonItems: [
      { name: "Vacuum Disinfektan", price: 35000 }
    ],
    price: 115000,
    createdAt: "2026-11-16T07:35:00+07:00"
  };

  let selected;
  let sample = false;
  let demo;
  let payment;
  let bill;
  let roomNames = [];
  let rating = 5;
  let tipChoice = "20000";

  const volatileTimes = Object.create(null);
  const volatilePayments = Object.create(null);

  // Menggunakan gambar contoh dari file prototipe.
  const photos = [
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_IB-uqN5W71F0dGG0FUc4yGans3iD0zeXQklfbn6fz8bHVdbdZJJE8nCG1scNRsY1hK9pIa6HrdGhN8mGK6uBVo7c9mXhS0hP2ZvNbn21dlYJC19QcRnjBqCFI47rIIKvni9omayBxAL0rftsPyg2NrdLoAUXIND40YN5zLqqr2_xSC-fhwU65kZcP0SFRvSrl4QHawfG_QsnwPTeg8XpKnpGCYTw0GzC65IitYQ",
      label: "Mitra simulasi"
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSNSOaJ1Zxwz_CLsL5bBzdgguEYdDsD2kemBtV4X0wffvrJwdl1_0sL6Le81wrApPPCmJZ20v5pqy_erzAZj-qmskwfrqfrlidpwcZaPqMBUeByF-0pduzRvWCPCWQPMfF_u1M7hvN2ULjN8Uc-kzHdT-gHecHDfdfeV8C_4YIBIxH5fReDvR4c5qTO2q1G-vrS168aIzBBeOnBENsehLNkjxM4qQZa2QL-5YZP8U",
      label: "Kamar Tidur (Final)"
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYAdHjdN1W0feoOkAC7nPc2hBHKifzZbCpPtm2fY1eW3oHeQOBew74yENpzK_UMpc2ahUQaH3PwRrHyIwd_RHOOxin0C0O2OzWuGOaszNFlRZ0TJoe44cRvSgEnOLh-CsSIf21umPbUp3PT7MTPZ9lIgnOwJGm59xHDDBN7VG0G1nHYcIJBScSX8T5XjgDluMoeMFfTP4HgqGrkcmYi0JwKBvD-9vJoJxmmrjZSFI",
      label: "Ruang Tamu & Sofa"
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQtRng9CJJZGIERLFa196VoFZShwL-Zr7YLioshFzGAYS-nJVPY_iFaVVVjRXuAXlKijOvUPnsQ4qkGc3tT4Pg5jfCp8Sz48OEM_IqSAFrfQQY2bbbyf4wiTKNoZJELuKQXm7VyuIba4buBg-Bz7nFwgIg9QBqm6vwlCZx2UxmpvNxJoD2aEgYRHEUmCV_U1cezzFARJvstSpzG6jQNhaXf21u-VLmmQkzJT342KM",
      label: "Sudut & Lis Jendela"
    },
    {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNyso_Xujui4agRJ_VDvLTSOtnMkNVeq-rb8AwZPbRszbO5H8QEysjKLF-711K0thL0nzTvzshrvuIbnT31s_gY9OpQ8nIcnVm2oueHlGufqXAG82gnt429tTebD5nm-iKXy4wZUOFBt5M-AhzcO9As5POsl0l-UXcQ4KUq36Ij27oseSNrWdzZ7Km7wJGejT1TwCLJ0eD7YO36poOm-4HZDgIVTn7Kc80lLYYxRU",
      label: "Sterilisasi Kit"
    }
  ];

  function address(booking) {
    let result = clean(booking.address);

    [
      booking.district,
      booking.region,
      "Kota Surabaya",
      "Jawa Timur"
    ].filter(Boolean).forEach(part => {
      if (!result.toLowerCase().includes(String(part).toLowerCase())) {
        result += (result ? ", " : "") + part;
      }
    });

    return result;
  }

  function packageName() {
    const value = clean(selected.package);
    return /^(basic|standard|deep)$/i.test(value)
      ? value + " Cleaning"
      : value || "Layanan kebersihan";
  }

  function appointment() {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(clean(selected.date))
      ? date(selected.date + "T12:00:00+07:00")
      : null;

    const day = d
      ? new Intl.DateTimeFormat("id-ID", {
          timeZone: ZONE,
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(d)
      : clean(selected.date) || "Tanggal belum tersedia";

    const hour = clean(selected.time)
      ? clean(selected.time).replace(/\s*WIB$/i, "") + " WIB"
      : "Jam belum tersedia";

    return day + " – " + hour;
  }

  function getTimes() {
    const id = normalize(selected.id);
    const store = recordStore(TIMES);
    const saved = entry(store, id);

    const fromStep4 = entry(
      recordStore("griyaResikStep4Demo"),
      id
    );

    const match = clean(selected.time).match(
      /^(\d{1,2}):(\d{2})/
    );

    const scheduled =
      /^\d{4}-\d{2}-\d{2}$/.test(clean(selected.date)) && match
        ? date(
            selected.date +
            "T" +
            match[1].padStart(2, "0") +
            ":" +
            match[2] +
            ":00+07:00"
          )
        : null;

    const started =
      date(saved.startedAt) ||
      date(volatileTimes[id]?.startedAt) ||
      date(fromStep4.startedAt) ||
      scheduled ||
      new Date();

    const completed =
      date(saved.completedAt) ||
      date(volatileTimes[id]?.completedAt) ||
      new Date(started.getTime() + 155 * 60000);

    const value = {
      startedAt: started.toISOString(),
      completedAt: completed.toISOString()
    };

    volatileTimes[id] = value;
    assign(store, id, value);
    write(TIMES, store);

    return value;
  }

  function getPayment() {
    const id = normalize(selected.id);
    const store = recordStore(PAYMENT);
    const saved = entry(store, id);

    let legacy;

    try {
      legacy = localStorage.getItem(
        "griyaResikTransactionPreview:" + selected.id
      );
    } catch {
      // Gunakan waktu cadangan.
    }

    const verified =
      date(saved.verifiedAt) ||
      date(volatilePayments[id]?.verifiedAt) ||
      date(legacy) ||
      new Date(
        (
          date(selected.createdAt)?.getTime() ||
          new Date(demo.startedAt).getTime() - 85 * 60000
        ) + 5 * 60000
      );

    const method =
      clean(selected.payment) || "Metode belum dipilih";

    const result = {
      status: "Lunas",
      verifiedAt: verified.toISOString(),
      transactionId:
        "DEMO-" + method.replace(/\s+/g, "-") + "-" + id
    };

    volatilePayments[id] = result;
    assign(store, id, result);
    write(PAYMENT, store);

    return { ...result, method };
  }

  function totals() {
    const items = Array.isArray(selected.addonItems)
      ? selected.addonItems
          .filter(item => item && clean(item.name))
          .map(item => ({
            name: clean(item.name),
            price: number(item.price)
          }))
      : [];

    if (Array.isArray(selected.addons)) {
      selected.addons.forEach(item => {
        const name = clean(
          typeof item === "object" ? item?.name : item
        );

        const exists = items.some(
          saved => saved.name.toLowerCase() === name.toLowerCase()
        );

        if (name && !exists) {
          items.push({
            name,
            price:
              typeof item === "object"
                ? number(item.price)
                : null
          });
        }
      });
    }

    const sum =
      number(selected.addonTotal) ??
      (
        items.every(item => item.price !== null)
          ? items.reduce((total, item) => total + item.price, 0)
          : null
      );

    let total =
      number(selected.price) ??
      number(selected.subtotal);

    let base = number(selected.basePrice);

    if (total === null && base !== null && sum !== null) {
      total = base + sum;
    }

    if (
      base === null &&
      total !== null &&
      sum !== null &&
      total >= sum
    ) {
      base = total - sum;
    }

    return { items, total, base };
  }

  function billRow(container, title, description, price) {
    const row = node("div", undefined, "bill-line");
    const copy = node("div");

    copy.append(
      node("strong", title),
      node("p", description)
    );

    row.append(copy, node("b", money(price)));
    container.append(row);
  }

  function renderSummary() {
    put("orderCode", "#" + normalize(selected.id));
    put("orderStatus", "Selesai & Review · Simulasi");
    put("serviceType", packageName());
    put("arrivalDate", appointment());
    put("packageName", packageName());

    put(
      "roomName",
      "1× " + (roomNames.join(" + ") || "Area pesanan")
    );

    put("districtName", selected.district || selected.region);
    put("addressShort", selected.address);
    put("lastUpdated", time(demo.completedAt));

    const start = new Date(demo.startedAt).getTime();

    const labels = [
      "Pesanan Dibuat",
      "Dikonfirmasi",
      "Menuju Lokasi",
      "Pengerjaan",
      "Selesai & Review"
    ];

    const times = [
      selected.createdAt,
      new Date(start - 75 * 60000),
      new Date(start - 30 * 60000),
      demo.startedAt,
      demo.completedAt
    ];

    $("serviceSteps").replaceChildren();
    $("serviceSteps").classList.add("is-complete");

    labels.forEach((label, index) => {
      const li = node(
        "li",
        undefined,
        index === 4 ? "current" : "done"
      );

      const dot = node("span", undefined, "s5-dot");
      dot.append(svg("check", "s5-icon"));

      li.append(
        dot,
        node("strong", label),
        node(
          "small",
          time(times[index]) + (index === 4 ? " (Selesai)" : "")
        )
      );

      if (index === 4) {
        li.setAttribute("aria-current", "step");
      }

      $("serviceSteps").append(li);
    });

    put("workDuration", "2 Jam 35 Menit · Demo");
    }

    function renderSidebar() {
    put("customerName", selected.customerName);
    put("customerPhone", selected.phone);
    put("customerAddress", address(selected));

    put(
      "customerLandmark",
      selected.landmark || "Tidak ada patokan tambahan."
    );

    $("mapLink").href =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(address(selected));

    put("paymentBadge", "LUNAS (" + payment.method + ")");

    $("billItems").replaceChildren();

    billRow(
      $("billItems"),
      "1× " +
      (roomNames.join(" + ") || "Layanan") +
      " — " +
      packageName(),
      clean(selected.serviceDescription),
      bill.base
    );

    bill.items.forEach(item => {
      billRow(
        $("billItems"),
        item.name,
        "Add-on pilihan pelanggan",
        item.price
      );
    });

    put("discountAmount", "- Rp. 0");
    put("billTotal", money(bill.total));
    put("transactionTimeLabel", "Waktu Transaksi (Simulasi)");
    put("paymentTimestamp", stamp(payment.verifiedAt));
    put("paymentMethod", "Metode: " + payment.method);
    put("paymentRef", "REF: " + payment.transactionId);

    put(
      "paymentNotice",
      "Pembayaran lunas dan waktu transaksi merupakan simulasi presentasi."
    );

    $("paymentNotice").hidden = false;

    const contact = message =>
      "https://wa.me/" +
      CS +
      "?text=" +
      encodeURIComponent(
        message + " Pesanan #" + normalize(selected.id) + "."
      );

    $("careLink").href = contact(
      "Halo GriyaResik, saya ingin konsultasi hasil layanan."
    );

    $("claimLink").href = contact(
      "Halo GriyaResik, saya ingin mengajukan permintaan Re-Clean."
    );

    put(
      "warrantyUntil",
      "Simulasi garansi sampai " +
      stamp(
        new Date(
          new Date(demo.completedAt).getTime() + 86400000
        )
      )
    );
  }

  function renderHistory() {
    const start = new Date(demo.startedAt).getTime();
    const at = minutes => new Date(start + minutes * 60000);

    const events = [
      [
        "Pengerjaan Selesai & Diserahterimakan",
        demo.completedAt,
        "Seluruh area pesanan telah dirapikan dan ditampilkan selesai. Pengecekan akhir dan serah terima ini merupakan simulasi."
      ],

      ...roomNames.map((name, index) => [
        "Area " + (index + 1) + " " + name + " Selesai Dibersihkan",
        at(
          Math.round(
            155 * (index + 1) / Math.max(1, roomNames.length)
          )
        ),
        "Pembersihan " +
        name +
        " sesuai paket " +
        packageName() +
        " ditampilkan selesai 100%."
      ]),

      [
        "Pengerjaan Dimulai di Lokasi",
        demo.startedAt,
        "Mitra Siti Rahmawati mulai membersihkan area sesuai paket dan catatan pelanggan."
      ],
      [
        "Mitra Tiba di Lokasi Hunian",
        at(-5),
        "Mitra tiba di " +
        address(selected) +
        " dan melakukan konfirmasi akses dengan pemesan."
      ],
      [
        "Mitra Berangkat Menuju Lokasi",
        at(-30),
        "Mitra membawa perlengkapan kebersihan menuju " +
        (clean(selected.district) || "alamat pelanggan") +
        "."
      ],
      [
        "Pesanan Dikonfirmasi & Mitra Ditugaskan",
        at(-75),
        "Sistem mengalokasikan mitra Siti Rahmawati beserta perlengkapan sanitasi. Penugasan ini masih simulasi."
      ],
      [
        "Pembayaran Terverifikasi Lunas",
        payment.verifiedAt,
        "Transaksi " +
        payment.method +
        " senilai " +
        money(bill.total) +
        " ditampilkan LUNAS untuk simulasi presentasi."
      ],
      [
        "Pesanan Berhasil Dibuat",
        selected.createdAt,
        "Pelanggan " +
        (clean(selected.customerName) || "pada pesanan ini") +
        " membuat pesanan untuk jadwal " +
        appointment() +
        "."
      ]
    ];

    $("activityList").replaceChildren();

    events.forEach(([title, when, message]) => {
      const li = node("li");
      const card = node("article", undefined, "h5-activity");
      const head = node("div", undefined, "h5-activity-top");
      const timestamp = node("time", time(when));

      if (date(when)) {
        timestamp.dateTime = date(when).toISOString();
      }

      head.append(node("h3", title), timestamp);
      card.append(head, node("p", message));

      if (title === "Pembayaran Terverifikasi Lunas") {
        card.append(
          node(
            "div",
            "▤ ID Transaksi: " + payment.transactionId,
            "h5-transaction"
          )
        );
      }

      li.append(card);
      $("activityList").append(li);
    });

    put("historyCount", events.length + " Entri Tuntas · Demo");
  }

  function updateRating() {
    document.querySelectorAll("[data-rating]").forEach(button => {
      const value = Number(button.dataset.rating);

      button.classList.toggle("filled", value <= rating);
      button.setAttribute(
        "aria-checked",
        String(value === rating)
      );

      button.tabIndex = value === (rating || 1) ? 0 : -1;
    });

    const labels = [
      "",
      "Perlu Ditingkatkan",
      "Kurang Memuaskan",
      "Cukup Memuaskan",
      "Memuaskan",
      "Sangat Memuaskan!"
    ];

    put(
    "ratingLabel",
    rating === 0
        ? "Pilih jumlah bintang"
        : labels[rating] + " (" + rating + ".0 / 5.0)"
  );
  }

  function setTip(choice) {
    tipChoice = choice;

    document.querySelectorAll("[data-tip]").forEach(button => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.tip === choice)
      );
    });

    $("customTip").hidden = choice !== "custom";
    $("customTip").required = choice === "custom";
  }

  function loadReview() {
    rating = 0;
    updateRating();

    document.querySelectorAll("[data-tag]").forEach(button => {
        button.setAttribute("aria-pressed", "false");
    });

    setTip("0");
    $("customTip").value = "";
    $("reviewMessage").value = "";
    $("reviewFeedback").textContent = "";

    put("submitReview", "Kirim Ulasan");
    $("serviceSteps").classList.remove("review-submitted");
}

  function gallery() {
    $("workerAvatar").src = photos[0].url;

    $("workerAvatar").addEventListener(
      "error",
      () => { $("workerAvatar").hidden = true; },
      { once: true }
    );

    $("photoGallery").replaceChildren();

    photos.slice(1).forEach(photo => {
      const button = node("button", undefined, "photo");
      const image = node("img");

      button.type = "button";
      button.setAttribute(
        "aria-label",
        "Lihat foto contoh " + photo.label
      );

      image.src = photo.url;
      image.alt = photo.label;
      image.loading = "lazy";

      button.append(image, node("span", photo.label));

      button.addEventListener("click", () => {
        $("fullPhoto").src = photo.url;
        $("fullPhoto").alt = photo.label;

        put(
          "photoCaption",
          photo.label +
          " — Foto contoh prototipe, bukan dokumentasi aktual pesanan."
        );

        $("photoDialog").showModal();
      });

      $("photoGallery").append(button);
    });
  }

  function renderReceipt() {
    const sheet = $("receiptSheet");

    sheet.replaceChildren(
      node("h3", "GriyaResik — Kwitansi Simulasi"),
      node("p", "Pesanan #" + normalize(selected.id)),
      node(
        "p",
        "Pemesan: " + (clean(selected.customerName) || "—")
      ),
      node("p", "Metode: " + payment.method),
      node("p", "Waktu: " + stamp(payment.verifiedAt)),
      node("p", "Referensi: " + payment.transactionId)
    );

    billRow(
      sheet,
      "1× " +
      (roomNames.join(" + ") || "Layanan") +
      " — " +
      packageName(),
      "",
      bill.base
    );

    bill.items.forEach(item => {
      billRow(sheet, item.name, "", item.price);
    });

    sheet.append(
      node(
        "p",
        "Total: " + money(bill.total),
        "receipt-total"
      ),
      node(
        "p",
        "SIMULASI PRESENTASI — Bukan bukti pembayaran resmi atau faktur pajak. Tip tidak dibebankan dan tidak termasuk dalam total ini.",
        "receipt-disclaimer"
      )
    );

    $("printDialog").showModal();
  }

  function load(requested) {
    const raw = read(BOOKINGS, []);

    const bookings = Array.isArray(raw)
      ? raw.filter(
          booking =>
            booking &&
            typeof booking === "object" &&
            clean(booking.id)
        )
      : [];

    sample = !bookings.length;

    const id = normalize(
      requested ??
      new URLSearchParams(location.search).get("id")
    );

    let target = id
      ? bookings.find(booking => normalize(booking.id) === id)
      : bookings.at(-1);

    if (sample && (!id || id === normalize(example.id))) {
      target = example;
    }

    if (!target) {
      $("searchFeedback").hidden = false;

      put(
        "searchFeedback",
        "Kode pesanan tidak ditemukan di browser ini. Masukkan kode booking yang tersimpan."
      );

      if (!selected) {
        $("orderContent").hidden = true;
        $("pageState").hidden = false;

        $("pageState").replaceChildren(
          node("h1", "Pesanan belum ditemukan"),
          node(
            "p",
            "Cari kode booking di atas atau buka halaman booking."
          )
        );
      }

      return false;
    }

    selected = target;

    $("orderContent").hidden = false;
    $("pageState").hidden = true;
    $("searchFeedback").hidden = true;

    roomNames = (
      Array.isArray(selected.rooms) && selected.rooms.length
        ? selected.rooms
        : [selected.room]
    )
      .map(room => clean(
        typeof room === "object"
          ? room?.name || room?.room
          : room
      ))
      .filter(Boolean);

    demo = getTimes();
    payment = getPayment();
    bill = totals();

    renderSummary();
    renderSidebar();
    renderHistory();
    loadReview();

    return true;
    }

    $("ratingStars").addEventListener("click", event => {
    const button = event.target.closest("[data-rating]");

    if (button) {
      rating = Number(button.dataset.rating);
      updateRating();
    }
  });

  $("ratingStars").addEventListener("keydown", event => {
    const accepted = [
      "ArrowRight",
      "ArrowUp",
      "ArrowLeft",
      "ArrowDown",
      "Home",
      "End"
    ];

    if (!accepted.includes(event.key)) return;
    event.preventDefault();

    if (event.key === "Home") {
      rating = 1;
    } else if (event.key === "End") {
      rating = 5;
    } else {
      const change = ["ArrowRight", "ArrowUp"].includes(event.key)
        ? 1
        : -1;

      rating = Math.max(1, Math.min(5, rating + change));
    }

    updateRating();

    document.querySelector(
      '[data-rating="' + rating + '"]'
    ).focus();
  });

  $("reviewTags").addEventListener("click", event => {
    const button = event.target.closest("[data-tag]");

    if (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("aria-pressed") !== "true")
      );
    }
  });

  $("tipOptions").addEventListener("click", event => {
    const button = event.target.closest("[data-tip]");
    if (!button) return;

    setTip(button.dataset.tip);

    if (tipChoice === "custom") {
      $("customTip").focus();
    }
  });

  $("reviewForm").addEventListener("submit", event => {
    event.preventDefault();
    if (!selected) return;

    if (rating < 1) {
        put("reviewFeedback", "Pilih minimal satu bintang sebelum mengirim ulasan.");
        return;
    }

    const tip = number(
      tipChoice === "custom"
        ? $("customTip").value
        : tipChoice
    );

    if (tip === null || !Number.isSafeInteger(tip)) {
      put(
        "reviewFeedback",
        "Isi nominal tip berupa rupiah bulat, minimal 0 untuk tanpa tip."
      );
      return;
    }

    const store = recordStore(REVIEWS);

    const record = {
      bookingId: normalize(selected.id),
      rating,
      tags: [
        ...document.querySelectorAll(
          '[data-tag][aria-pressed="true"]'
        )
      ].map(button => button.dataset.tag),
      message: $("reviewMessage").value.trim(),
      tip,
      savedAt: new Date().toISOString(),
      simulated: true
    };

    assign(store, normalize(selected.id), record);

    if (write(REVIEWS, store)) {
      $("serviceSteps").classList.add("review-submitted");
      put(
        "reviewFeedback",
        "Ulasan " +
        rating +
        " bintang dan tip simulasi " +
        money(tip) +
        " tersimpan di browser ini. Tidak ada pembayaran atau penambahan poin."
      );

      put("submitReview", "Simpan Perubahan Ulasan");
    } else {
      put(
        "reviewFeedback",
        "Ulasan belum tersimpan karena penyimpanan browser tidak tersedia. Isian Anda tetap ada; coba lagi."
      );
    }
  });

  $("receiptButton").addEventListener("click", renderReceipt);

  $("printReceipt").addEventListener(
    "click",
    () => window.print()
  );

  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
      $(button.dataset.close).close();
    });
  });

  put("year", new Date().getFullYear());

  gallery();
  load();
})();