/**
 * Build-time generator for the static web app's hanzi data.
 *
 * Reads the big source datasets in `data/hanzi/` and emits, into
 * `apps/web/public/data/`:
 *
 *   presets/dict.json              — pinyin/meaning for every HSK preset word
 *                                     and component character (small; loaded once).
 *   presets/strokes-<bookId>.json  — stroke data for every character used in that
 *                                     book (fetched once when the book is selected).
 *   dict/<bucket>.json             — general dictionary shards, bucketed by the
 *   strokes/<bucket>.json            first character's codepoint (for arbitrary input).
 *   manifest.json                  — { bucketCount, dictBuckets[], strokeBuckets[] }.
 *
 * The website never ships the 35 MB source whole: preset data is tiny and the
 * general shards are fetched lazily, only for the buckets a request touches.
 *
 * Usage:  node scripts/build-web-data.js
 */

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const HANZI_DIR = path.join(__dirname, "..", "data", "hanzi");
const OUT_DIR = path.join(__dirname, "..", "apps", "web", "public", "data");

const BUCKET_COUNT = 128;
const HANZI_CHARACTER_PATTERN = /^[㐀-䶿一-鿿]$/;

function isHanzi(character) {
  return HANZI_CHARACTER_PATTERN.test(character);
}

function bucketOf(key) {
  return key.codePointAt(0) % BUCKET_COUNT;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(HANZI_DIR, file), "utf8"));
}

function toEntries(raw, keyName) {
  // Accept either an array of objects or a keyed object map.
  if (Array.isArray(raw)) {
    return raw;
  }
  return Object.entries(raw).map(([key, value]) => ({ [keyName]: key, ...value }));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data), "utf8");
}

async function main() {
  // core/ is ESM; load it via dynamic import so this CJS script works on any
  // Node version (require(esm) needs Node >= 22.12, which the build host may lack).
  const hskModuleUrl = pathToFileURL(path.join(__dirname, "..", "core", "hsk", "index.js")).href;
  const { HSK_LESSON_DATA, getBooks } = await import(hskModuleUrl);

  console.log("Reading source datasets…");
  const dictEntries = toEntries(readJson("cedict.json"), "token").filter((e) => e && e.token);
  const strokeEntries = toEntries(readJson("strokes.json"), "hanzi").filter((e) => e && e.hanzi);

  const dictByToken = new Map(
    dictEntries.map((e) => [e.token, { token: e.token, pinyin: e.pinyin, meaning: e.meaning }])
  );
  const strokeByHanzi = new Map(
    strokeEntries.map((e) => [e.hanzi, { hanzi: e.hanzi, strokes: Array.isArray(e.strokes) ? e.strokes : [] }])
  );

  ensureDir(OUT_DIR);

  // ---- HSK dropdown data (books + lessons) ---------------------------------
  // Emitted as JSON so the web app fetches it instead of importing the CJS module.
  writeJson(path.join(OUT_DIR, "hsk.json"), {
    books: getBooks(),
    lessons: HSK_LESSON_DATA.lessons,
  });

  // ---- Preset bundles ------------------------------------------------------
  console.log("Building preset bundles…");
  const presetDictKeys = new Set();
  const presetDict = [];

  for (const book of getBooks()) {
    const bookLessons = HSK_LESSON_DATA.lessons[book.id] || {};
    const bookChars = new Set();

    for (const words of Object.values(bookLessons)) {
      for (const word of words) {
        // whole-word dict entry
        if (!presetDictKeys.has(word) && dictByToken.has(word)) {
          presetDictKeys.add(word);
          presetDict.push(dictByToken.get(word));
        }
        // component characters
        for (const ch of word) {
          if (!isHanzi(ch)) continue;
          bookChars.add(ch);
          if (!presetDictKeys.has(ch) && dictByToken.has(ch)) {
            presetDictKeys.add(ch);
            presetDict.push(dictByToken.get(ch));
          }
        }
      }
    }

    const bookStrokes = [...bookChars]
      .map((ch) => strokeByHanzi.get(ch))
      .filter(Boolean);
    writeJson(path.join(OUT_DIR, "presets", `strokes-${book.id}.json`), bookStrokes);
    console.log(`  ${book.label.padEnd(8)} → strokes-${book.id}.json (${bookStrokes.length} chars)`);
  }

  writeJson(path.join(OUT_DIR, "presets", "dict.json"), presetDict);
  console.log(`  preset dict → dict.json (${presetDict.length} entries)`);

  // ---- General shards ------------------------------------------------------
  console.log("Building general shards…");
  const dictBuckets = new Map();
  for (const entry of dictByToken.values()) {
    const b = bucketOf(entry.token);
    if (!dictBuckets.has(b)) dictBuckets.set(b, []);
    dictBuckets.get(b).push(entry);
  }
  for (const [b, entries] of dictBuckets) {
    writeJson(path.join(OUT_DIR, "dict", `${b}.json`), entries);
  }

  const strokeBuckets = new Map();
  for (const entry of strokeByHanzi.values()) {
    const b = bucketOf(entry.hanzi);
    if (!strokeBuckets.has(b)) strokeBuckets.set(b, []);
    strokeBuckets.get(b).push(entry);
  }
  for (const [b, entries] of strokeBuckets) {
    writeJson(path.join(OUT_DIR, "strokes", `${b}.json`), entries);
  }

  const manifest = {
    bucketCount: BUCKET_COUNT,
    dictBuckets: [...dictBuckets.keys()].sort((a, b) => a - b),
    strokeBuckets: [...strokeBuckets.keys()].sort((a, b) => a - b),
    generatedAt: new Date().toISOString(),
  };
  writeJson(path.join(OUT_DIR, "manifest.json"), manifest);

  console.log(
    `  dict: ${dictByToken.size} entries in ${dictBuckets.size} shards; ` +
      `strokes: ${strokeByHanzi.size} entries in ${strokeBuckets.size} shards`
  );
  console.log(`\nDone → ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
