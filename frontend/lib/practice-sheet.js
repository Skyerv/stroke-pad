const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "backend", "data");
const CEDICT_PATH = path.join(DATA_DIR, "cedict.json");
const STROKES_PATH = path.join(DATA_DIR, "strokes.json");

const HANZI_RANGE = /^[\u3400-\u4dbf\u4e00-\u9fff]$/;
const DEFAULT_TITLE = "Hanzi Practice Sheet";

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "unknown";
  }

  if (Array.isArray(value)) {
    const parts = value.map((item) => String(item).trim()).filter(Boolean);
    return parts.length ? parts.join("; ") : "unknown";
  }

  const text = String(value).trim();
  return text || "unknown";
}

function loadDictionary() {
  const raw = readJson(CEDICT_PATH);
  const normalized = Array.isArray(raw)
    ? raw
    : Object.entries(raw).map(([token, value]) => ({ token, ...value }));

  const map = new Map();
  for (const entry of normalized) {
    if (!entry || typeof entry !== "object" || !entry.token) continue;
    map.set(entry.token, {
      token: entry.token,
      pinyin: normalizeText(entry.pinyin),
      meaning: normalizeText(entry.meaning),
    });
  }
  return map;
}

function loadStrokeMap() {
  const raw = readJson(STROKES_PATH);
  const normalized = Array.isArray(raw)
    ? raw
    : Object.entries(raw).map(([hanzi, value]) => ({ hanzi, ...value }));

  const map = new Map();
  for (const entry of normalized) {
    if (!entry || typeof entry !== "object" || !entry.hanzi) continue;
    map.set(entry.hanzi, {
      hanzi: entry.hanzi,
      strokes: Array.isArray(entry.strokes) ? entry.strokes : [],
    });
  }
  return map;
}

const dictionary = loadDictionary();
const strokeMap = loadStrokeMap();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parsePracticeInput(text) {
  if (!text || !String(text).trim()) {
    return [];
  }

  return String(text)
    .split(/[,\uFF0C]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHanzi(char) {
  return HANZI_RANGE.test(char);
}

function buildEntries(tokens) {
  const entries = [];

  for (const token of tokens) {
    const dictionaryEntry = dictionary.get(token);
    if (dictionaryEntry) {
      entries.push({
        token,
        display_hanzi: token,
        hanzi_chars: Array.from(token),
        pinyin: dictionaryEntry.pinyin,
        meaning: dictionaryEntry.meaning,
        unknown: false,
      });
      continue;
    }

    const chars = Array.from(token).filter(isHanzi);
    if (!chars.length) {
      entries.push({
        token,
        display_hanzi: token,
        hanzi_chars: [],
        pinyin: "unknown",
        meaning: "unknown",
        unknown: true,
      });
      continue;
    }

    const charPinyin = [];
    const charMeanings = [];

    for (const char of chars) {
      const charEntry = dictionary.get(char);
      charPinyin.push(charEntry ? charEntry.pinyin : "unknown");
      charMeanings.push(charEntry ? charEntry.meaning : "unknown");
    }

    entries.push({
      token,
      display_hanzi: token,
      hanzi_chars: chars,
      pinyin: charPinyin.join(" "),
      meaning: charMeanings.join("; "),
      unknown: charPinyin.every((value) => value === "unknown"),
    });
  }

  return entries;
}

function buildEntryStrokes(hanziChars) {
  return hanziChars.map((char) => {
    const item = strokeMap.get(char);
    return item
      ? { hanzi: item.hanzi, strokes: item.strokes }
      : { hanzi: char, strokes: [] };
  });
}

function renderStrokeDiagram(strokePaths, targetIndex) {
  const renderedPaths = strokePaths
    .map((strokePath, index) => {
      const fill = index < targetIndex ? "#222222" : index === targetIndex ? "#e53935" : null;
      if (!fill) return "";
      return `<path d="${escapeHtml(strokePath)}" fill="${fill}"></path>`;
    })
    .join("");

  return `
    <span class="stroke-diagram">
      <svg viewBox="0 0 1024 1024" width="100%" height="100%">
        <g transform="translate(18,1008) scale(0.97,-0.97)">
          ${renderedPaths}
        </g>
      </svg>
    </span>
  `;
}

function renderStrokeSequence(strokeChar) {
  if (!strokeChar.strokes.length) {
    return "";
  }

  const diagrams = strokeChar.strokes
    .map((_, index) => renderStrokeDiagram(strokeChar.strokes, index))
    .join("");

  return `
    <span class="stroke-sequence">
      ${diagrams}
    </span>
  `;
}

function renderEntry(entry, gridCount) {
  const chars = entry.hanzi_chars.length ? entry.hanzi_chars : [entry.display_hanzi];
  const usedCells = chars.length * 3;
  const remainingCells = Math.max(gridCount - usedCells, 0);
  const strokes = Array.isArray(entry.strokes) ? entry.strokes : buildEntryStrokes(entry.hanzi_chars);

  return `
    <section class="entry">
      <div class="pinyin-row">${escapeHtml(entry.pinyin)}</div>
      <div class="practice-row" style="--cols: ${gridCount};">
        ${chars.map((char) => `<div class="grid-cell">${escapeHtml(char)}</div>`).join("")}
        ${chars.map((char) => `<div class="grid-cell trace">${escapeHtml(char)}</div>`).join("")}
        ${chars.map((char) => `<div class="grid-cell trace">${escapeHtml(char)}</div>`).join("")}
        ${Array.from({ length: remainingCells }, () => "<div class=\"grid-cell\"></div>").join("")}
      </div>
      ${chars.length > 2 ? `
        <div class="practice-row" style="--cols: ${gridCount};">
          ${Array.from({ length: gridCount }, () => "<div class=\"grid-cell\"></div>").join("")}
        </div>
      ` : ""}
      <div class="stroke-row">
        ${strokes.map((strokeChar) => `
          <span class="stroke-char">
            ${escapeHtml(strokeChar.hanzi)}
            ${renderStrokeSequence(strokeChar)}
          </span>
        `).join("")}
      </div>
      <div class="meaning">${escapeHtml(entry.meaning)}</div>
    </section>
  `;
}

function buildWorksheetHtml({ title = DEFAULT_TITLE, entries, gridCount }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }

    body {
      margin: 0;
      font-family: "Noto Sans CJK SC", "Microsoft YaHei", Arial, sans-serif;
      color: #222;
      background: white;
    }

    .sheet-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .entry {
      border: 2px solid #777;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }

    .pinyin-row {
      height: 26px;
      border-bottom: 1px solid #b4b4b4;
      display: flex;
      align-items: center;
      padding: 0 8px;
      font-size: 26px;
      letter-spacing: 0.5px;
    }

    .practice-row {
      display: grid;
      grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
      border-bottom: 1px solid #b4b4b4;
      --cell-size: calc(190mm / var(--cols));
    }

    .grid-cell {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      border-right: 1px solid #b8b8b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(20px, calc(var(--cell-size) * 0.56), 72px);
      line-height: 1;
      font-family: "KaiTi", "STKaiti", "Kaiti SC", "Noto Serif CJK SC", serif;
      overflow: hidden;
    }

    .grid-cell:last-child {
      border-right: none;
    }

    .grid-cell::before,
    .grid-cell::after {
      content: "";
      position: absolute;
      background: #d0d0d0;
    }

    .grid-cell::before {
      width: 100%;
      height: 1px;
      top: 50%;
      left: 0;
      transform: translateY(-0.5px);
      border-top: 1px dashed #d0d0d0;
      background: transparent;
    }

    .grid-cell::after {
      height: 100%;
      width: 1px;
      left: 50%;
      top: 0;
      transform: translateX(-0.5px);
      border-left: 1px dashed #d0d0d0;
      background: transparent;
    }

    .trace {
      opacity: 0.22;
    }

    .stroke-row {
      min-height: 56px;
      border-bottom: 1px solid #b4b4b4;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px;
      flex-wrap: wrap;
      font-size: 16px;
    }

    .stroke-char {
      display: inline-flex;
      align-items: flex-start;
      gap: 6px;
      color: #444;
      font-size: 14px;
    }

    .stroke-sequence {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
      max-width: 620px;
    }

    .stroke-diagram {
      width: 26px;
      height: 26px;
      display: inline-flex;
      border: 2px solid #cfcfcf;
      background: #fff;
      overflow: visible;
      flex: 0 0 auto;
    }

    .stroke-diagram svg {
      width: 100%;
      height: 100%;
      display: block;
      overflow: visible;
    }

    .meaning {
      padding: 4px 8px;
      font-size: 17px;
      color: #444;
    }
  </style>
</head>
<body>
  <div class="sheet-title">${escapeHtml(title)}</div>
  ${entries.map((entry) => renderEntry(entry, gridCount)).join("")}
</body>
</html>`;
}

function buildWorksheet({ text, gridCount, title = DEFAULT_TITLE }) {
  const tokens = parsePracticeInput(text);
  const entries = buildEntries(tokens).map((entry) => ({
    ...entry,
    strokes: buildEntryStrokes(entry.hanzi_chars),
  }));

  return {
    tokens,
    entries,
    html: buildWorksheetHtml({
      title,
      entries,
      gridCount,
    }),
  };
}

module.exports = {
  DEFAULT_TITLE,
  buildEntries,
  buildWorksheet,
  buildWorksheetHtml,
  escapeHtml,
  parsePracticeInput,
};
