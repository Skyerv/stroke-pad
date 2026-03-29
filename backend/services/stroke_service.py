import json
from pathlib import Path
from typing import Any, Dict, List


class StrokeService:
    def __init__(self, strokes_path: Path):
        self.strokes_path = strokes_path
        self._strokes_map: Dict[str, Dict[str, Any]] = {}
        self._load_data()

    def _load_data(self) -> None:
        with self.strokes_path.open("r", encoding="utf-8") as file:
            raw = json.load(file)
        if isinstance(raw, dict):
            normalized = [{"hanzi": key, **value} for key, value in raw.items()]
        else:
            normalized = raw

        self._strokes_map = {
            entry["hanzi"]: {
                "hanzi": entry["hanzi"],
                "strokes": entry.get("strokes", []),
            }
            for entry in normalized
            if isinstance(entry, dict) and entry.get("hanzi")
        }

    def get_strokes_for_entry(self, hanzi_chars: List[str]) -> List[Dict[str, Any]]:
        result: List[Dict[str, Any]] = []
        for char in hanzi_chars:
            item = self._strokes_map.get(char)
            if item:
                result.append(item)
            else:
                result.append({"hanzi": char, "strokes": []})
        return result
