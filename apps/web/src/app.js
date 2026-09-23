import { buildWorksheet } from "../../../core/worksheet/worksheet-builder.js";
import { parsePracticeInput } from "../../../core/worksheet/worksheet-parser.js";
import { WebResourceService } from "./platform/web-resources.js";
import { WebPrintService } from "./platform/web-print.js";
import { encodeState, decodeState } from "./state/url-state.js";

// UI bounds for the practice-rows input (mirrors the HTML min/max/value).
const ROWS_MIN = 1;
const ROWS_MAX = 8;
const ROWS_DEFAULT = 2;

function dataUrl(file) {
  const base = (import.meta.env && import.meta.env.BASE_URL) || "/";
  return `${base.replace(/\/$/, "")}/data/${file}`;
}

function clampRows(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return ROWS_DEFAULT;
  }
  return Math.min(Math.max(Math.trunc(parsed), ROWS_MIN), ROWS_MAX);
}

export class WebApp {
  constructor(root) {
    this.root = root;
    this.bookSelect = root.querySelector("#hsk-book");
    this.lessonSelect = root.querySelector("#hsk-lesson");
    this.textInput = root.querySelector("#text-input");
    this.rowsInput = root.querySelector("#practice-rows");
    this.generateBtn = root.querySelector("#generate-btn");
    this.printBtn = root.querySelector("#print-btn");
    this.shareBtn = root.querySelector("#share-btn");
    this.statusEl = root.querySelector("#status");
    this.previewFrame = root.querySelector("#preview");

    this.resources = new WebResourceService();
    this.printer = new WebPrintService(this.previewFrame);

    this.books = [];
    this.booksById = new Map();
    this.lessons = {};
    this.customText = false;
  }

  async initialize() {
    try {
      await this.loadHskData();
    } catch (error) {
      this.setStatus("Could not load lesson list. Check your connection.");
      return;
    }

    this.renderBookOptions();
    const initial = this.resolveInitialSelection();
    this.applySelection(initial);
    this.bindEvents();

    this.setStatus("Loading dictionary…");
    try {
      await this.resources.init();
      await this.handleGenerate();
    } catch (error) {
      this.setStatus("Could not load hanzi data. Check your connection.");
    }
  }

  async loadHskData() {
    const response = await fetch(dataUrl("hsk.json"));
    if (!response.ok) {
      throw new Error(`Failed to load hsk.json (${response.status})`);
    }
    const data = await response.json();
    this.books = data.books;
    this.lessons = data.lessons;
    this.booksById = new Map(this.books.map((book) => [book.id, book]));
  }

  resolveInitialSelection() {
    const state = decodeState(window.location.search);
    const firstBook = this.books[0];
    const bookId = state.book && this.booksById.has(state.book) ? state.book : firstBook.id;
    const book = this.booksById.get(bookId);
    const lessons = book.lessons.map(String);
    const lesson = state.lesson && lessons.includes(String(state.lesson))
      ? String(state.lesson)
      : String(book.lessons[0]);
    const rows = clampRows(state.rows !== undefined ? state.rows : this.rowsInput.value);
    return { bookId, lesson, rows, text: state.text };
  }

  applySelection({ bookId, lesson, rows, text }) {
    this.bookSelect.value = bookId;
    this.renderLessonOptions(bookId);
    this.lessonSelect.value = String(lesson);
    this.rowsInput.value = String(rows);

    if (text) {
      this.textInput.value = text;
      this.customText = true;
    } else {
      this.textInput.value = this.presetWords(bookId, this.lessonSelect.value);
      this.customText = false;
    }

    this.resources.ensureBook(bookId);
    this.syncUrl();
  }

  renderBookOptions() {
    this.bookSelect.innerHTML = "";
    for (const book of this.books) {
      const option = document.createElement("option");
      option.value = book.id;
      option.textContent = book.label;
      this.bookSelect.appendChild(option);
    }
  }

  renderLessonOptions(bookId) {
    const book = this.booksById.get(bookId);
    this.lessonSelect.innerHTML = "";
    if (!book) return;
    for (const lesson of book.lessons) {
      const option = document.createElement("option");
      option.value = String(lesson);
      option.textContent = `Lesson ${lesson}`;
      this.lessonSelect.appendChild(option);
    }
  }

  presetWords(bookId, lesson) {
    const bookLessons = this.lessons[bookId] || {};
    const words = bookLessons[lesson] || [];
    return words.join(", ");
  }

  bindEvents() {
    this.bookSelect.addEventListener("change", () => {
      const bookId = this.bookSelect.value;
      this.renderLessonOptions(bookId);
      const lesson = String(this.booksById.get(bookId).lessons[0]);
      this.lessonSelect.value = lesson;
      this.textInput.value = this.presetWords(bookId, lesson);
      this.customText = false;
      this.resources.ensureBook(bookId);
      this.syncUrl();
      this.handleGenerate();
    });

    this.lessonSelect.addEventListener("change", () => {
      this.textInput.value = this.presetWords(this.bookSelect.value, this.lessonSelect.value);
      this.customText = false;
      this.syncUrl();
      this.handleGenerate();
    });

    this.textInput.addEventListener("input", () => {
      this.customText = true;
      this.syncUrl();
    });

    this.rowsInput.addEventListener("change", () => this.syncUrl());
    this.generateBtn.addEventListener("click", () => this.handleGenerate());
    this.printBtn.addEventListener("click", () => this.printer.print());
    this.shareBtn.addEventListener("click", () => this.handleShare());
  }

  async handleGenerate() {
    const text = this.textInput.value.trim();
    if (!text) {
      this.setStatus("Enter at least one hanzi.");
      return;
    }

    const rows = clampRows(this.rowsInput.value);
    this.generateBtn.disabled = true;
    this.setStatus("Building sheet…");

    try {
      const tokens = parsePracticeInput(text);
      await this.resources.ensureBook(this.bookSelect.value);
      const { dictionary, strokeMap } = await this.resources.getResources(tokens);
      const sheet = buildWorksheet(
        { text, practiceRows: rows },
        { dictionary, strokeMap }
      );
      await this.printer.render(sheet.html);
      this.printBtn.disabled = false;
      const n = sheet.entries.length;
      this.setStatus(`Ready — ${n} ${n === 1 ? "entry" : "entries"}`);
    } catch (error) {
      this.setStatus(`Error: ${error.message}`);
    } finally {
      this.generateBtn.disabled = false;
    }
  }

  currentState() {
    const state = {
      book: this.bookSelect.value,
      lesson: this.lessonSelect.value,
      rows: clampRows(this.rowsInput.value),
    };
    if (this.customText) {
      state.text = this.textInput.value;
    }
    return state;
  }

  syncUrl() {
    const query = encodeState(this.currentState());
    const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }

  async handleShare() {
    const query = encodeState(this.currentState());
    const url = `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      this.setStatus("Link copied! 🔗");
    } catch (error) {
      this.setStatus(url);
    }
  }

  setStatus(message) {
    this.statusEl.textContent = message;
  }
}
