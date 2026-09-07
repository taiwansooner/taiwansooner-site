// Renders the homepage hero carousel from /data/carousel.json.
// Non-technical teammates manage that file's contents through /admin/ —
// this script only needs to render whatever is marked "active": true,
// in ascending "order".
(async function () {
  const root = document.getElementById("hero-carousel");
  if (!root) return;

  let slides = [];
  try {
    const res = await fetch("/data/carousel.json", { cache: "no-store" });
    const all = await res.json();
    slides = all
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (e) {
    console.error("Could not load carousel data", e);
  }

  if (slides.length === 0) {
    root.innerHTML = '<div class="hero-empty">No homepage images yet — add some in /admin/</div>';
    return;
  }

  const slideEls = slides.map((s, i) => {
    const el = document.createElement("div");
    el.className = "hero-slide" + (i === 0 ? " is-active" : "");
    el.style.backgroundImage = "url('" + s.src + "')";
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", s.alt || "");
    root.appendChild(el);
    return el;
  });

  const dotsWrap = document.createElement("div");
  dotsWrap.className = "hero-dots";
  const dotEls = slides.map((_, i) => {
    const b = document.createElement("button");
    b.className = i === 0 ? "is-active" : "";
    b.setAttribute("aria-label", "Show slide " + (i + 1));
    b.addEventListener("click", () => show(i));
    dotsWrap.appendChild(b);
    return b;
  });
  if (slides.length > 1) root.appendChild(dotsWrap);

  let current = 0;
  let timer;

  function show(index) {
    slideEls[current].classList.remove("is-active");
    dotEls[current].classList.remove("is-active");
    current = index;
    slideEls[current].classList.add("is-active");
    dotEls[current].classList.add("is-active");
  }

  function next() {
    show((current + 1) % slides.length);
  }

  if (slides.length > 1) {
    timer = setInterval(next, 5000);
    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", () => (timer = setInterval(next, 5000)));
  }
})();
