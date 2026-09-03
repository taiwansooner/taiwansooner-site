// Injects the shared header/footer so every page (and the footer especially)
// stays identical without copy-pasting HTML into each file.
(async function () {
  const headerHost = document.getElementById("site-header");
  const footerHost = document.getElementById("site-footer");

  async function inject(host, path) {
    if (!host) return;
    try {
      const res = await fetch(path);
      host.outerHTML = await res.text();
    } catch (e) {
      console.error("Could not load " + path, e);
    }
  }

  await inject(headerHost, "/partials/header.html");
  await inject(footerHost, "/partials/footer.html");

  // mobile nav toggle
  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");
  if (toggle && list) {
    toggle.addEventListener("click", () => {
      const open = list.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // highlight current page in nav
  const current = document.body.dataset.page;
  if (current) {
    const link = document.querySelector('[data-nav="' + current + '"]');
    if (link) link.setAttribute("aria-current", "page");
  }

  // footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.dispatchEvent(new Event("partials:loaded"));
})();
