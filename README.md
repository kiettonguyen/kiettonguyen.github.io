# Kiet Nguyen — Portfolio

A simple, static portfolio site (plain HTML, CSS, and a little JavaScript — no build step). Hosted free on GitHub Pages.

## Editing

- **Text / projects:** edit `index.html`
- **Colors / fonts / layout:** edit `styles.css` (colors are at the top under `:root`)
- **Project images:** replace the files in `images/` (or add new ones and update the `<img src>` paths). JPG, PNG, or WebP all work — 1200×900 (4:3) looks best.

Preview locally by opening `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

Commit and push to `main` — GitHub Pages redeploys automatically within a minute or two.

## Using a custom domain

1. In the repo on GitHub: **Settings → Pages → Custom domain**, enter your domain (e.g. `example.com`) and save. This creates a `CNAME` file in the repo.
2. At your domain registrar, add DNS records:
   - Apex domain (`example.com`): four `A` records pointing to
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www` subdomain: a `CNAME` record pointing to `kiettonguyen.github.io`
3. Once DNS propagates, tick **Enforce HTTPS** in Settings → Pages.
