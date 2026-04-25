import re
import json
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]
HANZI_DATA_DIR = ROOT_DIR / "src" / "data" / "hanzi"
RAW_DATA_DIR = HANZI_DATA_DIR / "raw"
input_file = RAW_DATA_DIR / "cedict_ts.u8"
output_file = HANZI_DATA_DIR / "cedict.json"

data = {}

pattern = re.compile(r"(\S+)\s(\S+)\s\[(.*?)\]\s/(.*)/")

TONE_MARKS = {
    "a": ["a", "Ä", "Ã¡", "ÇŽ", "Ã "],
    "e": ["e", "Ä“", "Ã©", "Ä›", "Ã¨"],
    "i": ["i", "Ä«", "Ã­", "Ç", "Ã¬"],
    "o": ["o", "Å", "Ã³", "Ç’", "Ã²"],
    "u": ["u", "Å«", "Ãº", "Ç”", "Ã¹"],
    "Ã¼": ["Ã¼", "Ç–", "Ç˜", "Çš", "Çœ"],
}

SYLLABLE_PATTERN = re.compile(r"^([a-zÃ¼:v]+)([1-5])$", flags=re.IGNORECASE)

def _mark_syllable(syllable: str) -> str:
    s = syllable.strip().lower().replace("u:", "Ã¼").replace("v", "Ã¼")
    match = SYLLABLE_PATTERN.match(s)
    if not match:
        return re.sub(r"[1-5]", "", s)

    base, tone_digit = match.groups()
    tone = int(tone_digit)
    if tone == 5:
        return base

    vowel_index = -1
    vowel_char = ""

    for preferred in ("a", "e"):
        idx = base.find(preferred)
        if idx != -1:
            vowel_index = idx
            vowel_char = preferred
            break

    if vowel_index == -1 and "ou" in base:
        vowel_index = base.find("o")
        vowel_char = "o"

    if vowel_index == -1:
        for idx in range(len(base) - 1, -1, -1):
            char = base[idx]
            if char in TONE_MARKS:
                vowel_index = idx
                vowel_char = char
                break

    if vowel_index == -1:
        return base

    marked_vowel = TONE_MARKS[vowel_char][tone]
    return f"{base[:vowel_index]}{marked_vowel}{base[vowel_index + 1:]}"

def tone_to_mark(pinyin: str) -> str:
    parts = [item for item in pinyin.split() if item]
    return " ".join(_mark_syllable(part) for part in parts)

with input_file.open("r", encoding="utf-8") as file:
    for line in file:
        if line.startswith("#"):
            continue
        
        match = pattern.match(line)
        if not match:
            continue

        trad, simp, pinyin, meaning = match.groups()

        meanings = [item for item in meaning.split("/") if item]

        data[simp] = {
            "pinyin": tone_to_mark(pinyin),
            "meaning": "; ".join(meanings[:3])
        }

normalized = [{"token": token, **values} for token, values in data.items()]

with output_file.open("w", encoding="utf-8") as file:
    json.dump(normalized, file, ensure_ascii=False)

print(f"cedict.json generated: {output_file}")