(() => {
  "use strict";

  const BOOKINGS_KEY = "griyaResikBookings";
  const DEMO_KEY = "griyaResikStep4Demo";
  const CS_PHONE = "62881026380060";
  const TIME_ZONE = "Asia/Jakarta";

  // Pembayaran lunas untuk presentasi.
  const PAYMENT_DEMO_MODE = true;
  const PAYMENT_DEMO_KEY = "griyaResikPaymentDemo";
  const paymentDemoMemory = Object.create(null);

  const $ = id => document.getElementById(id);

  const normalizeId = value =>
    String(value ?? "")
      .trim()
      .replace(/^#+/, "")
      .toUpperCase();

  const text = value =>
    typeof value === "string" || typeof value === "number"
      ? String(value).trim()
      : "";

  const show = (id, value) => {
    $(id).textContent = text(value) || "—";
  };

  const make = (tag, className, content) => {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (content !== undefined) {
      element.textContent = text(content);
    }

    return element;
  };

  const icon = name => {
    const svg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );

    const use = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "use"
    );

    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    use.setAttribute("href", "#i-" + name);
    svg.append(use);

    return svg;
  };

  const amount = value => {
    if (
      value === "" ||
      value === null ||
      value === undefined ||
      typeof value === "boolean"
    ) {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= 0
      ? number
      : null;
  };

  const money = value =>
    value === null
      ? "—"
      : "Rp " + new Intl.NumberFormat("id-ID").format(value);

  const percent = value => {
    const number = amount(value);

    return number === null
      ? null
      : Math.min(100, Math.round(number));
  };

  const dateValue = value => {
    if (
      !value ||
      (
        typeof value !== "string" &&
        typeof value !== "number"
      )
    ) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const clock = value => {
    const date = dateValue(value);

    if (!date) {
      return "Waktu belum tercatat";
    }

    return (
      new Intl.DateTimeFormat("id-ID", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
      })
        .format(date)
        .replace(".", ":") + " WIB"
    );
  };

  const stamp = value => {
    const date = dateValue(value);

    if (!date) {
      return "Belum tercatat";
    }

    const day = new Intl.DateTimeFormat("id-ID", {
      timeZone: TIME_ZONE,
      day: "numeric",
      month: "short"
    }).format(date);

    return day + ", " + clock(date.toISOString());
  };

  const addressOf = booking => {
    let address = text(booking.address);

    [
      booking.district,
      booking.region,
      "Kota Surabaya",
      "Jawa Timur"
    ]
      .filter(Boolean)
      .forEach(part => {
        if (
          !address
            .toLowerCase()
            .includes(String(part).toLowerCase())
        ) {
          address += (address ? ", " : "") + part;
        }
      });

    return address;
  };

  const packageOf = booking => {
    const value = text(booking.package);

    return /^(basic|standard|deep)$/i.test(value)
      ? value + " Cleaning"
      : value || "Layanan kebersihan";
  };

  let bookings = [];
  let selected = null;
  let demoStore = {};
  let demo = null;
  let rooms = [];
  let memoryWarning = false;

  // Menggunakan sumber pembayaran demo yang sama dengan step 2.
  function getPaymentView(booking) {
    const method = String(
      booking.payment || "Metode belum dipilih"
    );

    const event = Array.isArray(booking.activityHistory)
      ? booking.activityHistory.find(
          item => item?.type === "payment_verified"
        )
      : null;

    if (!PAYMENT_DEMO_MODE) {
      const status = String(
        booking.paymentStatus ||
        (event ? "Lunas" : "Belum diverifikasi")
      );

      const paid = [
        "lunas",
        "paid",
        "verified",
        "terverifikasi",
        "success",
        "settled",
        "berhasil"
      ].includes(status.trim().toLowerCase());

      return {
        status,
        paid,
        method,
        simulated: false,
        date:
          dateValue(booking.paymentVerifiedAt) ||
          dateValue(booking.paidAt) ||
          dateValue(event?.occurredAt),
        transactionId: String(
          booking.transactionId ||
          event?.transactionId ||
          ""
        )
      };
    }

    let store = {};

    try {
      const data = JSON.parse(
        localStorage.getItem(PAYMENT_DEMO_KEY) || "{}"
      );

      if (
        data &&
        typeof data === "object" &&
        !Array.isArray(data)
      ) {
        store = data;
      }
    } catch {
      // Gunakan memori halaman bila penyimpanan tidak tersedia.
    }

    const id = normalizeId(booking.id);

    const saved = Object.hasOwn(store, id)
      ? store[id]
      : null;

    let date =
      dateValue(saved?.verifiedAt) ||
      dateValue(paymentDemoMemory[id]?.verifiedAt);

    if (!date) {
      try {
        date = dateValue(
          localStorage.getItem(
            "griyaResikTransactionPreview:" + booking.id
          )
        );
      } catch {
        // Waktu cadangan ditentukan di bawah.
      }
    }

    if (!date) {
      const created = dateValue(booking.createdAt);

      date = created
        ? new Date(created.getTime() + 5 * 60000)
        : new Date();
    }

    const transactionId =
      "DEMO-" +
      method.replace(/\s+/g, "-") +
      "-" +
      id;

    const record = {
      status: "Lunas",
      verifiedAt: date.toISOString(),
      transactionId
    };

    paymentDemoMemory[id] = record;

    Object.defineProperty(store, id, {
      value: record,
      enumerable: true,
      configurable: true
    });

    try {
      localStorage.setItem(
        PAYMENT_DEMO_KEY,
        JSON.stringify(store)
      );
    } catch {
      // Record tetap tersedia di memori halaman.
    }

    return {
      status: "Lunas",
      paid: true,
      method,
      simulated: true,
      date,
      transactionId
    };
  }

  function readDemo() {
    try {
      const data = JSON.parse(
        localStorage.getItem(DEMO_KEY) || "{}"
      );

      demoStore =
        data &&
        typeof data === "object" &&
        !Array.isArray(data)
          ? data
          : {};
    } catch {
      demoStore = {};
      memoryWarning = true;
    }
  }

  function saveDemo() {
    try {
      localStorage.setItem(
        DEMO_KEY,
        JSON.stringify(demoStore)
      );
    } catch {
      memoryWarning = true;
    }
  }

  function getDemo(booking) {
    const key = normalizeId(booking.id);

    const old = Object.hasOwn(demoStore, key)
      ? demoStore[key]
      : null;

    const record =
      old &&
      typeof old === "object" &&
      !Array.isArray(old)
        ? old
        : {};

    record.rooms =
      record.rooms &&
      typeof record.rooms === "object" &&
      !Array.isArray(record.rooms)
        ? record.rooms
        : {};

    const rawTime = text(booking.time).match(
      /^(\d{1,2}):(\d{2})/
    );

    const rawDate = /^\d{4}-\d{2}-\d{2}$/.test(
      text(booking.date)
    )
      ? booking.date
      : "";

    const scheduled =
      rawDate && rawTime
        ? dateValue(
            rawDate +
            "T" +
            rawTime[1].padStart(2, "0") +
            ":" +
            rawTime[2] +
            ":00+07:00"
          )
        : null;

    if (!dateValue(record.startedAt)) {
      record.startedAt = (
        scheduled || new Date()
      ).toISOString();
    }

    if (!dateValue(record.updatedAt)) {
      record.updatedAt = record.startedAt;
    }

    if (!dateValue(record.transactionAt)) {
      let previous = null;

      try {
        previous = localStorage.getItem(
          "griyaResikTransactionPreview:" + booking.id
        );
      } catch {
        // Gunakan waktu cadangan.
      }

      record.transactionAt = (
        dateValue(previous) ||
        new Date(
          new Date(record.startedAt).getTime() -
          80 * 60000
        )
      ).toISOString();
    }

    Object.defineProperty(demoStore, key, {
      value: record,
      enumerable: true,
      writable: true,
      configurable: true
    });

    return record;
  }

  function bookedRooms(booking) {
    const source =
      Array.isArray(booking.rooms) && booking.rooms.length
        ? booking.rooms
        : [booking.room];

    return source
      .map((entry, index) => {
        const object =
          entry && typeof entry === "object"
            ? entry
            : {};

        const name = text(
          typeof entry === "string"
            ? entry
            : object.name || object.room
        );

        return {
          key:
            "room-" +
            index +
            ":" +
            (text(object.id) || name),
          name,
          description:
            text(
              object.serviceDescription ||
              object.description
            ) || text(booking.serviceDescription),
          index
        };
      })
      .filter(room => room.name);
  }

  function currentRooms() {
    return bookedRooms(selected).map(room => {
      const old = Object.hasOwn(demo.rooms, room.key)
        ? demo.rooms[room.key]
        : null;

      const saved =
        old && typeof old === "object"
          ? old
          : {};

      const savedProgress = percent(saved.percent);

      const progress = [10, 50, 100].includes(savedProgress)
        ? savedProgress
        : 10;

      const completedAt =
        progress === 100
          ? (
              dateValue(saved.completedAt)?.toISOString() ||
              new Date(
                new Date(demo.startedAt).getTime() +
                75 * 60000
              ).toISOString()
            )
          : null;

      demo.rooms[room.key] = {
        percent: progress,
        completedAt
      };

      return {
        ...room,
        percent: progress,
        completedAt
      };
    });
  }

  function appointment(booking) {
    const day = /^\d{4}-\d{2}-\d{2}$/.test(
      text(booking.date)
    )
      ? dateValue(booking.date + "T12:00:00+07:00")
      : null;

    const formatted = day
      ? new Intl.DateTimeFormat("id-ID", {
          timeZone: TIME_ZONE,
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric"
        }).format(day)
      : text(booking.date) || "Tanggal belum tersedia";

    const time = text(booking.time)
      ? text(booking.time).replace(/\s*WIB$/i, "") + " WIB"
      : "Jam belum tersedia";

    return formatted + " – " + time;
  }

  function renderSummary() {
    const complete =
      rooms.length > 0 &&
      rooms.every(room => room.percent === 100);

    const overall = rooms.length
      ? rooms.reduce(
          (sum, room) => sum + room.percent,
          0
        ) / rooms.length
      : 0;

    const list = $("serviceSteps");

    // Samakan isi ruas 4 → 5 dengan persentase di Ceklis Progres Ruangan.
    list.style.setProperty(
      "--work-progress",
      String(Math.floor(overall))
    );

    list.classList.toggle("is-complete", complete);

    show("orderCode", "#" + normalizeId(selected.id));

    show(
      "orderStatus",
      complete
        ? "Selesai & Review · Simulasi"
        : "Pengerjaan Berlangsung · Simulasi"
    );

    show("serviceType", packageOf(selected));
    show("arrivalDate", appointment(selected));
    show("packageName", packageOf(selected));

    show(
      "roomName",
      rooms.length
        ? "1× " + rooms.map(room => room.name).join(" + ")
        : "Ruangan belum tercatat"
    );

    show("districtName", selected.district || selected.region);
    show("addressShort", selected.address || selected.region);
    show("lastUpdated", clock(demo.updatedAt) + " (Simulasi)");

    const labels = [
      "Pesanan Dibuat",
      "Dikonfirmasi",
      "Menuju Lokasi",
      "Pengerjaan",
      "Selesai & Review"
    ];

    const active = complete ? 4 : 3;
    const start = new Date(demo.startedAt).getTime();

    const times = [
      dateValue(selected.createdAt)?.toISOString(),
      new Date(start - 75 * 60000).toISOString(),
      new Date(start - 30 * 60000).toISOString(),
      demo.startedAt,
      complete ? demo.updatedAt : null
    ];

    list.replaceChildren();

    labels.forEach((label, index) => {
      const li = make(
        "li",
        index < active
          ? "done"
          : index === active
            ? "current"
            : ""
      );

      if (index === active) {
        li.setAttribute("aria-current", "step");
      }

      const dot = make("span", "s4-dot");

      if (index <= active) {
        const check = icon("check");
        check.setAttribute("class", "s4-icon");
        dot.append(check);
      } else {
        dot.textContent = String(index + 1);
      }

      const timeLabel = times[index]
        ? clock(times[index]) +
          (index === active ? " (Aktif)" : "")
        : index === 4
          ? "Menunggu seluruh area selesai"
          : "Waktu belum tercatat";

      li.append(
        dot,
        make("strong", "", label),
        make("small", "", timeLabel)
      );

      list.append(li);
    });
  }

  function renderRooms() {
    const finished = rooms.filter(
      room => room.percent === 100
    ).length;

    const average = rooms.length
      ? Math.floor(
          rooms.reduce(
            (sum, room) => sum + room.percent,
            0
          ) / rooms.length
        )
      : 0;

    show(
      "roomCount",
      finished + " dari " + rooms.length + " Area Rampung"
    );

    $("overallFill").style.width = average + "%";

    $("overallProgress").setAttribute(
      "aria-valuenow",
      String(average)
    );

    $("overallProgress").setAttribute(
      "aria-valuetext",
      average +
      "% selesai; " +
      finished +
      " dari " +
      rooms.length +
      " area rampung"
    );

    $("roomList").replaceChildren();

    rooms.forEach(room => {
      const done = room.percent === 100;

      const card = make(
        "article",
        "room-card" + (done ? " complete" : "")
      );

      const marker = make("span", "room-icon");

      marker.append(
        icon(
          done
            ? "check"
            : room.percent > 0
              ? "refresh"
              : "clock"
        )
      );

      const copy = make("div", "room-copy");
      const title = make("div", "room-title");

      const stateLabel = done
        ? "Selesai " + clock(room.completedAt)
        : room.percent > 0
          ? "Pengerjaan Berjalan"
          : "Menunggu Giliran";

      title.append(
        make("h3", "", room.name),
        make(
          "span",
          "room-time" + (done ? "" : " running"),
          stateLabel
        )
      );

      copy.append(
        title,
        make(
          "p",
          "",
          room.description ||
          "Pembersihan sesuai paket dan catatan pemesanan pelanggan."
        )
      );

      const status = make(
        "div",
        "room-percent progress-number",
        done
          ? "100% Selesai"
          : room.percent > 0
            ? "Sedang Berjalan"
            : "Belum Dimulai"
      );

      if (!done) {
        status.append(
          make("small", "", "(" + room.percent + "%)")
        );
      }

      card.append(marker, copy, status);
      $("roomList").append(card);
    });

    let note = rooms.length
      ? "Progres keseluruhan " +
        average +
        "% · Simulasi. Jumlah area mengikuti ruangan yang dipilih saat booking."
      : "Ruangan belum tercatat pada booking ini. Tidak ada area tambahan yang dibuat otomatis.";

    if (rooms.length && memoryWarning) {
      note +=
        " Penyimpanan browser tidak tersedia; progres hanya bertahan selama halaman ini terbuka.";
    }

    show("roomNote", note);
  }

  function addLog(entry) {
    const item = make(
      "li",
      entry.payment ? "payment-event" : ""
    );

    const card = make("article", "h4-activity");
    const head = make("div", "h4-activity-top");
    const heading = make("h3", "", entry.title);

    if (entry.payment) {
      heading.append(
        make("span", "h4-verified", " ⊙")
      );
    }

    const timestamp = make(
      "time",
      "",
      entry.time
        ? clock(entry.time)
        : entry.timeLabel || "Waktu belum tercatat"
    );

    if (dateValue(entry.time)) {
      timestamp.setAttribute(
        "datetime",
        new Date(entry.time).toISOString()
      );
    }

    head.append(heading, timestamp);

    const description = make("p");

    (entry.parts || [entry.message || ""]).forEach(part => {
      if (
        part &&
        typeof part === "object" &&
        Object.hasOwn(part, "bold")
      ) {
        description.append(
          make("strong", "", part.bold)
        );
      } else {
        description.append(
          document.createTextNode(
            typeof part === "string" ? part : text(part)
          )
        );
      }
    });

    card.append(head, description);

    if (entry.transactionId) {
      const transaction = make("div", "h4-transaction");

      transaction.append(
        make("span", "h4-file-icon", "▤"),
        make(
          "span",
          "",
          "ID Transaksi: " + entry.transactionId
        )
      );

      card.append(transaction);
    }

    if (entry.hub) {
      const hub = make("div", "h4-hub");
      const pin = icon("pin");

      pin.setAttribute("class", "h4-icon");

      hub.append(
        pin,
        make("span", "", entry.hub)
      );

      card.append(hub);
    }

    if (entry.tags?.length) {
      const tags = make("div", "h4-tags");

      entry.tags.forEach(tag => {
        tags.append(make("span", "h4-tag", tag));
      });

      card.append(tags);
    }

    item.append(card);
    $("activityList").append(item);
  }

  function renderHistory() {
    const start = new Date(demo.startedAt).getTime();

    const at = minutes =>
      new Date(start + minutes * 60000).toISOString();

    const region =
      text(selected.region || selected.district) ||
      "wilayah layanan";

    const payment = getPaymentView(selected);
    const bill = totals();

    const events = rooms
      .filter(room => room.percent === 100)
      .sort(
        (a, b) =>
          new Date(b.completedAt) - new Date(a.completedAt)
      )
      .map(room => ({
        title: room.name + " Selesai",
        time: room.completedAt,
        parts: [
          "Pembersihan ",
          { bold: room.name },
          " telah selesai 100%. ",
          rooms.every(item => item.percent === 100)
            ? "Seluruh area pesanan selesai dikerjakan."
            : "Mitra melanjutkan pengerjaan area lain yang tercantum dalam pesanan."
        ],
        tags: [
          "100% Selesai",
          "Simulasi progres worker"
        ]
      }));

    events.push(
      {
        title: "Pengerjaan Dimulai di Lokasi",
        time: demo.startedAt,
        parts: [
          "Mitra ",
          { bold: "Siti Rahmawati" },
          " mulai membersihkan ",
          {
            bold:
              rooms.map(room => room.name).join(" + ") ||
              "area pesanan"
          },
          " sesuai paket ",
          { bold: packageOf(selected) },
          ". Pengerjaan mengikuti instruksi dan catatan pelanggan."
        ],
        tags: [
          "Kit Vakum HEPA Terinspeksi",
          "Cairan Organik Non-Toxic"
        ]
      },
      {
        title: "Mitra Tiba di Lokasi",
        time: at(-5),
        message:
          "Mitra tiba di alamat " +
          addressOf(selected) +
          ". Konfirmasi akses lokasi dilakukan dengan pemesan."
      },
      {
        title: "Mitra Menuju Lokasi Hunian",
        time: at(-30),
        message:
          "Mitra bergerak menuju " +
          (
            text(selected.district || selected.region) ||
            "alamat pelanggan"
          ) +
          " dengan perlengkapan kebersihan yang telah disiapkan."
      },
      {
        title: "Pesanan Dikonfirmasi & Mitra Ditugaskan",
        time: at(-75),
        parts: [
          "Sistem dispatch GriyaResik mengalokasikan mitra ",
          { bold: "Siti Rahmawati" },
          " beserta perlengkapan sanitasi. Mitra sedang mempersiapkan peralatan untuk pesanan di area " +
          region +
          ". Penugasan ini masih simulasi."
        ]
      },
      {
        title: payment.paid
          ? "Pembayaran Terverifikasi Lunas"
          : "Status Pembayaran: " + payment.status,

        time: payment.date?.toISOString(),
        payment: payment.paid,
        transactionId: payment.transactionId,

        parts: [
          "Transaksi instan " + payment.method + " senilai ",
          { bold: money(bill.total) },
          payment.simulated
            ? " berhasil diverifikasi dalam simulasi presentasi. Status invoice: LUNAS. (Simulasi)"
            : payment.paid
              ? " tercatat lunas pada data pesanan. Status invoice: LUNAS."
              : ". Status pembayaran: " + payment.status + "."
        ]
      },
      {
        title: "Pesanan Berhasil Dibuat",
        time: dateValue(selected.createdAt)?.toISOString(),
        timeLabel: "07:35 WIB",
        message:
          "Pelanggan " +
          (text(selected.customerName) || "pada pesanan ini") +
          " telah menyelesaikan formulir pemesanan online untuk jadwal pengerjaan " +
          appointment(selected) +
          ". Sistem otomatis mencari mitra terverifikasi di area " +
          region +
          ".",
        hub:
          "GriyaResik " +
          region +
          " Operational Hub #04 (Simulasi)"
      }
    );

    $("activityList").replaceChildren();
    events.forEach(addLog);
  }

  function totals() {
    const addonItems = Array.isArray(selected.addonItems)
      ? selected.addonItems
          .filter(item => item && text(item.name))
          .map(item => ({
            name: text(item.name),
            price: amount(item.price),
            description: text(item.description)
          }))
      : [];

    if (Array.isArray(selected.addons)) {
      selected.addons.forEach(entry => {
        const isObject =
          entry && typeof entry === "object";

        const name = text(
          isObject ? entry.name : entry
        );

        const alreadyExists = addonItems.some(
          item =>
            item.name.toLowerCase() === name.toLowerCase()
        );

        if (name && !alreadyExists) {
          addonItems.push({
            name,
            price: isObject ? amount(entry.price) : null,
            description: ""
          });
        }
      });
    }

    const knownAddonSum = addonItems.every(
      item => item.price !== null
    )
      ? addonItems.reduce(
          (sum, item) => sum + item.price,
          0
        )
      : null;

    const addonTotal =
      amount(selected.addonTotal) ??
      knownAddonSum;

    let total =
      amount(selected.price) ??
      amount(selected.subtotal);

    let base = amount(selected.basePrice);

    if (
      total === null &&
      base !== null &&
      addonTotal !== null
    ) {
      total = base + addonTotal;
    }

    if (
      base === null &&
      total !== null &&
      addonTotal !== null &&
      total >= addonTotal
    ) {
      base = total - addonTotal;
    }

    return {
      addonItems,
      total,
      base
    };
  }

  function billLine(name, description, price) {
    const line = make("div", "bill-line");
    const copy = make("div");

    copy.append(
      make("strong", "", name),
      make("p", "", description)
    );

    line.append(
      copy,
      make("b", "", money(price))
    );

    $("billItems").append(line);
  }

  function renderSidebar() {
    show("customerName", selected.customerName);
    show("customerPhone", selected.phone);
    show("customerAddress", addressOf(selected));

    show(
      "customerLandmark",
      selected.landmark || "Tidak ada patokan tambahan."
    );

    $("mapLink").href =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(addressOf(selected));

    const payment = getPaymentView(selected);

    show(
      "paymentBadge",
      payment.status.toUpperCase() +
      " (" +
      payment.method +
      ")"
    );

    $("paymentBadge").title = payment.simulated
      ? "Simulasi pembayaran lunas untuk presentasi; belum diverifikasi admin."
      : "Status pembayaran dari data pesanan.";

    const bill = totals();

    $("billItems").replaceChildren();

    billLine(
      "1× " +
      (
        rooms.map(room => room.name).join(" + ") ||
        "Layanan"
      ) +
      " — " +
      packageOf(selected),
      text(selected.serviceDescription),
      bill.base
    );

    bill.addonItems.forEach(item => {
      billLine(
        item.name,
        "Add-on pilihan pelanggan",
        item.price
      );
    });

    show("discountAmount", "- Rp. 0");
    show("billTotal", money(bill.total));

    show(
      "transactionTimeLabel",
      payment.simulated
        ? "Waktu Transaksi (Simulasi)"
        : "Waktu Transaksi"
    );

    show(
      "paymentTimestamp",
      stamp(payment.date?.toISOString())
    );

    show(
      "paymentNotice",
      payment.simulated
        ? "Pembayaran lunas dan waktu transaksi merupakan simulasi presentasi."
        : ""
    );

    $("paymentNotice").hidden = !payment.simulated;

    $("supportLink").href =
      "https://wa.me/" +
      CS_PHONE +
      "?text=" +
      encodeURIComponent(
        "Halo GriyaResik, saya ingin bertanya tentang pesanan #" +
        normalizeId(selected.id)
      );
  }

  function render() {
    if (!selected) {
      return;
    }

    demo = getDemo(selected);
    rooms = currentRooms();
    saveDemo();

    renderSummary();
    renderRooms();

    const instructions = [];

    if (text(selected.notes)) {
      instructions.push(
        "Catatan pelanggan: " + text(selected.notes)
      );
    }

    if (text(selected.cleanerPreference)) {
      instructions.push(
        "Preferensi mitra: " + text(selected.cleanerPreference)
      );
    }

    $("customerInstructions").textContent =
      instructions.join(" · ");

    $("customerInstructions").hidden =
      !instructions.length;

    renderHistory();
    renderSidebar();

    $("pageState").hidden = true;
    $("orderContent").hidden = false;
  }

  function state(title, message) {
    $("orderContent").hidden = true;

    const element = $("pageState");
    element.hidden = false;

    element.replaceChildren(
      make("h1", "", title),
      make("p", "", message)
    );

    const booking = make(
      "a",
      "button",
      "Buat Booking"
    );

    booking.href = "booking.html";

    const back = make(
      "a",
      "button light",
      "Status Pemesanan"
    );

    back.href = "my-bookings%201.html";
    element.append(back, booking);
  }

  function load() {
    selected = null;

    try {
      const stored = JSON.parse(
        localStorage.getItem(BOOKINGS_KEY) || "[]"
      );

      if (!Array.isArray(stored)) {
        throw new Error("Format booking tidak valid");
      }

      bookings = stored.filter(
        item =>
          item &&
          typeof item === "object" &&
          text(item.id)
      );
    } catch {
      state(
        "Data pesanan belum dapat dibaca",
        "Periksa penyimpanan browser atau buka kembali halaman booking. Data pesanan tidak dihapus."
      );
      return;
    }

    if (!bookings.length) {
      state(
        "Belum ada pesanan",
        "Buat booking terlebih dahulu menggunakan browser dan alamat situs yang sama."
      );
      return;
    }

    const params = new URLSearchParams(
      window.location.search
    );

    const id = normalizeId(params.get("id"));

    if (id) {
      selected = bookings.find(
        item => normalizeId(item.id) === id
      ) || null;
    } else {
      selected = bookings.every(
        item => dateValue(item.createdAt)
      )
        ? [...bookings].sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          )[0]
        : bookings[bookings.length - 1];
    }

    if (!selected) {
      state(
        "Kode pesanan tidak ditemukan",
        "Kembali ke Status Pemesanan untuk mencari kode yang tersimpan pada browser ini."
      );
      return;
    }

    readDemo();
    render();
  }

  window.GriyaResikStep4 = Object.freeze({
    setDemoProgress(index, value) {
      if (!selected) {
        throw new Error("Belum ada pesanan aktif.");
      }

      const parsed = Number(value);

      if (!Number.isInteger(index) || !rooms[index]) {
        throw new Error("Indeks ruangan tidak ditemukan.");
      }

      if (
        value === null ||
        value === "" ||
        typeof value === "boolean" ||
        !Number.isFinite(parsed)
      ) {
        throw new Error(
          "Persentase harus berupa angka 10, 50, atau 100."
        );
      }

      if (![10, 50, 100].includes(parsed)) {
        throw new Error(
          "Gunakan progres 10%, 50%, atau 100%."
        );
      }

      const progress = parsed;
      const now = new Date().toISOString();
      const room = rooms[index];

      demo.rooms[room.key] = {
        percent: progress,
        completedAt:
          progress === 100
            ? room.completedAt || now
            : null
      };

      demo.updatedAt = now;
      saveDemo();
      render();

      return progress;
    },

    getProgress() {
      return rooms.map(room => ({
        name: room.name,
        percent: room.percent
      }));
    },

    refresh: load
  });

  window.addEventListener("storage", event => {
    if (
      event.key === BOOKINGS_KEY ||
      event.key === DEMO_KEY ||
      event.key === null
    ) {
      load();
    }
  });

  $("year").textContent = String(
    new Date().getFullYear()
  );

  load();
})();