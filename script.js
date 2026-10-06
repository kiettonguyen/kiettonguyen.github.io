document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

// Play looping videos (converted GIFs) only while on screen
const player = new IntersectionObserver((entries) =>
  entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()))
);
document.querySelectorAll("video[data-autoplay]").forEach((v) => player.observe(v));

const root = document.documentElement;
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
const fine = window.matchMedia("(pointer: fine)");
const forced = window.matchMedia("(forced-colors: active)");

// Parallax. Transforms are set straight on each layer (not through CSS variables on
// <html>), so a mouse move never restyles the whole page; that keeps Firefox smooth.
const layers = [...document.querySelectorAll(".drift, .toolbar, .site-footer, #work, #about, .cs-hero, .cs-body, .next-project")]
  .map((el) => ({ el, f: parseFloat(getComputedStyle(el).getPropertyValue("--f")) || -0.4 }));
const dots = document.createElement("div");
dots.className = "paper-dots";
dots.setAttribute("aria-hidden", "true");
document.body.prepend(dots);

const K = 14; // drift strength in px
let mx = 0, my = 0, scrolling = false;
function paint() {
  const k = scrolling ? 0 : K; // the drift rests while the page scrolls, so nothing swims
  for (const { el, f } of layers) el.style.transform = `translate3d(${(mx * k * f).toFixed(2)}px, ${(my * k * f).toFixed(2)}px, 0)`;
  // dots follow the scroll at half speed, wrapped to one 24px dot step so the layer never runs out
  const sy = calm.matches ? 0 : -((window.scrollY * 0.5) % 24);
  dots.style.transform = `translate3d(${(mx * k * 0.2).toFixed(2)}px, ${(sy + my * k * 0.2).toFixed(2)}px, 0)`;
}

let scrollFrame = null;
let settle = null;
window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = null;
    scrolling = true;
    paint();
    clearTimeout(settle);
    settle = setTimeout(() => { scrolling = false; paint(); }, 160);
  });
}, { passive: true });
paint();

// Glass droplet + ink arrow: only with a mouse, and not for reduced motion or high contrast
const liquid = fine.matches && !calm.matches && !forced.matches;
let drop = null;
let arrow = null;

if (liquid) {
  // Chromium can bend what's under the droplet; elsewhere it's just the soft shade
  const refract = CSS.supports("backdrop-filter", "url(#a)") && /Chrome\//.test(navigator.userAgent);
  if (!refract) root.classList.add("lite");
  const svg = (s) => "data:image/svg+xml," + encodeURIComponent(s);
  // Glass bead: flat in the middle, bending most toward the rim, back to neutral at the edge
  const beadMap = svg(
    "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>" +
    "<defs><linearGradient id='x'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#f00'/></linearGradient>" +
    "<linearGradient id='y' x2='0' y2='1'><stop offset='0' stop-color='#000'/><stop offset='1' stop-color='#0f0'/></linearGradient>" +
    "<radialGradient id='m'><stop offset='0' stop-color='#000'/><stop offset='0.4' stop-color='#555'/><stop offset='0.78' stop-color='#fff'/><stop offset='1' stop-color='#000'/></radialGradient>" +
    "<mask id='k'><rect width='100' height='100' fill='url(#m)'/></mask></defs>" +
    "<rect width='100' height='100' fill='#808000'/>" +
    "<g mask='url(#k)'><rect width='100' height='100' fill='url(#x)'/><rect width='100' height='100' fill='url(#y)' style='mix-blend-mode:screen'/></g></svg>"
  );
  // Where the watery wobble may move: everywhere but the very rim
  const fadeMap = svg(
    "<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'>" +
    "<defs><radialGradient id='f'><stop offset='0' stop-color='#fff'/><stop offset='0.62' stop-color='#fff'/><stop offset='0.96' stop-color='#fff' stop-opacity='0'/></radialGradient></defs>" +
    "<rect width='100' height='100' fill='url(#f)'/></svg>"
  );
  const ease = 'calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" repeatCount="indefinite"';
  const fx = document.createElement("div");
  fx.setAttribute("aria-hidden", "true");
  fx.innerHTML = `
    <svg width="0" height="0" style="position:absolute">
      <filter id="bead" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="200" height="200" color-interpolation-filters="sRGB">
        <feImage href="${beadMap}" x="0" y="0" width="200" height="200" preserveAspectRatio="none" result="map"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="1" seed="11" result="na"/>
        <feOffset in="na" result="na2"><animate attributeName="dx" dur="5.5s" values="0;36;0" ${ease}/></feOffset>
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="1" seed="29" result="nb"/>
        <feOffset in="nb" result="nb2"><animate attributeName="dy" dur="8.5s" values="0;-30;0" ${ease}/></feOffset>
        <feComposite in="na2" in2="nb2" operator="arithmetic" k2="0.5" k3="0.5" result="noise"/>
        <feImage href="${fadeMap}" x="0" y="0" width="200" height="200" preserveAspectRatio="none" result="fade"/>
        <feComposite in="noise" in2="fade" operator="in" result="soft"/>
        <feFlood flood-color="#808000" result="mid"/>
        <feMerge result="field"><feMergeNode in="mid"/><feMergeNode in="soft"/></feMerge>
        <feComposite in="map" in2="field" operator="arithmetic" k2="1" k3="0.8" k4="-0.4" result="water"/>
        <feDisplacementMap in="SourceGraphic" in2="water" scale="-28" xChannelSelector="R" yChannelSelector="G">
          <animate attributeName="scale" dur="4.5s" values="-28;-35;-28" ${ease}/>
        </feDisplacementMap>
      </filter>
      <filter id="wavy" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.007" numOctaves="1" seed="5" result="a"/>
        <feOffset in="a" result="a2"><animate attributeName="dx" dur="11s" values="0;70;0" ${ease}/></feOffset>
        <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="1" seed="23" result="b"/>
        <feOffset in="b" result="b2"><animate attributeName="dy" dur="17s" values="0;-60;0" ${ease}/></feOffset>
        <feComposite in="a2" in2="b2" operator="arithmetic" k2="0.5" k3="0.5" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="34" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>
    <div class="drop" hidden><div class="glass${refract ? " refract" : ""}"></div><div class="stretch"><div class="shade"></div></div></div>
    <div class="arrow" hidden><svg viewBox="-1.4 -1.4 18.5 25.2"><path d="M0 0 L2.2 18.6 L6.83 14.7 L10.87 21.77 A1.52 1.52 0 0 0 13.53 20.31 L9.77 13.1 L15.7 10.8 Z"/></svg></div>`;
  document.body.appendChild(fx);
  drop = fx.querySelector(".drop");
  arrow = fx.querySelector(".arrow");
  root.classList.add("ink-cursor");
}

// Cursor: drift for the foreground, the droplet following a beat behind, the arrow exactly on the pointer
let moveFrame = null;
let last = null;
let next = null;
let still = null;
let dirX = 1, dirY = 0, speed = 0;
function stretchShade() {
  const a = (Math.atan2(dirY, dirX) / 2) * 180 / Math.PI;
  const s = 0.12 * speed;
  drop.querySelector(".stretch").style.transform =
    `rotate(${a.toFixed(1)}deg) scale(${(1 + s).toFixed(3)}, ${(1 - s * 0.6).toFixed(3)}) rotate(${(-a).toFixed(1)}deg)`;
}
document.addEventListener("mousemove", (e) => {
  if (calm.matches || !fine.matches) return;
  next = e;
  if (moveFrame) return;
  moveFrame = requestAnimationFrame(() => {
    moveFrame = null;
    const { clientX: x, clientY: y } = next;
    const px = Math.round(x), py = Math.round(y);
    // the arrow goes first so it always sits exactly on the pointer
    if (arrow) {
      arrow.hidden = drop.hidden = false;
      arrow.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    }
    mx = x / window.innerWidth - 0.5;
    my = y / window.innerHeight - 0.5;
    paint();
    if (!drop) return;
    if (!last) {
      // first sighting (new page, or back from outside the window): appear on the cursor,
      // don't glide in from the corner
      drop.style.transition = "none";
      drop.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      drop.getBoundingClientRect();
      drop.style.transition = "";
    } else {
      drop.style.transform = `translate3d(${px}px, ${py}px, 0)`;
    }
    arrow.classList.toggle("on-link", !!(next.target.closest && next.target.closest("a, button, [data-zoom]")));
    // stretch the droplet's shade along the direction of travel. Direction and speed are
    // smoothed so jittery mouse input doesn't make it flicker, and the stretch is applied as
    // rotate(a) scale rotate(-a), so the shade itself never turns or flips.
    if (last) {
      const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
      if (d > 0.5) {
        const a2 = 2 * Math.atan2(dy, dx); // doubled angle: travelling left or right stretch the same way
        dirX += (Math.cos(a2) - dirX) * 0.2;
        dirY += (Math.sin(a2) - dirY) * 0.2;
        speed += (Math.min(1, d / 40) - speed) * 0.25;
      }
    }
    last = { x, y };
    stretchShade();
    clearTimeout(still);
    still = setTimeout(() => { speed = 0; stretchShade(); }, 90);
  });
});
root.addEventListener("mouseleave", () => {
  if (drop) drop.hidden = arrow.hidden = true;
  last = null;
});

// Project pages: a sticky index in the left margin, built from the section headings,
// with the section you're reading highlighted
const body = document.querySelector(".case-study .cs-body");
const heads = body ? [...body.querySelectorAll(".cs-h")] : [];
if (heads.length >= 3) {
  const fig = getComputedStyle(document.body).getPropertyValue("--fig").replace(/["'\s]/g, "");
  const wrap = document.createElement("div");
  wrap.className = "toc-wrap";
  const toc = document.createElement("nav");
  toc.className = "toc";
  toc.setAttribute("aria-label", "On this page");
  // like the N1 prototype: the way back sits at the top of the index, then the figure number
  const heroBack = document.querySelector(".cs-hero .back");
  if (heroBack) {
    const back = heroBack.cloneNode(true);
    back.className = "toc-back";
    toc.append(back);
  }
  const label = document.createElement("span");
  label.className = "toc-fig";
  label.textContent = "fig. " + fig;
  toc.append(label);
  const links = heads.map((h, i) => {
    h.id = h.id || "s" + (i + 1);
    const a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = `${fig}.${i + 1} · ${h.textContent}`;
    toc.append(a);
    return a;
  });
  wrap.append(toc);
  // the index runs alongside the whole page, from the title down to the end of the write-up
  const main = body.parentElement;
  const hero = document.querySelector(".cs-hero");
  main.prepend(wrap);
  document.body.classList.add("has-toc");
  const place = () => {
    const top = hero.offsetTop + parseFloat(getComputedStyle(hero).paddingTop);
    wrap.style.top = top + "px";
    wrap.style.height = body.offsetTop + body.offsetHeight - top + "px";
  };
  place();
  new ResizeObserver(place).observe(main);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("here", a.hash === "#" + en.target.id));
    });
  }, { rootMargin: "0px 0px -70% 0px" });
  heads.forEach((h) => spy.observe(h));
}

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
