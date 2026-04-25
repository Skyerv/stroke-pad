import { requireElement } from "../utils/dom.js";

export class LessonSelector {
  constructor(rootElement, onVocabularyChange) {
    this.levelSelect = requireElement(rootElement, "#hsk-level");
    this.lessonSelect = requireElement(rootElement, "#hsk-lesson");
    this.onVocabularyChange = onVocabularyChange;
    this.isBound = false;
    this.lessonData = {
      levelLessonCounts: {},
      lessons: {},
    };
  }

  initialize(lessonData, initialSelection) {
    this.lessonData = lessonData;
    this.renderLevelOptions();
    this.setSelection(initialSelection.level, initialSelection.lesson);
    this.bindEvents();
  }

  bindEvents() {
    if (this.isBound) {
      return;
    }

    this.levelSelect.addEventListener("change", () => {
      this.renderLessonOptions(Number(this.levelSelect.value));
      this.lessonSelect.value = "1";
      this.emitSelection();
    });

    this.lessonSelect.addEventListener("change", () => {
      this.emitSelection();
    });

    this.isBound = true;
  }

  renderLevelOptions() {
    this.levelSelect.innerHTML = "";

    Object.keys(this.lessonData.levelLessonCounts).forEach((level) => {
      const option = document.createElement("option");
      option.value = level;
      option.textContent = `HSK ${level}`;
      this.levelSelect.appendChild(option);
    });
  }

  renderLessonOptions(level) {
    const lessonCount = Number(this.lessonData.levelLessonCounts[level] || 0);
    this.lessonSelect.innerHTML = "";

    for (let lesson = 1; lesson <= lessonCount; lesson += 1) {
      const option = document.createElement("option");
      option.value = String(lesson);
      option.textContent = `Lesson ${lesson}`;
      this.lessonSelect.appendChild(option);
    }
  }

  setSelection(level, lesson) {
    this.levelSelect.value = String(level);
    this.renderLessonOptions(level);
    this.lessonSelect.value = String(lesson);

    if (this.lessonSelect.value !== String(lesson)) {
      this.lessonSelect.value = "1";
    }

    this.emitSelection();
  }

  emitSelection() {
    const level = Number(this.levelSelect.value);
    const lesson = Number(this.lessonSelect.value);
    const vocabulary = this.lessonData.lessons?.[level]?.[lesson] || [];
    this.onVocabularyChange({ level, lesson, vocabulary });
  }
}
