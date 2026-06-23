# Wedding Performers Directory

A fast, static directory site. No server, no database, no monthly hosting bill —
it builds to plain HTML and deploys free on Cloudflare Pages. Adding a performer
is one small text file plus their photos.

Built with [Astro](https://astro.build). Tested and building cleanly.

---

## What you need (you already have these)
- A Cloudflare account (signed up ✅)
- A domain from IONOS (bought ✅)
- A free GitHub account — make one at github.com if you haven't
- Node.js 18+ on your machine — get it from nodejs.org

---

## STEP 1 — Run it on your own machine first

Open a terminal in this folder and run:

```bash
npm install
npm run dev
```

Open the link it prints (usually http://localhost:4321). You'll see the 3 sample
performers. Edit anything, the page reloads instantly. This is your sandbox —
nothing here is public yet.

To check the final production build at any time:

```bash
npm run build
```

---

## STEP 2 — Add a real performer (the easy part)

Each performer is ONE file in `src/content/performers/`.

1. Copy an existing file, e.g. `aliya.md`, and rename it (e.g. `sana.md`).
2. Drop that person's photos into the **same folder** (`src/content/performers/`).
3. Edit the top of the file:

```markdown
---
name: "Sana"
city: "Islamabad"
role: "Mehndi night & dholki"
phone: "+92 300 0000000"
images:
  - "./sana-1.jpg"
  - "./sana-2.jpg"
instagram: "https://instagram.com/sana"
tiktok: "https://tiktok.com/@sana"
# facebook and x just left out — every social is optional
---
```

Rules the site enforces for you automatically:
- **1 to 4 photos** — fewer than 1 or more than 4 will fail the build (a safety net).
- **name, city, role, phone** are required.
- **tiktok / facebook / instagram / x** are all optional — delete any line you don't need.
- `featured: true` pins someone to the top. Leave it out for normal order.

That's it. No HTML to write — the card builds itself from these fields.

> Prefer a form instead of editing files? See "Optional: form-based editing" at the bottom.

---

## STEP 3 — Add your Adsterra ads

Open `src/layouts/Base.astro`. Near the top of `<head>` there's a marked spot:

```html
<!-- ADSTERRA — paste your Adsterra <script> tag(s) here. -->
```

Paste your Adsterra script there and it loads on every page. For banner spots
inside the page, there are two empty `<div>` slots in `src/pages/index.astro`
labelled `ad-top` and `ad-inline` you can drop banner code into.

---

## STEP 4 — Put the code on GitHub

1. Create a new **empty** repository on github.com (keep it Private if you like).
2. In this folder, run (replace the URL with your repo's):

```bash
git init
git add .
git commit -m "Initial directory site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

---

## STEP 5 — Deploy on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Pick your repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy.** First build takes ~1–2 minutes. You'll get a free
   `your-project.pages.dev` URL — check it works.

From now on, every `git push` redeploys automatically.

---

## STEP 6 — Connect your IONOS domain

Easiest, most reliable path is to move DNS to Cloudflare (free) so the apex
domain works cleanly:

1. Cloudflare dashboard → **Add a site** → type your domain → pick the **Free** plan.
2. Cloudflare shows you **2 nameservers** (e.g. `xxx.ns.cloudflare.com`).
3. Log into **IONOS → your domain → Nameserver settings** → switch to
   "use custom/external nameservers" → paste Cloudflare's two nameservers → save.
   (Propagation can take anywhere from minutes to a few hours.)
4. Back in Cloudflare **Pages → your project → Custom domains → Set up a domain** →
   enter your domain. Cloudflare wires up the DNS records for you.

Done. Your site is live on your domain with free SSL.

---

## How the pieces fit (for when you want to change things)

```
src/
  content.config.ts        ← the data model (the fields each performer has)
  content/performers/      ← ONE .md file + photos per performer  ← you edit here most
  components/PerformerCard.astro  ← the look of a single card
  pages/index.astro        ← the homepage: grid, city filter, ad slots
  layouts/Base.astro       ← <head>, fonts, Adsterra slot, footer
  styles/global.css        ← colours, fonts, spacing (design tokens at the top)
```

To change the colour scheme, edit the `:root` variables at the top of
`src/styles/global.css` — everything pulls from there.

---

## One honest note on the phone number

The "Show number" button hides the number visually until tapped, which is what
you asked for. But on a static site the number still technically exists in the
page's source code, so a determined scraper could read it. For a normal visitor
browsing the site, it's hidden until they tap — totally fine for most cases.

If you ever want the number to be **truly** absent from the page until clicked
(so bots can't harvest it), the upgrade is a small Cloudflare Pages Function that
serves the number on demand. Say the word and I'll add it — it's about 20 lines.

---

## Optional: form-based editing (no code)

If you'd rather fill a form than edit files, this repo already includes a
`.pages.yml`. Once your code is on GitHub:

1. Go to https://pagescms.org and sign in with GitHub.
2. Authorise it and pick this repo.
3. You get a web dashboard: click "Add performer", fill name / city / role /
   phone, drag in the photos, leave socials blank when there aren't any, hit save.
   It commits to GitHub for you and Cloudflare rebuilds automatically.

This is the closest thing to a wp-admin experience, with no server to run.
