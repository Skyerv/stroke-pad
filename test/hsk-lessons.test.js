const test = require("node:test");
const assert = require("node:assert/strict");

const { HSK_LESSON_DATA, getBooks, getLessonVocabulary } = require("../src/data/hsk");

test("selector exposes 7 books, HSK 1 through HSK 5 with the 上/下 split", () => {
  const books = getBooks();
  assert.deepEqual(
    books.map((book) => book.id),
    ["1", "2", "3", "4a", "4b", "5a", "5b"]
  );
  assert.deepEqual(
    books.map((book) => book.label),
    ["HSK 1", "HSK 2", "HSK 3", "HSK 4上", "HSK 4下", "HSK 5上", "HSK 5下"]
  );
});

test("lesson numbering reflects the real textbooks", () => {
  const byId = Object.fromEntries(getBooks().map((book) => [book.id, book]));

  // HSK 1 and 2 have 15 lessons; HSK 3 has 20.
  assert.deepEqual(byId["1"].lessons, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  assert.equal(byId["3"].lessons.length, 20);

  // The 下 volumes continue the numbering rather than restarting at 1.
  assert.equal(byId["4b"].lessons[0], 11);
  assert.equal(byId["5b"].lessons[0], 19);
});

test("only core New Word entries are included", () => {
  // 148 core "New Word" entries across HSK 1 — proper nouns / supplementary excluded.
  const hsk1WordCount = Object.values(HSK_LESSON_DATA.lessons["1"]).reduce(
    (sum, words) => sum + words.length,
    0
  );
  assert.equal(hsk1WordCount, 148);
});

test("vocabulary lookup returns the expected words", () => {
  // 爱 is a New Word in HSK 1, lesson 12.
  assert.ok(getLessonVocabulary("1", 12).includes("爱"));

  // 下 volume lessons are keyed by their real numbers, not reset to 1.
  assert.ok(getLessonVocabulary("4b", 11).length > 0);
  assert.deepEqual(getLessonVocabulary("4b", 1), []);

  // Unknown book / lesson yields an empty list.
  assert.deepEqual(getLessonVocabulary("nope", 1), []);
});
