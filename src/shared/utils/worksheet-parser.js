const { APP_CONFIG } = require("../constants/app-config");

const HANZI_CHARACTER_PATTERN = /^[\u3400-\u4dbf\u4e00-\u9fff]$/;

function normalizeDictionaryText(value, fallback = "unknown", separator = "; ") {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (Array.isArray(value)) {
    const parts = value.map((item) => String(item).trim()).filter(Boolean);
    return parts.length ? parts.join(separator) : fallback;
  }

  const text = String(value).trim();
  return text || fallback;
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

function normalizePracticeRows(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return APP_CONFIG.defaultPracticeRows;
  }

  return Math.min(
    Math.max(Math.trunc(parsed), APP_CONFIG.minPracticeRows),
    APP_CONFIG.maxPracticeRows
  );
}

function isHanziCharacter(character) {
  return HANZI_CHARACTER_PATTERN.test(character);
}

function buildEntries(tokens, dictionary) {
  const entries = [];

  for (const token of tokens) {
    const dictionaryEntry = dictionary.get(token);
    if (dictionaryEntry) {
      entries.push({
        token,
        displayHanzi: token,
        hanziCharacters: Array.from(token),
        pinyin: dictionaryEntry.pinyin,
        meaning: dictionaryEntry.meaning,
        unknown: false,
      });
      continue;
    }

    const hanziCharacters = Array.from(token).filter(isHanziCharacter);
    if (!hanziCharacters.length) {
      entries.push({
        token,
        displayHanzi: token,
        hanziCharacters: [],
        pinyin: "unknown",
        meaning: "unknown",
        unknown: true,
      });
      continue;
    }

    const pinyinParts = [];
    const meaningParts = [];

    for (const character of hanziCharacters) {
      const characterEntry = dictionary.get(character);
      pinyinParts.push(characterEntry ? characterEntry.pinyin : "unknown");
      meaningParts.push(characterEntry ? characterEntry.meaning : "unknown");
    }

    entries.push({
      token,
      displayHanzi: token,
      hanziCharacters,
      pinyin: pinyinParts.join(" "),
      meaning: meaningParts.join("; "),
      unknown: pinyinParts.every((value) => value === "unknown"),
    });
  }

  return entries;
}

function buildEntryStrokes(hanziCharacters, strokeMap) {
  return hanziCharacters.map((character) => {
    const strokeEntry = strokeMap.get(character);
    return strokeEntry
      ? { hanzi: strokeEntry.hanzi, strokes: strokeEntry.strokes }
      : { hanzi: character, strokes: [] };
  });
}

module.exports = {
  buildEntries,
  buildEntryStrokes,
  normalizeDictionaryText,
  normalizePracticeRows,
  parsePracticeInput,
};
