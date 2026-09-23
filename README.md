# StrokePad

Electron desktop app for generating printable Hanzi practice sheets.

## Project Layout

```text
core/                 # platform-agnostic engine + data (shared by all shells)
  worksheet/          # worksheet builder / parser / HTML generator
  constants/          # app-config
  hsk/                # HSK book/lesson vocabulary
apps/
  desktop/            # Electron shell (main / preload / renderer / shared / assets)
  web/                # static web app (Vite) — planned
data/
  hanzi/              # dictionary + stroke data (+ raw sources); build input
scripts/              # data generators (generate-hsk-data.js, ...)
test/
tools/
  data-prep/
```

## Commands

```powershell
npm install

# Desktop (Electron)
npm start                 # run the desktop app
npm run build             # package the desktop app (electron-builder)

# Web (static site, no backend)
npm run build:web-data    # generate apps/web/public/data from data/hanzi + core/hsk
npm run dev:web           # Vite dev server (http://localhost:5173)
npm run build:web         # build:web-data + production build -> apps/web/dist
npm run preview:web       # preview the production build locally

# Shared
npm test                  # run the core + url-state test suites
npm run generate:hsk      # regenerate core/hsk/*.js from the HSK CSVs
```

## Notes

- The desktop app runs fully locally inside Electron.
- `apps/desktop/main` owns lifecycle, IPC, native dialogs, and file access.
- `apps/desktop/preload` exposes a narrow, explicit API surface.
- `apps/desktop/renderer` contains only UI logic and user interaction code.
- `core/` is platform-agnostic and shared: the worksheet engine, app config, and HSK data.
- `core/hsk` is the source of truth for HSK lesson content.
- `data/hanzi` holds the dictionary, stroke data, and raw source files used to build them.
- `tools/data-prep` contains the Python scripts used to regenerate the Hanzi datasets.

## Web app

`apps/web` is a static, no-backend Vite site that reuses the same `core/` worksheet engine as the
desktop app. It generates the worksheet HTML in the browser and prints it (Print → Save as PDF).

- **Data:** `npm run build:web-data` shards `data/hanzi` into `apps/web/public/data/` — a small preset
  dictionary loaded once, per-book stroke bundles fetched on demand, and codepoint-bucketed shards fetched
  lazily for arbitrary characters. The generated `apps/web/public/data/` is git-ignored; `build:web` and
  deploys regenerate it.
- **Features:** live on-screen preview, shareable preset URLs (`?book=4b&lesson=11&rows=2`), and PWA
  (installable + offline via a service worker that caches the app shell and any data shards you have used).
- **Deploy:** any static host. On Netlify/Vercel, build command `npm run build:web`, publish directory
  `apps/web/dist`. For a GitHub Pages *project* site served under a sub-path, set Vite `base` to
  `"/<repo>/"` in `vite.config.js` before building (root/`base: "/"` is the default and works for
  Netlify/Vercel and local preview).
