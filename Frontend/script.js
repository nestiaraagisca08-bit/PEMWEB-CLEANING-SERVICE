document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

    // Menandai menu aktif ketika diklik
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.forEach(function (item) {
                item.classList.remove("active");
            });

            link.classList.add("active");
        });
    });

    // Menyesuaikan menu aktif dengan bagian halaman yang terlihat
    const sections = Array.from(navLinks)
        .map(function (link) {
            const targetId = link.getAttribute("href");
            return targetId ? document.querySelector(targetId) : null;
        })
        .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length > 0) {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;

                    const activeHref = "#" + entry.target.id;

                    navLinks.forEach(function (link) {
                        link.classList.toggle(
                            "active",
                            link.getAttribute("href") === activeHref
                        );
                    });
                });
            },
            {
                rootMargin: "-20% 0px -65% 0px",
                threshold: 0
            }
        );

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }
});
