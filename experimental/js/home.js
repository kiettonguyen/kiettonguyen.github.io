// Whiteboard-style 3D project board for the home page (three.js).
// Project cards (read from .project-list in index.html) are pinned to a dotted board.
// Scrolling through #work pans the camera from card to card like a whiteboard app,
// easing out slightly mid-pan. The CSS dot grid on <body> is moved in sync with the
// camera so the board feels continuous. Only the focused card plays its video, and
// the only pointer effect is a card lifting off the board on hover.
import * as THREE from "three";

const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const canvas = document.getElementById("gl");
let renderer;
try {
  if (reduceMotion) throw new Error("reduced motion");
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch {
  root.classList.add("no-gl");
}

if (renderer) init();

function init() {
  const links = [...document.querySelectorAll(".project-list a")];
  const projects = links.map((a) => ({
    href: a.getAttribute("href"),
    cover: a.dataset.cover,
    note: a.dataset.note,
    title: a.querySelector(".name").textContent,
    kind: a.querySelector(".kind").textContent,
    year: a.querySelector(".yr").textContent,
  }));
  const N = projects.length;

  const work = document.getElementById("work");
  const hud = work.querySelector(".hud");
  const hudI = hud.querySelector(".hud-i");
  const hudTitle = hud.querySelector(".hud-title a");
  const hudMeta = hud.querySelector(".hud-meta");
  const hudCta = hud.querySelector(".hud-cta");
  const minimap = work.querySelector(".minimap");
  const cursorLabel = document.querySelector(".cursor-label");
  hud.querySelector(".hud-n").textContent = String(N).padStart(2, "0");
  work.style.height = `${N * 100}vh`; // one screen of scrolling per project

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // textures pass straight through

  const scene = new THREE.Scene();
  const FOV = 40;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  const DIST = 9; // resting camera distance from the board
  const DOT = 24; // css dot spacing (px) at resting distance
  const pxPerUnit = (d) => innerHeight / (2 * d * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));

  // ---------- Shaders ----------
  const sdf = /* glsl */ `
    float roundedBox(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }
  `;
  const vert = /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `;
  // white card or sticky note paper, optionally textured
  const paperFrag = /* glsl */ `
    uniform vec2 uSize;
    uniform float uRadius;
    uniform sampler2D uTex;
    uniform float uHasTex;
    varying vec2 vUv;
    ${sdf}
    void main() {
      float d = roundedBox((vUv - 0.5) * uSize, uSize * 0.5, uRadius);
      float a = 1.0 - smoothstep(-0.006, 0.006, d);
      vec4 col = mix(vec4(1.0), texture2D(uTex, vUv), uHasTex);
      gl_FragColor = vec4(col.rgb, a);
    }
  `;
  // the project image inset in the card
  const imageFrag = /* glsl */ `
    uniform sampler2D uTex;
    uniform vec2 uSize;
    uniform float uReady;
    varying vec2 vUv;
    ${sdf}
    void main() {
      float d = roundedBox((vUv - 0.5) * uSize, uSize * 0.5, 0.06);
      float a = 1.0 - smoothstep(-0.006, 0.006, d);
      vec3 col = mix(vec3(0.93, 0.92, 0.89), texture2D(uTex, vUv).rgb, uReady);
      gl_FragColor = vec4(col, a);
    }
  `;
  // soft drop shadow on the board
  const shadowFrag = /* glsl */ `
    uniform vec2 uSize, uPlane;
    uniform float uBlur, uStrength;
    varying vec2 vUv;
    ${sdf}
    void main() {
      float d = roundedBox((vUv - 0.5) * uPlane, uSize * 0.5, 0.1);
      float a = 1.0 - smoothstep(-uBlur * 0.4, uBlur, d);
      gl_FragColor = vec4(0.09, 0.09, 0.1, a * a * uStrength);
    }
  `;

  const quad = new THREE.PlaneGeometry(1, 1);
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;
  const mat = (frag, uniforms) =>
    new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, transparent: true, depthWrite: false });

  // A pinned item = shadow + paper (+ optional image), grouped so it can lift off the board
  function pinned() {
    const group = new THREE.Group();
    const shadow = new THREE.Mesh(quad, mat(shadowFrag, {
      uSize: { value: new THREE.Vector2(1, 1) },
      uPlane: { value: new THREE.Vector2(1, 1) },
      uBlur: { value: 0.25 },
      uStrength: { value: 0.22 },
    }));
    const paper = new THREE.Mesh(quad, mat(paperFrag, {
      uSize: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: 0.12 },
      uTex: { value: blank },
      uHasTex: { value: 0 },
    }));
    shadow.renderOrder = 0;
    paper.renderOrder = 1;
    group.add(shadow, paper);
    scene.add(group);
    return { group, shadow, paper, lift: 0 };
  }

  function sizePinned(item, w, h) {
    item.paper.scale.set(w, h, 1);
    item.paper.material.uniforms.uSize.value.set(w, h);
    const pad = 1.4;
    item.shadow.scale.set(w + pad, h + pad, 1);
    item.shadow.material.uniforms.uSize.value.set(w, h);
    item.shadow.material.uniforms.uPlane.value.set(w + pad, h + pad);
  }

  // ---------- Project cards ----------
  const PAD = 0.14; // white border around the image
  const cards = projects.map((p, i) => {
    const item = pinned();
    const image = new THREE.Mesh(quad, mat(imageFrag, {
      uTex: { value: blank },
      uSize: { value: new THREE.Vector2(1, 1) },
      uReady: { value: 0 },
    }));
    image.renderOrder = 2;
    image.position.z = 0.002;
    item.group.add(image);
    item.paper.userData.index = i;
    Object.assign(item, { image, aspect: 16 / 10, video: null, tilt: [-1.6, 1.2, -0.8, 1.4, -1.1][i % 5] });

    const ready = (tex, w, h) => {
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      image.material.uniforms.uTex.value = tex;
      item.aspect = w / h;
      layout();
      const t0 = performance.now();
      const fade = (t) => {
        image.material.uniforms.uReady.value = Math.min(1, (t - t0) / 500);
        if (image.material.uniforms.uReady.value < 1) requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
    };
    if (p.cover.endsWith(".mp4")) {
      const v = document.createElement("video");
      Object.assign(v, { src: p.cover, muted: true, loop: true, playsInline: true, preload: "auto" });
      v.addEventListener("loadeddata", () => ready(new THREE.VideoTexture(v), v.videoWidth, v.videoHeight), { once: true });
      v.load();
      item.video = v;
    } else {
      new THREE.TextureLoader().load(p.cover, (tex) => ready(tex, tex.image.width, tex.image.height));
    }
    return item;
  });

  // ---------- Sticky notes (data-note) ----------
  const notes = [];
  document.fonts.load("700 64px Caveat").finally(() => {
    projects.forEach((p, i) => {
      if (!p.note) return;
      const c = document.createElement("canvas");
      c.width = c.height = 512;
      const g = c.getContext("2d");
      g.fillStyle = i % 2 ? "#ffd3d8" : "#ffe68a";
      g.fillRect(0, 0, 512, 512);
      g.fillStyle = "#17171a";
      g.font = "700 92px Caveat, cursive";
      g.textAlign = "center";
      g.textBaseline = "middle";
      // wrap to two lines at most
      const words = p.note.split(" ");
      const lines = [];
      let line = "";
      words.forEach((w) => {
        const test = line ? `${line} ${w}` : w;
        if (g.measureText(test).width > 420 && line) { lines.push(line); line = w; } else line = test;
      });
      lines.push(line);
      lines.forEach((l, k) => g.fillText(l, 256, 256 + (k - (lines.length - 1) / 2) * 100));
      const item = pinned();
      item.paper.material.uniforms.uTex.value = new THREE.CanvasTexture(c);
      item.paper.material.uniforms.uHasTex.value = 1;
      item.paper.material.uniforms.uRadius.value = 0.02;
      item.card = i;
      item.shadow.renderOrder = 3; // notes sit on top of the cards
      item.paper.renderOrder = 4;
      notes.push(item);
    });
    layout();
  });

  // ---------- Layout ----------
  let mobile = false;
  let viewW = 1, viewH = 1;
  const stops = []; // camera target for each card, plus the hero position at index -1

  function layout() {
    const w = innerWidth, h = innerHeight;
    mobile = w < 760;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    viewH = 2 * DIST * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    viewW = viewH * camera.aspect;

    const stepY = viewH * 0.95;
    cards.forEach((c, i) => {
      let cw = mobile ? viewW * 0.86 : Math.min(viewW * 0.44, 5.2);
      let ch = (cw - PAD * 2) / c.aspect + PAD * 2;
      const maxH = viewH * (mobile ? 0.46 : 0.58);
      if (ch > maxH) { ch = maxH; cw = (ch - PAD * 2) * c.aspect + PAD * 2; }
      sizePinned(c, cw, ch);
      c.image.scale.set(cw - PAD * 2, ch - PAD * 2, 1);
      c.image.material.uniforms.uSize.value.set(cw - PAD * 2, ch - PAD * 2);
      c.w = cw;
      c.h = ch;
      const side = i % 2 === 0 ? 1 : -1;
      c.group.position.set(side * (mobile ? viewW * 0.08 : viewW * 0.2), -i * stepY, 0);
      c.group.rotation.z = THREE.MathUtils.degToRad(c.tilt);
      // keep the card clear of the HUD: right of centre on desktop, upper half on mobile
      stops[i] = mobile
        ? new THREE.Vector2(c.group.position.x * 0.5, c.group.position.y - viewH * 0.14)
        : new THREE.Vector2(c.group.position.x - viewW * 0.12, c.group.position.y - viewH * 0.04);
    });
    stops[-1] = new THREE.Vector2(stops[0].x - viewW * 0.1, stops[0].y + viewH * 1.05);

    notes.forEach((n) => {
      const c = cards[n.card];
      const s = mobile ? 0.9 : 1.25;
      sizePinned(n, s, s);
      // tucked over the card's top corner: outside it on desktop, inside the right corner on mobile
      const side = mobile || n.card % 2 === 0 ? 1 : -1;
      const dx = mobile ? c.w / 2 - s * 0.45 : c.w / 2 + s * 0.05;
      n.group.position.set(c.group.position.x + side * dx, c.group.position.y + c.h / 2 - s * 0.2, 0.06);
      n.group.rotation.z = THREE.MathUtils.degToRad(side * 6);
    });
  }
  addEventListener("resize", layout);
  layout();

  // ---------- Scroll ----------
  // ease each segment so the camera rests on every card
  const rest = (t) => {
    const i = Math.floor(t);
    return i + THREE.MathUtils.smoothstep(t - i, 0.25, 0.75);
  };
  let target = -1;
  let current = -1;
  let visible = true;
  const trackLen = () => work.offsetHeight - innerHeight;

  function readScroll() {
    const top = work.offsetTop;
    const y = scrollY;
    target = y < top ? -1 + rest(y / top) : rest(Math.min(1, (y - top) / trackLen()) * (N - 1));
    const end = top + trackLen();
    const fade = 1 - THREE.MathUtils.clamp((y - end) / (innerHeight * 0.5), 0, 1);
    canvas.style.opacity = fade;
    visible = fade > 0;
  }
  addEventListener("scroll", readScroll, { passive: true });
  addEventListener("resize", readScroll);
  readScroll();

  // ---------- HUD + minimap ----------
  const dots = projects.map((p, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", p.title);
    b.addEventListener("click", () =>
      scrollTo({ top: work.offsetTop + (trackLen() * i) / (N - 1), behavior: "smooth" })
    );
    minimap.append(b);
    return b;
  });

  let active = -1;
  let swapTimer = 0;
  function setActive(i) {
    if (i === active) return;
    const first = active === -1;
    active = i;
    dots.forEach((d, k) => d.classList.toggle("on", k === i));
    const apply = () => {
      const p = projects[i];
      hudI.textContent = String(i + 1).padStart(2, "0");
      hudTitle.textContent = p.title;
      hudTitle.href = hudCta.href = p.href;
      hudMeta.textContent = `${p.kind} — ${p.year}`;
      hud.classList.remove("changing");
    };
    clearTimeout(swapTimer);
    if (first) apply();
    else { hud.classList.add("changing"); swapTimer = setTimeout(apply, 200); }
    // only the focused card plays
    cards.forEach((c, k) => {
      if (!c.video) return;
      if (k === i) c.video.play().catch(() => {});
      else c.video.pause();
    });
  }

  // ---------- Pointer ----------
  const pointer = new THREE.Vector2(-10, -10);
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const raycaster = new THREE.Raycaster();
  let hovered = -1;

  addEventListener("pointermove", (e) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    mouse.x = pointer.x;
    mouse.y = pointer.y;
    cursorLabel.style.translate = `${e.clientX}px ${e.clientY}px`;
  });
  addEventListener("click", (e) => {
    if (hovered >= 0 && visible && !e.target.closest("a, button, .card, .sticky")) location.href = projects[hovered].href;
  });

  // ---------- Loop ----------
  const body = document.body;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) {
      if (active >= 0 && cards[active].video) cards[active].video.pause();
      return;
    }

    current += (target - current) * 0.08;

    // pan between stops, easing out a little mid-pan
    const i0 = THREE.MathUtils.clamp(Math.floor(current), -1, N - 1);
    const i1 = Math.min(N - 1, i0 + 1);
    const f = THREE.MathUtils.clamp(current - i0, 0, 1);
    const e = f * f * (3 - 2 * f);
    const camX = THREE.MathUtils.lerp(stops[i0].x, stops[i1].x, e);
    const camY = THREE.MathUtils.lerp(stops[i0].y, stops[i1].y, e);
    const dist = DIST + Math.sin(f * Math.PI) * 1.8;

    mouse.sx += (mouse.x - mouse.sx) * 0.04;
    mouse.sy += (mouse.y - mouse.sy) * 0.04;
    const px = camX + mouse.sx * 0.12;
    const py = camY + mouse.sy * 0.08;
    camera.position.set(px, py, dist);
    camera.lookAt(px, py, 0);

    // move the css dot grid with the camera so the board is one continuous surface
    const ppu = pxPerUnit(dist);
    const spacing = (DOT / pxPerUnit(DIST)) * ppu;
    body.style.backgroundSize = `${spacing}px ${spacing}px`;
    body.style.backgroundPosition = `${innerWidth / 2 - px * ppu}px ${innerHeight / 2 + py * ppu}px`;

    if (current > -0.5) setActive(THREE.MathUtils.clamp(Math.floor(current + 0.5), 0, N - 1));

    // hover: only within the gallery and on desktop
    const inGallery = !mobile && scrollY > work.offsetTop - innerHeight * 0.3;
    raycaster.setFromCamera(pointer, camera);
    const hit = inGallery ? raycaster.intersectObjects(cards.map((c) => c.paper))[0] : null;
    hovered = hit ? hit.object.userData.index : -1;
    body.classList.toggle("hovering-card", hovered >= 0);
    cursorLabel.classList.toggle("on", hovered >= 0);

    const settle = (item, lift) => {
      item.lift += (lift - item.lift) * 0.12;
      item.group.position.z = item.lift;
      // shadow spreads and softens as the item rises
      const u = item.shadow.material.uniforms;
      u.uBlur.value = 0.22 + item.lift * 1.2;
      u.uStrength.value = 0.2 - item.lift * 0.15;
      item.shadow.position.set(item.lift * 0.2, -0.06 - item.lift * 0.6, -item.lift + 0.001);
    };
    cards.forEach((c, i) => settle(c, i === hovered ? 0.4 : i === active ? 0.1 : 0));
    notes.forEach((n) => settle(n, 0.06));

    renderer.render(scene, camera);
  }
  frame();
}
