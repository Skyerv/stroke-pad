const { APP_CONFIG } = require("../constants/app-config");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderStrokeDiagram(strokePaths, targetIndex) {
  const renderedPaths = strokePaths
    .map((strokePath, index) => {
      const fill = index < targetIndex ? "#222222" : index === targetIndex ? "#e53935" : null;
      return fill ? `<path d="${escapeHtml(strokePath)}" fill="${fill}"></path>` : "";
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

function renderStrokeSequence(strokeCharacter) {
  if (!strokeCharacter.strokes.length) {
    return "";
  }

  return `
    <span class="stroke-sequence">
      ${strokeCharacter.strokes
        .map((_, index) => renderStrokeDiagram(strokeCharacter.strokes, index))
        .join("")}
    </span>
  `;
}

function renderPracticeRowCells(characters) {
  const visibleCharacters = characters.slice(0, APP_CONFIG.practiceColumns);
  const remainingCells = Math.max(APP_CONFIG.practiceColumns - visibleCharacters.length, 0);

  return `
    ${visibleCharacters
      .map((character) => `<div class="grid-cell practice-cell">${escapeHtml(character)}</div>`)
      .join("")}
    ${Array.from({ length: remainingCells }, () => '<div class="grid-cell"></div>').join("")}
  `;
}

function renderEntry(entry, practiceRows) {
  const characters = entry.hanziCharacters.length ? entry.hanziCharacters : [entry.displayHanzi];
  const rowMarkup = Array.from({ length: practiceRows }, () => `
    <div class="practice-row">
      ${renderPracticeRowCells(characters)}
    </div>
  `).join("");

  return `
    <section class="entry">
      <div class="pinyin-row">${escapeHtml(entry.pinyin)}</div>
      ${rowMarkup}
      <div class="stroke-row">
        ${entry.strokes
          .map((strokeCharacter) => `
            <span class="stroke-char">
              ${escapeHtml(strokeCharacter.hanzi)}
              ${renderStrokeSequence(strokeCharacter)}
            </span>
          `)
          .join("")}
      </div>
      <div class="meaning">${escapeHtml(entry.meaning)}</div>
    </section>
  `;
}

function buildWorksheetHtml({ title, entries, practiceRows }) {
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
      min-height: 26px;
      border-bottom: 1px solid #b4b4b4;
      display: flex;
      align-items: center;
      padding: 0 8px;
      font-size: 26px;
      letter-spacing: 0.5px;
    }

    .practice-row {
      display: grid;
      grid-template-columns: repeat(${APP_CONFIG.practiceColumns}, minmax(0, 1fr));
      border-bottom: 1px solid #b4b4b4;
      --cell-size: calc(190mm / ${APP_CONFIG.practiceColumns});
    }

    .grid-cell {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      border-right: 1px solid #b8b8b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: clamp(22px, calc(var(--cell-size) * 0.75), 76px);
      line-height: 1;
      font-family: "KaiTi", "STKaiti", "Kaiti SC", "Noto Serif CJK SC", serif;
      overflow: hidden;
    }

    .practice-cell {
      opacity: 0.28;
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
  ${entries.map((entry) => renderEntry(entry, practiceRows)).join("")}
</body>
</html>`;
}

module.exports = {
  buildWorksheetHtml,
  escapeHtml,
};
