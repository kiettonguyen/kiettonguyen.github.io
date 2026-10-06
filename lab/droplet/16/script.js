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
// <html>), so a mouse move never restyles the whole page. Firefox still struggles to keep the
// glide smooth, so there the page stays put and only the dots follow the scroll.
const firefox = navigator.userAgent.includes("Firefox/");
const layers = firefox ? [] : [...document.querySelectorAll(".drift, .toolbar, .site-footer, #work, #about, .cs-hero, .cs-body, .next-project")]
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
  dots.style.transform = `translate3d(${(firefox ? 0 : mx * k * 0.2).toFixed(2)}px, ${(sy + (firefox ? 0 : my * k * 0.2)).toFixed(2)}px, 0)`;
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
// two highlights take turns: the old one fades out on its row while the new one fades in on the next
const hls = [];
let hlCur = null;
let hlFrame = null;
function placeHighlight(h) {
  const r = h.row.getBoundingClientRect();
  h.el.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`;
  h.el.style.width = r.width + "px";
  h.el.style.height = r.height + "px";
}
// follows the rows every frame (rows drift with the cursor), so each highlight sits exactly on its row
function syncHighlight() {
  let busy = false;
  for (const h of hls) {
    if (!h.row) continue;
    if (h !== hlCur && getComputedStyle(h.el).opacity === "0") { h.row = null; continue; }
    placeHighlight(h);
    busy = true;
  }
  hlFrame = busy ? requestAnimationFrame(syncHighlight) : null;
}
function trackRow(row) {
  if (!hls.length || (hlCur ? hlCur.row : null) === row) return;
  const prev = hlCur;
  if (prev) prev.el.classList.remove("on");
  hlCur = null;
  if (row) {
    hlCur = hls.find((h) => h.row === row) || hls.find((h) => !h.row) || hls.find((h) => h !== prev);
    hlCur.row = row;
    placeHighlight(hlCur);
    hlCur.el.classList.add("on");
  }
  if (!hlFrame) syncHighlight();
}

if (liquid) {
  // Chromium can bend what's under the droplet; elsewhere there's just the arrow
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
        <feOffset in="na" result="na2"><animate attributeName="dx" dur="3.7s" values="0;36;0" ${ease}/></feOffset>
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="1" seed="29" result="nb"/>
        <feOffset in="nb" result="nb2"><animate attributeName="dy" dur="5.7s" values="0;-30;0" ${ease}/></feOffset>
        <feComposite in="na2" in2="nb2" operator="arithmetic" k2="0.5" k3="0.5" result="noise"/>
        <feImage href="${fadeMap}" x="0" y="0" width="200" height="200" preserveAspectRatio="none" result="fade"/>
        <feComposite in="noise" in2="fade" operator="in" result="soft"/>
        <feFlood flood-color="#808000" result="mid"/>
        <feMerge result="field"><feMergeNode in="mid"/><feMergeNode in="soft"/></feMerge>
        <feComposite in="map" in2="field" operator="arithmetic" k2="1" k3="0.8" k4="-0.4" result="water"/>
        <feDisplacementMap in="SourceGraphic" in2="water" scale="-28" xChannelSelector="R" yChannelSelector="G" result="bent">
          <animate attributeName="scale" dur="2.5s" values="-28;-35;-28" ${ease}/>
        </feDisplacementMap>
      </filter>
      <filter id="wavy" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.007" numOctaves="1" seed="5" result="a"/>
        <feOffset in="a" result="a2"><animate attributeName="dx" dur="7.3s" values="0;70;0" ${ease}/></feOffset>
        <feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="1" seed="23" result="b"/>
        <feOffset in="b" result="b2"><animate attributeName="dy" dur="11.3s" values="0;-60;0" ${ease}/></feOffset>
        <feComposite in="a2" in2="b2" operator="arithmetic" k2="0.5" k3="0.5" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="34" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </svg>
    <div class="drop" hidden><div class="glass${refract ? " refract" : ""}"></div><div class="stretch"><div class="shade"></div></div></div>
    <div class="arrow" hidden><svg viewBox="-1.4 -1.4 18.5 25.2"><path d="M0 0 L2.2 18.6 L6.97 14.63 L10.87 21.77 A1.52 1.52 0 0 0 13.53 20.31 L9.63 13.17 L15.7 10.8 Z"/></svg></div>`;
  document.body.appendChild(fx);
  drop = fx.querySelector(".drop");
  arrow = fx.querySelector(".arrow");
  root.classList.add("ink-cursor");
  for (let i = 0; i < 2; i++) {
    const el = document.createElement("div");
    el.className = "row-hl";
    el.setAttribute("aria-hidden", "true");
    fx.append(el);
    hls.push({ el, row: null });
  }
}

// Cursor: drift for the foreground, the droplet following a beat behind, the arrow exactly on the pointer
let moveFrame = null;
let last = null;
let next = null;
let still = null;
let dirX = 1, dirY = 0, speed = 0;
// squash and stretch: the whole droplet (glass and shade) is pulled long along the direction of
// travel and squeezed across it, keeping its area. A spring drives it, so when the cursor stops
// the blob overshoots a little and wobbles back to round, like jelly.
let blob = 0, blobVel = 0, blobFrame = null;
function stretchShade() {
  if (!blobFrame) blobFrame = requestAnimationFrame(wobble);
}
function wobble() {
  const target = 0.32 * speed;
  blobVel = (blobVel + (target - blob) * 0.16) * 0.78;
  blob = Math.max(-0.2, blob + blobVel);
  const a = (Math.atan2(dirY, dirX) / 2) * 180 / Math.PI;
  const along = 1 + blob, across = 1 / along;
  drop.querySelector(".stretch").style.transform =
    `rotate(${a.toFixed(1)}deg) scale(${along.toFixed(3)}, ${across.toFixed(3)}) rotate(${(-a).toFixed(1)}deg)`;
  const settled = target === 0 && Math.abs(blob) < 0.002 && Math.abs(blobVel) < 0.002;
  if (settled) { blob = blobVel = 0; drop.querySelector(".stretch").style.transform = ""; }
  blobFrame = settled ? null : requestAnimationFrame(wobble);
}
// the droplet eases after the pointer here, always landing on whole pixels so the glass never sits between pixels
let dropX = 0, dropY = 0, goalX = 0, goalY = 0, followFrame = null;
function follow() {
  dropX += (goalX - dropX) * 0.2;
  dropY += (goalY - dropY) * 0.2;
  const done = Math.abs(goalX - dropX) < 0.5 && Math.abs(goalY - dropY) < 0.5;
  if (done) { dropX = goalX; dropY = goalY; }
  drop.style.transform = `translate3d(${Math.round(dropX)}px, ${Math.round(dropY)}px, 0)`;
  followFrame = done ? null : requestAnimationFrame(follow);
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
    goalX = px; goalY = py;
    // first sighting (new page, or back from outside the window): appear on the cursor
    if (!last) { dropX = px; dropY = py; }
    if (!followFrame) follow();
    const onLink = !!(next.target.closest && next.target.closest("a, button, [data-zoom]"));
    arrow.classList.toggle("on-link", onLink);
    // project rows: the words stay under the glass, but their highlight is drawn above it, so it stays crisp
    trackRow(next.target.closest ? next.target.closest(".row") : null);
    // stretch the droplet along the direction of travel. Direction and speed are
    // smoothed so jittery mouse input doesn't make it flicker, and the stretch is applied as
    // rotate(a) scale rotate(-a), so the droplet itself never turns or flips.
    if (last) {
      const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
      if (d > 0.5) {
        const a2 = 2 * Math.atan2(dy, dx); // doubled angle: travelling left or right stretch the same way
        dirX += (Math.cos(a2) - dirX) * 0.2;
        dirY += (Math.sin(a2) - dirY) * 0.2;
        // square root: even a slow nudge visibly pushes the droplet out of round, like water ahead of a hand
        speed += (Math.min(1, Math.sqrt(d / 30)) - speed) * 0.25;
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
  trackRow(null);
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
