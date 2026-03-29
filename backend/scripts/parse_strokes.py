import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[1]
input_file = BASE_DIR / "data" / "graphics.txt"
output_file = BASE_DIR / "data" / "strokes.json"

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