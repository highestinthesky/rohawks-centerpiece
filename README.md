# RoHawks 3419 — Scroll Centerpiece (Prototype)

A tech-company–style hero page where a robot rotates as you scroll — built with the
**Apple-style image-sequence** technique (a pre-rendered frame sequence scrubbed on scroll)
plus **anime.js** for the text/UI choreography. No 3D engine required, so it drops straight
into the existing WordPress site.

## Run it (Vite dev server — live reload)
Runs on **your** machine. Needs Node.js 18+ (`node -v` to check; if missing, install from nodejs.org).
```
cd "rohawks-centerpiece"
npm install      # first time only — pulls Vite
npm run dev      # opens http://localhost:5173 and live-reloads on every save
```
Edit `index.html`, hit save, and the browser updates instantly. Stop the server with Ctrl+C.

Production build (for deploying/embedding): `npm run build` → outputs a ready-to-host `dist/` folder.

> Note: because the robot frames now live in `public/frames/`, just double-clicking
> `index.html` (file://) won't load them anymore — use `npm run dev`.

## What's a placeholder vs. final
- `public/frames/frame_000.png … frame_119.png` — **PLACEHOLDER** baseplate. Swap these
  for renders of your real CAD part (same names, same count, transparent PNG, square canvas).
- Everything in `index.html` (layout, scroll math, captions, colors) is the real page.

## Swapping in your real robot
1. In your CAD tool, set up a **360° turntable** of the robot (or an assembly/explode
   animation) with a transparent background.
2. Export **120 PNG frames** (or change `FRAME_COUNT` in `index.html` to match your count).
3. Name them `frame_000.png` … and drop them in `public/frames/`. Done.

Exact export steps depend on your CAD program (Onshape / Fusion 360 / SolidWorks) — tell me
which one and I'll give you the precise click-path.

## Embedding into the WordPress site
- Run `npm run build`, then upload the generated `dist/` folder to the site.
- In Elementor, embed via `<iframe>` pointing at the uploaded `dist/index.html`,
  or paste the built markup into an **HTML widget** / "Custom HTML" block.
- Brand accent is the CSS variable `--accent` (RoHawks purple, top of `index.html`).

## Deploy to GitHub Pages (automated)
Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and
publishes it — you never commit the `dist/` folder.

One-time setup:
1. Make this `rohawks-centerpiece` folder a git repo and push it to GitHub:
   ```
   git init -b main
   git add .
   git commit -m "RoHawks scroll centerpiece"
   git remote add origin https://github.com/<you>/rohawks-centerpiece.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Wait for the Actions run to finish — your site is at
   `https://<you>.github.io/rohawks-centerpiece/`.

Every `git push` after that redeploys automatically. `base: './'` in `vite.config.js`
is what makes assets resolve under the `/<repo>/` path — keep it.

## Tunable knobs (top of the `<style>` and `<script>`)
- `--accent`, `--ink`, `--bg`, `--bg2` — palette
- `.stage { height: 460vh }` — longer = slower, more cinematic scrub
- `FRAME_COUNT` — number of frames
- caption `data-at="0.18"` values — where each callout appears (0–1 scroll progress)
