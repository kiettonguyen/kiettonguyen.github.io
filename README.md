# Kiet Nguyen — Portfolio

Static portfolio site (plain HTML, CSS and JavaScript — no build step), hosted free on GitHub Pages at
**https://kietn.com** (domain registered at Wix, DNS pointed at GitHub Pages).

| Version | URL | Folder |
| --- | --- | --- |
| Main site — paper-board design | https://kietn.com/ | repo root |
| Experimental — three.js board (not linked from the main site) | https://kietn.com/experimental/ | `experimental/` |

## Structure

```
assets/                 shared images & videos (used by both versions)
  <project>/            NN.png/jpg, NN.mp4 (+ NN-poster.jpg) converted from the original GIFs, NN.gif originals
  about/                personal photos
  doodles/              hand-drawn SVGs (underline, arrow, sparkle, tape)
shared/board.css        whiteboard theme shared by both versions (dotted board, cards, sticky notes, case studies)
index.html, style.css, script.js   main site (plain)
work/<project>/         main-site case-study pages (generated)
CNAME                   custom domain for GitHub Pages
experimental/
  index.html            home page (project list drives the 3D gallery)
  css/style.css
  js/home.js            three.js whiteboard scene (loaded from jsDelivr, no install needed)
  js/main.js            scroll reveals, lightbox, video autoplay, list hover preview
  work/<project>/       case-study pages (generated)
scripts/build_case_studies.py   case-study content + generator for both versions
```

## Editing

- **Case-study text / images:** edit the content in `scripts/build_case_studies.py`, then run
  `python3 scripts/build_case_studies.py` — this rewrites `work/` and `experimental/work/`.
- **Home pages:** edit `index.html` / `experimental/index.html` directly. In the experimental version,
  each `.project-list` link's `data-cover` (image or `.mp4`) becomes a card on the 3D board, and an
  optional `data-note` adds a sticky note beside it.
- **Colours / fonts:** `:root` at the top of `shared/board.css` (fonts: Bricolage Grotesque, Inter, Caveat).

Preview locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
Push to `main` and GitHub Pages redeploys in a minute or two.

## Domain (kietn.com)

The domain is registered at Wix; its DNS records (in Wix: Domains → kietn.com → Manage DNS records) point at GitHub Pages:

- `A` records for `kietn.com` (host `@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` for `www`: `kiettonguyen.github.io`

The `CNAME` file in this repo tells GitHub Pages to serve the site on kietn.com. HTTPS is enforced in
repo Settings → Pages.

Note: GitHub Pages on a free account requires the repo to be public. A private repo needs GitHub Pro,
or a host that deploys from private repos (e.g. Cloudflare Pages, Netlify).
