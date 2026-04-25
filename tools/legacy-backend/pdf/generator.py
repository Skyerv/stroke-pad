from pathlib import Path
from typing import Any, Dict

from jinja2 import Environment, FileSystemLoader, select_autoescape
from playwright.sync_api import sync_playwright


class PdfGenerator:
    def __init__(self, template_dir: Path):
        self.environment = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=select_autoescape(["html", "xml"]),
        )

    def _render_html(self, context: Dict[str, Any]) -> str:
        template = self.environment.get_template("worksheet.html")
        return template.render(**context)

    def generate_pdf(self, context: Dict[str, Any]) -> bytes:
        html = self._render_html(context)
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page.set_content(html, wait_until="networkidle")
            pdf_bytes = page.pdf(
                format="A4",
                print_background=True,
                margin={"top": "10mm", "right": "10mm", "bottom": "10mm", "left": "10mm"},
            )
            browser.close()
        return pdf_bytes
