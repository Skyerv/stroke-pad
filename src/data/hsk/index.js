const { hsk1 } = require("./hsk-1");
const { hsk2 } = require("./hsk-2");
const { hsk3 } = require("./hsk-3");
const { hsk4 } = require("./hsk-4");
const { hsk5 } = require("./hsk-5");
const { hsk6 } = require("./hsk-6");

const HSK_LEVELS = Object.freeze({
  1: hsk1,
  2: hsk2,
  3: hsk3,
  4: hsk4,
  5: hsk5,
  6: hsk6,
});

function getLevelLessonCounts() {
  return Object.keys(HSK_LEVELS).reduce((result, level) => {
    result[level] = Object.keys(HSK_LEVELS[level].lessons).length;
    return result;
  }, {});
}

function getLessonVocabulary(level, lesson) {
  const levelData = HSK_LEVELS[level];
  if (!levelData) {
    return [];
  }

  const lessonVocabulary = levelData.lessons[lesson];
  return Array.isArray(lessonVocabulary) ? lessonVocabulary : [];
}

const HSK_LESSON_DATA = Object.freeze({
  levelLessonCounts: getLevelLessonCounts(),
  lessons: Object.keys(HSK_LEVELS).reduce((result, level) => {
    result[level] = HSK_LEVELS[level].lessons;
    return result;
  }, {}),
});

module.exports = {
  HSK_LEVELS,
  HSK_LESSON_DATA,
  getLessonVocabulary,
  getLevelLessonCounts,
};
