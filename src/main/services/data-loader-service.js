const fs = require("fs/promises");
const path = require("path");
const { HANZI_DATA_DIR } = require("../utils/app-paths");
const { normalizeDictionaryText } = require("../../shared/utils/worksheet-parser");

class DataLoaderService {
  constructor() {
    this.dictionaryPromise = null;
    this.strokeMapPromise = null;
  }

  async getDictionary() {
    if (!this.dictionaryPromise) {
      this.dictionaryPromise = this.loadDictionary();
    }

    return this.dictionaryPromise;
  }

  async getStrokeMap() {
    if (!this.strokeMapPromise) {
      this.strokeMapPromise = this.loadStrokeMap();
    }

    return this.strokeMapPromise;
  }

  async loadDictionary() {
    const filePath = path.join(HANZI_DATA_DIR, "cedict.json");
    const raw = JSON.parse(await fs.readFile(filePath, "utf8"));
    const normalized = Array.isArray(raw)
      ? raw
      : Object.entries(raw).map(([token, value]) => ({ token, ...value }));

    return normalized.reduce((dictionary, entry) => {
      if (!entry || typeof entry !== "object" || !entry.token) {
        return dictionary;
      }

      dictionary.set(entry.token, {
        token: entry.token,
        pinyin: normalizeDictionaryText(entry.pinyin, "unknown", " "),
        meaning: normalizeDictionaryText(entry.meaning),
      });
      return dictionary;
    }, new Map());
  }

  async loadStrokeMap() {
    const filePath = path.join(HANZI_DATA_DIR, "strokes.json");
    const raw = JSON.parse(await fs.readFile(filePath, "utf8"));
    const normalized = Array.isArray(raw)
      ? raw
      : Object.entries(raw).map(([hanzi, value]) => ({ hanzi, ...value }));

    return normalized.reduce((strokeMap, entry) => {
      if (!entry || typeof entry !== "object" || !entry.hanzi) {
        return strokeMap;
      }

      strokeMap.set(entry.hanzi, {
        hanzi: entry.hanzi,
        strokes: Array.isArray(entry.strokes) ? entry.strokes : [],
      });
      return strokeMap;
    }, new Map());
  }
}

module.exports = {
  DataLoaderService,
};
