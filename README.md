# StrokePad

Electron desktop app for generating printable Hanzi practice sheets.

## Project Layout

```text
src/
  assets/
  data/
    hanzi/
      raw/
    hsk/
  main/
  preload/
  renderer/
  shared/
test/
tools/
  data-prep/
  legacy-backend/
```

## Commands

```powershell
npm install
npm start
npm test
npm run build
```

## Notes

- The app runs fully locally inside Electron.
- `src/main` owns lifecycle, IPC, native dialogs, and file access.
- `src/preload` exposes a narrow, explicit API surface.
- `src/renderer` contains only UI logic and user interaction code.
- `src/data/hsk` is the source of truth for HSK lesson content.
- `src/data/hanzi` now holds the dictionary, stroke data, and raw source files used to build them.
- `tools/data-prep` contains the Python scripts used to regenerate the Hanzi datasets.
- `tools/legacy-backend` is an archived reference of the removed FastAPI implementation and is not part of the Electron runtime.
