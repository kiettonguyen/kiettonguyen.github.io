# Kiet Nguyen — Portfolio

Static portfolio site (plain HTML, CSS and JavaScript — no build step), hosted free on GitHub Pages.
There are currently two versions to compare:

| Version | URL | Folder |
| --- | --- | --- |
| Experimental — three.js 3D scroll gallery | https://kiettonguyen.github.io/experimental/ | `experimental/` |
| Plain — simple HTML & CSS | https://kiettonguyen.github.io/plain/ | `plain/` |

https://kiettonguyen.github.io/ is a small page linking to both.

## Structure

```
assets/                 shared images & videos (used by both versions)
  <project>/            NN.png/jpg, NN.mp4 (+ NN-poster.jpg) converted from the original GIFs, NN.gif originals
  about/                personal photos
experimental/
  index.html            home page (project list drives the 3D gallery)
  css/style.css
  js/home.js            three.js scene (loaded from jsDelivr, no install needed)
  js/main.js            scroll reveals, lightbox, video autoplay, list hover preview
  work/<project>/       case-study pages (generated)
plain/
  index.html, style.css, script.js
  work/<project>/       case-study pages (generated)
scripts/build_case_studies.py   case-study content + generator for both versions
```

## Editing

- **Case-study text / images:** edit the content in `scripts/build_case_studies.py`, then run
  `python3 scripts/build_case_studies.py` — this rewrites `experimental/work/` and `plain/work/`.
- **Home pages:** edit `experimental/index.html` / `plain/index.html` directly. In the experimental version,
  each `.project-list` link's `data-cover` (image or `.mp4`) becomes a plane in the 3D gallery.
- **Colours / fonts:** top of each stylesheet under `:root`.

Preview locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
Push to `main` and GitHub Pages redeploys in a minute or two.

## Choosing a version / custom domain

When you've picked one, move that folder's contents to the repo root (adjusting `../assets/` paths to `assets/`)
and delete the other. Then:

1. Repo **Settings → Pages → Custom domain**: enter your domain and save.
2. At your registrar, add DNS records:
   - Apex (`example.com`): `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: `CNAME` → `kiettonguyen.github.io`
3. Once DNS propagates, tick **Enforce HTTPS**.

Note: GitHub Pages on a free account requires the repo to be public. Making it private needs GitHub Pro
(or hosting elsewhere, e.g. Netlify/Cloudflare Pages, which can deploy from a private repo).
