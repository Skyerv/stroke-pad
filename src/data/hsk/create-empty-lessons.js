function createEmptyLessons(totalLessons = 20) {
  const lessons = {};

  for (let lesson = 1; lesson <= totalLessons; lesson += 1) {
    lessons[lesson] = [];
  }

  return lessons;
}

module.exports = {
  createEmptyLessons,
};
