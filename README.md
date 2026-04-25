# StrokePad

Desktop Electron app for generating printable Chinese Hanzi practice sheets.

## Stack

- Electron renderer UI: `frontend/`
- Local worksheet/data logic: `frontend/lib/`
- Local dataset: `backend/data/`
- PDF export: Electron `printToPDF`

## Run

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

## Usage

1. Enter comma-separated Hanzi tokens.
2. Adjust the grid count from 4 to 20.
3. Click **Generate PDF**.
4. Choose a save location in the file dialog.

## Notes

- The app runs locally and does not call a backend server.
- Input is split on commas and trimmed.
- Unknown tokens still generate a worksheet with fallback `"unknown"` metadata.
- Hanzi cell text scales with the available practice box size so dense grids stay balanced.
