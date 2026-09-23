// Hybrid hanzi-data loader for the static web app.
//
// - Loads a tiny preset dictionary once (pinyin/meaning for all HSK preset words).
// - Prefetches a per-book stroke bundle when a book is selected.
// - Lazily fetches codepoint-bucketed shards for any other (arbitrary) characters.
//
// Everything accumulates into two Maps that the worksheet engine consumes via
// `.get()`, so we can hand the whole cache to buildWorksheet each time.

const HANZI_CHARACTER_PATTERN = /^[㐀-䶿一-鿿]$/;

function isHanzi(character) {
  return HANZI_CHARACTER_PATTERN.test(character);
}

function dataBase() {
  const base = (import.meta.env && import.meta.env.BASE_URL) || "/";
  return `${base.replace(/\/$/, "")}/data`;
}

export class WebResourceService {
  constructor(base = dataBase()) {
    this.base = base;
    this.dictionary = new Map();
    this.strokeMap = new Map();
    this.loadedDictBuckets = new Set();
    this.loadedStrokeBuckets = new Set();
    this.loadedBooks = new Set();
    this.manifest = null;
    this.initPromise = null;
  }

  init() {
    if (!this.initPromise) {
      this.initPromise = this._init();
    }
    return this.initPromise;
  }

  async _init() {
    this.manifest = await this._fetchJson(`${this.base}/manifest.json`);
    const presetDict = await this._fetchJson(`${this.base}/presets/dict.json`);
    for (const entry of presetDict) {
      this.dictionary.set(entry.token, entry);
    }
  }

  // Prefetch stroke data for a whole book (one request) when it is selected.
  async ensureBook(bookId) {
    if (!bookId || this.loadedBooks.has(bookId)) {
      return;
    }
    this.loadedBooks.add(bookId);
    try {
      const entries = await this._fetchJson(`${this.base}/presets/strokes-${bookId}.json`);
      for (const entry of entries) {
        if (!this.strokeMap.has(entry.hanzi)) {
          this.strokeMap.set(entry.hanzi, entry);
        }
      }
    } catch (error) {
      // Non-fatal: the general shards below still cover these characters.
      this.loadedBooks.delete(bookId);
    }
  }

  // Ensure dict + stroke data for the given tokens are loaded, then return the caches.
  async getResources(tokens) {
    await this.init();
    await this._ensureKeys(tokens);
    return { dictionary: this.dictionary, strokeMap: this.strokeMap };
  }

  async _ensureKeys(tokens) {
    const bucketCount = this.manifest.bucketCount;
    const dictBucketSet = new Set(this.manifest.dictBuckets);
    const strokeBucketSet = new Set(this.manifest.strokeBuckets);

    const dictBuckets = new Set();
    const strokeBuckets = new Set();

    const consider = (key, needDict, needStroke) => {
      if (!key) return;
      const bucket = key.codePointAt(0) % bucketCount;
      if (needDict && !this.dictionary.has(key) && dictBucketSet.has(bucket) && !this.loadedDictBuckets.has(bucket)) {
        dictBuckets.add(bucket);
      }
      if (needStroke && !this.strokeMap.has(key) && strokeBucketSet.has(bucket) && !this.loadedStrokeBuckets.has(bucket)) {
        strokeBuckets.add(bucket);
      }
    };

    for (const token of tokens) {
      consider(token, true, false); // whole-word dict lookup
      for (const ch of token) {
        if (isHanzi(ch)) {
          consider(ch, true, true); // per-character dict + strokes
        }
      }
    }

    await Promise.all([
      ...[...dictBuckets].map((bucket) => this._loadDictBucket(bucket)),
      ...[...strokeBuckets].map((bucket) => this._loadStrokeBucket(bucket)),
    ]);
  }

  async _loadDictBucket(bucket) {
    const entries = await this._fetchJson(`${this.base}/dict/${bucket}.json`);
    for (const entry of entries) {
      if (!this.dictionary.has(entry.token)) {
        this.dictionary.set(entry.token, entry);
      }
    }
    this.loadedDictBuckets.add(bucket);
  }

  async _loadStrokeBucket(bucket) {
    const entries = await this._fetchJson(`${this.base}/strokes/${bucket}.json`);
    for (const entry of entries) {
      if (!this.strokeMap.has(entry.hanzi)) {
        this.strokeMap.set(entry.hanzi, entry);
      }
    }
    this.loadedStrokeBuckets.add(bucket);
  }

  async _fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url} (${response.status})`);
    }
    return response.json();
  }
}
