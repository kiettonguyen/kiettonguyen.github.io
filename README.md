# Kiet Nguyen — Portfolio

Static portfolio site (plain HTML, CSS and JavaScript — no build step), hosted free on GitHub Pages at
**https://kiettonguyen.github.io/** (moving to kietn.com once the domain transfer to Porkbun completes).

## Structure

```
assets/                 images & videos
  <project>/            NN.png/jpg, NN.mp4 (+ NN-poster.jpg) converted from the original GIFs, NN.gif originals
  about/                personal photos
  doodles/              hand-drawn SVGs (underline, arrow, sparkle, tape)
shared/board.css        paper theme, figure labels, case-study layout, glass droplet + ink-arrow cursor
index.html              home page
style.css               home page layout (hero figure notes, numbered work columns, about)
script.js               slow-scrolling dots, cursor drift, droplet + arrow cursor, lightbox, video autoplay
work/<project>/         case-study pages (generated)
scripts/build_case_studies.py   case-study content + generator
```

## Editing

- **Case-study text / images:** edit the content in `scripts/build_case_studies.py`, then run
  `python3 scripts/build_case_studies.py` — this rewrites `work/`.
- **Home page:** edit `index.html` directly.
- **Colours / fonts:** `:root` at the top of `shared/board.css` (fonts: Zen Kaku Gothic New, Klee One for the 阮 mark).
- **Cache:** CSS/JS links end in `?v=N`. Bump N in `index.html`, `work/*/index.html` and the generator after changing them, so visitors skip their cached copy.

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

## Credits

The 阮 intro animation uses stroke data from [Make Me a Hanzi](https://github.com/skishore/makemeahanzi)
(via hanzi-writer-data), derived from Arphic fonts under the Arphic Public License — see `licenses/ARPHICPL.txt`.
