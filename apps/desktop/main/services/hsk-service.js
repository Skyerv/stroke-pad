const { HSK_LESSON_DATA } = require("../../../../core/hsk");

class HskService {
  getLessonData() {
    return {
      books: HSK_LESSON_DATA.books.map((book) => ({
        id: book.id,
        label: book.label,
        lessons: [...book.lessons],
      })),
      lessons: Object.keys(HSK_LESSON_DATA.lessons).reduce((result, bookId) => {
        const bookLessons = HSK_LESSON_DATA.lessons[bookId];
        result[bookId] = Object.keys(bookLessons).reduce((lessons, lesson) => {
          lessons[lesson] = [...bookLessons[lesson]];
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
