# Kiet Nguyen — Portfolio

Static portfolio site (plain HTML, CSS and JavaScript — no build step), hosted free on GitHub Pages at
**https://kiettonguyen.github.io/** (moving to kietn.com once the domain transfer to Porkbun completes).

## Structure

```
assets/                 images & videos
  <project>/            NN.png/jpg, NN.mp4 (+ NN-poster.jpg) converted from the original GIFs, NN.gif originals
  about/                personal photos
  doodles/              hand-drawn SVGs (underline, arrow, sparkle, tape)
shared/board.css        Ink + Paper theme (dotted paper, header, about, case-study layout)
index.html              home page
style.css               home page layout (hero figure notes, work columns, about)
script.js               cursor parallax, lightbox, video autoplay, footer year
work/<project>/         case-study pages (generated)
scripts/build_case_studies.py   case-study content + generator
```

## Editing

- **Case-study text / images:** edit the content in `scripts/build_case_studies.py`, then run
  `python3 scripts/build_case_studies.py` — this rewrites `work/`.
- **Home page:** edit `index.html` directly.
- **Colours / fonts:** `:root` at the top of `shared/board.css` (font: Zen Kaku Gothic New).

Preview locally: `python3 -m http.server` in this folder, then open http://localhost:8000.
Push to `main` and GitHub Pages redeploys in a minute or two.

## Domain (kietn.com) — pending

kietn.com is being transferred from Wix to Porkbun. Once it's there, add these DNS records in Porkbun:

- `A` records for `kietn.com` (host `@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` for `www`: `kiettonguyen.github.io`

Then set the custom domain to `kietn.com` in repo Settings → Pages (this adds a `CNAME` file) and tick
**Enforce HTTPS** once the certificate is issued.

Note: GitHub Pages on a free account requires the repo to be public. A private repo needs GitHub Pro,
or a host that deploys from private repos (e.g. Cloudflare Pages, Netlify).
