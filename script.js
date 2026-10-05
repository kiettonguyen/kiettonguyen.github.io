document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

// Play looping videos (converted GIFs) only while on screen
const player = new IntersectionObserver((entries) =>
  entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()))
);
document.querySelectorAll("video[data-autoplay]").forEach((v) => player.observe(v));

// Cursor parallax: share the pointer position (-0.5..0.5) as CSS variables
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
const fine = window.matchMedia("(pointer: fine)");
let frame = null;
document.addEventListener("mousemove", (e) => {
  if (calm.matches || !fine.matches || frame) return;
  frame = requestAnimationFrame(() => {
    frame = null;
    const root = document.documentElement.style;
    root.setProperty("--mx", (e.clientX / window.innerWidth - 0.5).toFixed(3));
    root.setProperty("--my", (e.clientY / window.innerHeight - 0.5).toFixed(3));
  });
});

// Simple lightbox: click an image to view it full screen
const lightbox = document.querySelector(".lightbox");
const lightboxImg = lightbox.querySelector("img");

document.querySelectorAll("img[data-zoom]").forEach((img) => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
  });
});

lightbox.addEventListener("click", () => (lightbox.hidden = true));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") lightbox.hidden = true;
});
