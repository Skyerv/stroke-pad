import json
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[3]
HANZI_DATA_DIR = ROOT_DIR / "src" / "data" / "hanzi"
RAW_DATA_DIR = HANZI_DATA_DIR / "raw"
input_file = RAW_DATA_DIR / "graphics.txt"
output_file = HANZI_DATA_DIR / "strokes.json"

data = []

with input_file.open("r", encoding="utf-8") as file:
    for line in file:
        obj = json.loads(line)
        data.append(
            {
                "hanzi": obj["character"],
                "strokes": obj.get("strokes", []),
            }
        )

with output_file.open("w", encoding="utf-8") as file:
    json.dump(data, file, ensure_ascii=False)

print(f"strokes.json generated: {output_file}")