const { HSK_LESSON_DATA } = require("../../data/hsk");

class HskService {
  getLessonData() {
    return {
      levelLessonCounts: { ...HSK_LESSON_DATA.levelLessonCounts },
      lessons: Object.keys(HSK_LESSON_DATA.lessons).reduce((result, level) => {
        result[level] = Object.keys(HSK_LESSON_DATA.lessons[level]).reduce((lessons, lesson) => {
          lessons[lesson] = [...HSK_LESSON_DATA.lessons[level][lesson]];
          return lessons;
        }, {});
        return result;
      }, {}),
    };
  }
}

module.exports = {
  HskService,
};
