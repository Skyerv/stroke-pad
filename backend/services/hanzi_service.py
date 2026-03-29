import json
import re
from pathlib import Path
from typing import Any, Dict, List


class HanziService:
    def __init__(self, cedict_path: Path):
        self.cedict_path = cedict_path
        self._dictionary: Dict[str, Dict[str, Any]] = {}
        self._load_data()

    def _load_data(self) -> None:
        with self.cedict_path.open("r", encoding="utf-8") as file:
            raw = json.load(file)
        if isinstance(raw, dict):
            normalized = [{"token": token, **value} for token, value in raw.items()]
        else:
            normalized = raw
        self._dictionary = {
            entry["token"]: {
                "token": entry["token"],
                "pinyin": self._normalize_pinyin(entry.get("pinyin")),
                "meaning": self._normalize_meaning(entry.get("meaning")),
            }
            for entry in normalized
            if isinstance(entry, dict) and entry.get("token")
        }

    @staticmethod
    def _normalize_pinyin(value: Any) -> str:
        if value is None:
            return "unknown"
        if isinstance(value, list):
            parts = [str(item).strip() for item in value if str(item).strip()]
            return " ".join(parts) if parts else "unknown"
        text = str(value).strip()
        return text if text else "unknown"

    @staticmethod
    def _normalize_meaning(value: Any) -> str:
        if value is None:
            return "unknown"
        if isinstance(value, list):
            parts = [str(item).strip() for item in value if str(item).strip()]
            return "; ".join(parts) if parts else "unknown"
        text = str(value).strip()
        return text if text else "unknown"

    @staticmethod
    def parse_input(text: str) -> List[str]:
        if not text or not text.strip():
            return []
        parts = [item.strip() for item in text.split(",")]
        return [item for item in parts if item]

    @staticmethod
    def _is_hanzi(char: str) -> bool:
        # CJK Unified Ideographs basic + extension A ranges are enough for MVP.
        return bool(re.match(r"^[\u3400-\u4dbf\u4e00-\u9fff]$", char))

    def build_entries(self, tokens: List[str]) -> List[Dict[str, Any]]:
        entries: List[Dict[str, Any]] = []
        for token in tokens:
            dictionary_entry = self._dictionary.get(token)
            if dictionary_entry:
                entries.append(
                    {
                        "token": token,
                        "display_hanzi": token,
                        "hanzi_chars": list(token),
                        "pinyin": dictionary_entry.get("pinyin", "unknown"),
                        "meaning": dictionary_entry.get("meaning", "unknown"),
                        "unknown": False,
                    }
                )
                continue

            chars = [char for char in token if self._is_hanzi(char)]
            if not chars:
                entries.append(
                    {
                        "token": token,
                        "display_hanzi": token,
                        "hanzi_chars": [],
                        "pinyin": "unknown",
                        "meaning": "unknown",
                        "unknown": True,
                    }
                )
                continue

            char_pinyin: List[str] = []
            char_meanings: List[str] = []
            for char in chars:
                char_entry = self._dictionary.get(char)
                if char_entry:
                    char_pinyin.append(char_entry.get("pinyin", ""))
                    char_meanings.append(char_entry.get("meaning", ""))
                else:
                    char_pinyin.append("unknown")
                    char_meanings.append("unknown")

            entries.append(
                {
                    "token": token,
                    "display_hanzi": token,
                    "hanzi_chars": chars,
                    "pinyin": " ".join(part for part in char_pinyin if part),
                    "meaning": "; ".join(part for part in char_meanings if part),
                    "unknown": all(part == "unknown" for part in char_pinyin),
                }
            )

        return entries
