from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from backend.pdf.generator import PdfGenerator
from backend.services.hanzi_service import HanziService
from backend.services.stroke_service import StrokeService


class GenerateRequest(BaseModel):
    text: str = Field(..., min_length=1)
    grid_count: Optional[int] = Field(default=10, ge=4, le=20)


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
TEMPLATES_DIR = BASE_DIR / "templates"

hanzi_service = HanziService(DATA_DIR / "cedict.json")
stroke_service = StrokeService(DATA_DIR / "strokes.json")
pdf_generator = PdfGenerator(TEMPLATES_DIR)

app = FastAPI(title="Hanzi Practice Sheet API", version="0.1.0")


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/generate")
def generate_pdf(request: GenerateRequest):
    tokens = hanzi_service.parse_input(request.text)
    if not tokens:
        raise HTTPException(status_code=400, detail="No valid hanzi tokens were provided.")

    entries = hanzi_service.build_entries(tokens)
    for entry in entries:
        entry["trace_chars"] = [entry["display_hanzi"]] * 2
        entry["strokes"] = stroke_service.get_strokes_for_entry(entry["hanzi_chars"])

    context = {
        "entries": entries,
        "grid_count": request.grid_count or 10,
        "title": "Hanzi Practice Sheet",
    }
    pdf_bytes = pdf_generator.generate_pdf(context)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=hanzi_practice_sheet.pdf"},
    )
