const { hsk1 } = require("./hsk-1");
const { hsk2 } = require("./hsk-2");
const { hsk3 } = require("./hsk-3");
const { hsk4a } = require("./hsk-4a");
const { hsk4b } = require("./hsk-4b");
const { hsk5a } = require("./hsk-5a");
const { hsk5b } = require("./hsk-5b");

// Ordered list of books; drives the Book dropdown order in the UI.
const HSK_BOOKS = Object.freeze([hsk1, hsk2, hsk3, hsk4a, hsk4b, hsk5a, hsk5b]);

const HSK_BOOKS_BY_ID = Object.freeze(
  HSK_BOOKS.reduce((result, book) => {
    result[book.id] = book;
    return result;
  }, {})
);

function getLessonNumbers(book) {
  return Object.keys(book.lessons)
    .map(Number)
    .sort((a, b) => a - b);
}

function getBooks() {
  return HSK_BOOKS.map((book) => ({
    id: book.id,
    label: book.label,
    lessons: getLessonNumbers(book),
  }));
}

function getLessonVocabulary(bookId, lesson) {
  const book = HSK_BOOKS_BY_ID[bookId];
  if (!book) {
    return [];
  }

  const vocabulary = book.lessons[lesson];
  return Array.isArray(vocabulary) ? vocabulary : [];
}

const HSK_LESSON_DATA = Object.freeze({
  books: getBooks(),
  lessons: HSK_BOOKS.reduce((result, book) => {
    result[book.id] = book.lessons;
    return result;
  }, {}),
});

module.exports = {
  HSK_BOOKS,
  HSK_LESSON_DATA,
  getBooks,
  getLessonVocabulary,
};
