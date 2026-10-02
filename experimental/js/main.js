// Shared behaviour for every page: footer year, scroll reveals, lazy video playback,
// image lightbox, case-study reading progress and the project-list hover preview.

document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

// Reveal elements as they scroll into view
const revealer = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealer.unobserve(e.target);
    }
  }),
  { rootMargin: "0px 0px -10% 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

// Only play looping videos (converted GIFs) while they are on screen
const player = new IntersectionObserver((entries) =>
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.play().catch(() => {});
    else e.target.pause();
  })
);
document.querySelectorAll("video[data-autoplay]").forEach((v) => player.observe(v));

// Lightbox
const lightbox = document.querySelector(".lightbox");
if (lightbox) {
  const img = lightbox.querySelector("img");
  document.querySelectorAll("img[data-zoom]").forEach((el) =>
    el.addEventListener("click", () => {
      img.src = el.currentSrc || el.src;
      img.alt = el.alt;
      lightbox.hidden = false;
    })
  );
  lightbox.addEventListener("click", () => (lightbox.hidden = true));
  document.addEventListener("keydown", (e) => e.key === "Escape" && (lightbox.hidden = true));
}

// Reading progress bar on case-study pages
const progress = document.querySelector(".progress");
if (progress) {
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener("scroll", update, { passive: true });
  update();
}

// Floating image preview when hovering the project list
const preview = document.querySelector(".list-preview");
if (preview && matchMedia("(hover: hover)").matches) {
  const pimg = preview.querySelector("img");
  let x = 0, y = 0, px = 0, py = 0, raf = 0;
  const follow = () => {
    px += (x - px) * 0.15;
    py += (y - py) * 0.15;
    preview.style.translate = `${px + 24}px ${py - 100}px`;
    raf = preview.classList.contains("on") || Math.abs(x - px) > 0.5 ? requestAnimationFrame(follow) : 0;
  };
  document.querySelectorAll(".project-list a").forEach((a) => {
    a.addEventListener("mouseenter", (e) => {
      pimg.src = a.dataset.poster;
      if (!preview.classList.contains("on")) { px = x = e.clientX; py = y = e.clientY; }
      preview.classList.add("on");
      if (!raf) raf = requestAnimationFrame(follow);
    });
    a.addEventListener("mouseleave", () => preview.classList.remove("on"));
    a.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });
  });
}
