import { hsk1 } from "./hsk-1.js";
import { hsk2 } from "./hsk-2.js";
import { hsk3 } from "./hsk-3.js";
import { hsk4a } from "./hsk-4a.js";
import { hsk4b } from "./hsk-4b.js";
import { hsk5a } from "./hsk-5a.js";
import { hsk5b } from "./hsk-5b.js";

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

export { HSK_BOOKS, HSK_LESSON_DATA, getBooks, getLessonVocabulary };
