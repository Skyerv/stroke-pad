# Hanzi Practice Sheet Generator (MVP)

Desktop app (Electron + FastAPI) that generates Chinese hanzi writing practice sheets as printable PDFs.

## Stack

- Frontend desktop: Electron + Vanilla HTML/CSS/JS (`frontend/`)
- Backend API: FastAPI (`backend/`)
- PDF generation: Jinja2 HTML template + Playwright Chromium
- Data source (local MVP examples): `backend/data/cedict.json`, `backend/data/strokes.json`

## Project Structure

```text
stroke-pad/
├── frontend/
│   ├── main.js
│   ├── preload.js
│   ├── index.html
│   ├── renderer.js
│   └── styles.css
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── services/
│   │   ├── hanzi_service.py
│   │   └── stroke_service.py
│   ├── templates/
│   │   └── worksheet.html
│   ├── pdf/
│   │   └── generator.py
│   └── data/
│       ├── cedict.json
│       └── strokes.json
└── package.json
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (tested with 3.13)

## Setup (Windows PowerShell)

From project root:

1) Install Node dependencies

```powershell
npm install
```

2) Install Python dependencies

```powershell
python -m pip install -r "backend/requirements.txt"
```

3) Install Playwright Chromium runtime

```powershell
python -m playwright install chromium
```

## Run

### Option A: Run both frontend + backend together

```powershell
npm run dev
```

### Option B: Run separately

Terminal 1 (backend):

```powershell
npm run backend
```

Terminal 2 (frontend):

```powershell
npm run frontend
```

Backend endpoint:
- `POST http://127.0.0.1:8000/generate`
- JSON body:

```json
{
  "text": "安装, 岸, 暗, 熬夜, 把握, 摆",
  "grid_count": 10
}
```

Response:
- `application/pdf`

## UI Usage

1. Open app window.
2. Paste comma-separated hanzi or words.
3. (Optional) adjust grid count (4-20).
4. Click **Generate PDF**.
5. Choose save location in file dialog.

## Notes and MVP Behavior

- UTF-8 is used throughout.
- Input is split by comma and trimmed.
- Multi-character words are supported (`安装`, `熬夜`, `把握`).
- If token is missing in dataset, app still generates PDF with `"unknown"` fallback fields.
- Data files are loaded once in memory at backend startup.

## Example Verification Done

The backend generation flow was verified by running:

```powershell
python -c "from pathlib import Path; from backend.main import GenerateRequest, generate_pdf; resp = generate_pdf(GenerateRequest(text='安装, 岸, 暗, 熬夜, 把握, 摆', grid_count=10)); Path('output').mkdir(exist_ok=True); Path('output/sample.pdf').write_bytes(resp.body); print('wrote', len(resp.body))"
```

This produced `output/sample.pdf`.
