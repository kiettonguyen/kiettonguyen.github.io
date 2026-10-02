// Interactive 3D scroll gallery for the home page (three.js).
// Projects are read from the .project-list links in index.html; each becomes a
// floating plane (video or image texture). Scrolling through #work flies the
// camera past them; planes bend with scroll speed and ripple under the cursor.
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
    title: a.querySelector(".name").textContent,
    kind: a.querySelector(".kind").textContent,
    year: a.querySelector(".yr").textContent,
  }));
  const N = projects.length;

  const work = document.getElementById("work");
  const stage = work.querySelector(".work-stage");
  const hudI = stage.querySelector(".hud-i");
  const hudTitle = stage.querySelector(".hud-title a");
  const hudMeta = stage.querySelector(".hud-meta");
  const hudCta = stage.querySelector(".hud-cta");
  const hudBar = stage.querySelector(".hud-progress span");
  const cursorLabel = document.querySelector(".cursor-label");
  stage.querySelector(".hud-n").textContent = String(N).padStart(2, "0");
  // one screen of scrolling per project
  work.style.height = `${N * 100}vh`;

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // textures pass straight through

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

  const GAP = 7; // distance between planes along z
  const VIEW = 4.2; // how far in front of a plane the camera rests

  // ---------- Planes ----------
  const vertex = /* glsl */ `
    uniform float uTime, uVel, uHover;
    uniform vec2 uMouse;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      // bend like paper with scroll velocity
      p.z -= sin(uv.y * 3.14159) * uVel * 0.6;
      p.y += sin(uv.x * 3.14159) * uVel * 0.08;
      // idle drift
      p.z += sin(uv.x * 4.0 + uTime * 0.8) * 0.02;
      // ripple from the cursor
      float d = distance(uv, uMouse);
      p.z += sin(d * 22.0 - uTime * 6.0) * 0.035 * uHover * (1.0 - smoothstep(0.0, 0.7, d));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `;
  const fragment = /* glsl */ `
    uniform sampler2D uTex;
    uniform float uVel, uActive, uOpacity, uHover, uReady;
    uniform vec2 uSize;
    varying vec2 vUv;
    float roundedBox(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }
    void main() {
      // zoom slightly on hover
      vec2 uv = (vUv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;
      // RGB split with scroll speed
      float s = clamp(uVel, -1.0, 1.0) * 0.015;
      vec3 col = vec3(
        texture2D(uTex, uv + vec2(0.0, s)).r,
        texture2D(uTex, uv).g,
        texture2D(uTex, uv - vec2(0.0, s)).b
      );
      col = mix(vec3(0.87, 0.85, 0.81), col, uReady);
      // inactive planes are desaturated
      float g = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(g), col, 0.25 + 0.75 * uActive);
      // rounded corners
      float d = roundedBox((vUv - 0.5) * uSize, uSize * 0.5, 0.06);
      float a = 1.0 - smoothstep(-0.004, 0.004, d);
      gl_FragColor = vec4(col, a * uOpacity);
    }
  `;

  const geometry = new THREE.PlaneGeometry(1, 1, 48, 48);
  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;

  const planes = projects.map((p, i) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTex: { value: blank },
        uTime: { value: 0 },
        uVel: { value: 0 },
        uHover: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uActive: { value: 0 },
        uOpacity: { value: 0 },
        uReady: { value: 0 },
        uSize: { value: new THREE.Vector2(1, 1) },
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { index: i, aspect: 16 / 10, hover: 0 };
    scene.add(mesh);

    const plane = { mesh, material, video: null };
    const ready = (tex, w, h) => {
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      material.uniforms.uTex.value = tex;
      mesh.userData.aspect = w / h;
      layout();
      // fade in once loaded
      const t0 = performance.now();
      const fade = (t) => {
        material.uniforms.uReady.value = Math.min(1, (t - t0) / 600);
        if (material.uniforms.uReady.value < 1) requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
    };

    if (p.cover.endsWith(".mp4")) {
      const v = document.createElement("video");
      Object.assign(v, { src: p.cover, muted: true, loop: true, playsInline: true, preload: "auto", crossOrigin: "anonymous" });
      v.addEventListener("loadeddata", () => ready(new THREE.VideoTexture(v), v.videoWidth, v.videoHeight), { once: true });
      v.load();
      plane.video = v;
    } else {
      new THREE.TextureLoader().load(p.cover, (tex) => ready(tex, tex.image.width, tex.image.height));
    }
    return plane;
  });

  // ---------- Particles ----------
  const COUNT = 900;
  const pos = new Float32Array(COUNT * 3);
  const depth = N * GAP + 20;
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 2] = 12 - Math.random() * depth;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0x141414, size: 0.022, transparent: true, opacity: 0.45, depthWrite: false })
  );
  scene.add(dust);

  // A few accent-coloured specks
  const accentGeo = new THREE.BufferGeometry();
  accentGeo.setAttribute("position", new THREE.BufferAttribute(pos.slice(0, 60 * 3), 3));
  const accent = new THREE.Points(
    accentGeo,
    new THREE.PointsMaterial({ color: 0xe4572e, size: 0.06, transparent: true, opacity: 0.9, depthWrite: false })
  );
  scene.add(accent);

  // ---------- Layout ----------
  let mobile = false;
  function layout() {
    const w = innerWidth, h = innerHeight;
    mobile = w < 760;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // visible height/width of the view frustum at the resting distance
    const viewH = 2 * VIEW * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const viewW = viewH * camera.aspect;
    planes.forEach(({ mesh, material }, i) => {
      const a = mesh.userData.aspect;
      let pw = mobile ? viewW * 0.86 : Math.min(viewW * 0.52, 4.2);
      let ph = pw / a;
      const maxH = viewH * (mobile ? 0.42 : 0.62);
      if (ph > maxH) { ph = maxH; pw = ph * a; }
      mesh.scale.set(pw, ph, 1);
      material.uniforms.uSize.value.set(pw, ph);
      const side = i % 2 === 0 ? 1 : -1;
      mesh.userData.x = mobile ? 0 : side * viewW * 0.17;
      mesh.userData.y = mobile ? viewH * 0.12 : 0.15;
      mesh.position.set(mesh.userData.x, mesh.userData.y, -i * GAP);
      mesh.rotation.y = mobile ? 0 : -side * 0.12;
    });
  }
  addEventListener("resize", layout);
  layout();

  // ---------- Scroll ----------
  // ease each segment so the camera lingers on every project
  const linger = (t) => {
    const i = Math.floor(t);
    return i + THREE.MathUtils.smoothstep(t - i, 0.2, 0.8);
  };

  let target = 0; // continuous project position, 0..N-1, plus negative values during the hero
  let current = -1.2;
  let lastCurrent = current;
  let velocity = 0;
  let visible = true;

  function readScroll() {
    const top = work.offsetTop;
    const len = work.offsetHeight - innerHeight;
    const y = scrollY;
    if (y < top) {
      target = -1.2 * (1 - y / top); // hero: camera starts further back
    } else {
      target = linger(Math.min(1, (y - top) / len) * (N - 1));
    }
    hudBar.style.transform = `scaleX(${Math.max(0, Math.min(1, (y - top) / len))})`;
    // fade the canvas once the gallery has scrolled past
    const end = top + work.offsetHeight - innerHeight;
    const fade = 1 - Math.max(0, Math.min(1, (y - end) / (innerHeight * 0.6)));
    canvas.style.opacity = fade;
    visible = fade > 0;
  }
  addEventListener("scroll", readScroll, { passive: true });
  addEventListener("resize", readScroll);
  readScroll();

  // ---------- HUD ----------
  let active = -1;
  function setActive(i) {
    if (i === active) return;
    active = i;
    const p = projects[i];
    hudI.textContent = String(i + 1).padStart(2, "0");
    hudTitle.textContent = p.title;
    hudTitle.href = hudCta.href = p.href;
    hudMeta.textContent = `${p.kind} — ${p.year}`;
    hudTitle.classList.remove("swap");
    void hudTitle.offsetWidth; // restart animation
    hudTitle.classList.add("swap");
    stage.classList.toggle("flip", i % 2 === 1);
  }

  // ---------- Pointer ----------
  const pointer = new THREE.Vector2(-10, -10);
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  const raycaster = new THREE.Raycaster();
  let hovered = null;
  let labelX = 0, labelY = 0;

  addEventListener("pointermove", (e) => {
    pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    mouse.x = pointer.x;
    mouse.y = pointer.y;
    labelX = e.clientX;
    labelY = e.clientY;
  });

  const overGallery = (target) =>
    visible && !target.closest("a, button, .hud") && scrollY < work.offsetTop + work.offsetHeight - innerHeight * 0.5;

  addEventListener("click", (e) => {
    if (hovered && overGallery(e.target)) location.href = projects[hovered.userData.index].href;
  });

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) {
      planes.forEach((p) => p.video && !p.video.paused && p.video.pause());
      return;
    }
    const t = clock.getElapsedTime();

    current += (target - current) * 0.075;
    const delta = current - lastCurrent;
    lastCurrent = current;
    velocity += (THREE.MathUtils.clamp(delta * 12, -1, 1) - velocity) * 0.12;

    // camera follows the path between planes
    const i0 = THREE.MathUtils.clamp(Math.floor(current), 0, N - 1);
    const i1 = Math.min(N - 1, i0 + 1);
    const f = THREE.MathUtils.clamp(current - i0, 0, 1);
    const ease = f * f * (3 - 2 * f);
    const fx = planes[i0].mesh.userData.x, nx = planes[i1].mesh.userData.x;
    const camX = THREE.MathUtils.lerp(fx, nx, ease) * 0.55;

    mouse.sx += (mouse.x - mouse.sx) * 0.05;
    mouse.sy += (mouse.y - mouse.sy) * 0.05;
    camera.position.set(camX + mouse.sx * 0.35, mouse.sy * 0.2, -current * GAP + VIEW);
    camera.lookAt(camX * 0.6, 0, camera.position.z - VIEW);

    // switch once the current plane has started fading out
    setActive(THREE.MathUtils.clamp(Math.floor(current + 0.8), 0, N - 1));

    // hover detection
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(planes.map((p) => p.mesh));
    const hit = hits.find((h) => h.object.material.uniforms.uOpacity.value > 0.5);
    const inGallery = scrollY > work.offsetTop - innerHeight * 0.5 && !mobile;
    hovered = hit && inGallery ? hit.object : null;
    document.body.classList.toggle("hovering-plane", !!hovered);
    cursorLabel.classList.toggle("on", !!hovered);
    cursorLabel.style.translate = `${labelX}px ${labelY}px`;

    planes.forEach(({ mesh, material, video }, i) => {
      const u = material.uniforms;
      const dz = camera.position.z - mesh.position.z; // distance in front of the camera
      // fade in from the distance, fade out as the camera passes through
      const near = THREE.MathUtils.smoothstep(dz, 1.8, 3.4);
      const far = 1 - THREE.MathUtils.smoothstep(dz, GAP * 1.6, GAP * 2.6);
      u.uOpacity.value = near * far;
      u.uTime.value = t;
      u.uVel.value = velocity;
      u.uActive.value += ((i === active ? 1 : 0) - u.uActive.value) * 0.08;
      const h = hovered === mesh ? 1 : 0;
      u.uHover.value += (h - u.uHover.value) * 0.08;
      if (hovered === mesh && hit) u.uMouse.value.lerp(hit.uv, 0.2);
      mesh.position.y = mesh.userData.y + Math.sin(t * 0.6 + i) * 0.04;

      // only decode videos that are on screen
      if (video) {
        const show = u.uOpacity.value > 0.05;
        if (show && video.paused) video.play().catch(() => {});
        else if (!show && !video.paused) video.pause();
      }
    });

    dust.rotation.z = t * 0.01;
    accent.rotation.z = -t * 0.015;
    renderer.render(scene, camera);
  }
  frame();
}
