import { requireElement } from "../utils/dom.js";

export class LessonSelector {
  constructor(rootElement, onVocabularyChange) {
    this.bookSelect = requireElement(rootElement, "#hsk-book");
    this.lessonSelect = requireElement(rootElement, "#hsk-lesson");
    this.onVocabularyChange = onVocabularyChange;
    this.isBound = false;
    this.lessonData = {
      books: [],
      lessons: {},
    };
  }

  initialize(lessonData, initialSelection) {
    this.lessonData = lessonData;
    this.renderBookOptions();

    const firstBook = this.lessonData.books[0];
    const selection = initialSelection || {
      book: firstBook ? firstBook.id : "",
      lesson: firstBook ? firstBook.lessons[0] : null,
    };

    this.setSelection(selection.book, selection.lesson);
    this.bindEvents();
  }

  bindEvents() {
    if (this.isBound) {
      return;
    }

    this.bookSelect.addEventListener("change", () => {
      const bookId = this.bookSelect.value;
      this.renderLessonOptions(bookId);
      this.lessonSelect.value = String(this.firstLessonOf(bookId) ?? "");
      this.emitSelection();
    });

    this.lessonSelect.addEventListener("change", () => {
      this.emitSelection();
    });

    this.isBound = true;
  }

  findBook(bookId) {
    return this.lessonData.books.find((book) => book.id === String(bookId));
  }

  firstLessonOf(bookId) {
    const book = this.findBook(bookId);
    return book && book.lessons.length ? book.lessons[0] : null;
  }

  renderBookOptions() {
    this.bookSelect.innerHTML = "";

    this.lessonData.books.forEach((book) => {
      const option = document.createElement("option");
      option.value = book.id;
      option.textContent = book.label;
      this.bookSelect.appendChild(option);
    });
  }

  renderLessonOptions(bookId) {
    const book = this.findBook(bookId);
    this.lessonSelect.innerHTML = "";

    if (!book) {
      return;
    }

    book.lessons.forEach((lesson) => {
      const option = document.createElement("option");
      option.value = String(lesson);
      option.textContent = `Lesson ${lesson}`;
      this.lessonSelect.appendChild(option);
    });
  }

  setSelection(bookId, lesson) {
    this.bookSelect.value = String(bookId);
    this.renderLessonOptions(bookId);
    this.lessonSelect.value = String(lesson);

    if (this.lessonSelect.value !== String(lesson)) {
      this.lessonSelect.value = String(this.firstLessonOf(bookId) ?? "");
    }

    this.emitSelection();
  }

  emitSelection() {
    const book = this.bookSelect.value;
    const lesson = this.lessonSelect.value;
    const vocabulary = this.lessonData.lessons?.[book]?.[lesson] || [];
    this.onVocabularyChange({ book, lesson, vocabulary });
  }
}
