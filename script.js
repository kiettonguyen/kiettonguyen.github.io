document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

// Play looping videos (converted GIFs) only while on screen
const player = new IntersectionObserver((entries) =>
  entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()))
);
document.querySelectorAll("video[data-autoplay]").forEach((v) => player.observe(v));

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
