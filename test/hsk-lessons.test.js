const test = require("node:test");
const assert = require("node:assert/strict");

const {
  HSK_LESSON_DATA,
  getLessonVocabulary,
  getLevelLessonCounts,
} = require("../src/data/hsk");

test("HSK selector structure covers levels 1 through 6", () => {
  const levelLessonCounts = getLevelLessonCounts();
  assert.deepEqual(Object.keys(levelLessonCounts).map(Number), [1, 2, 3, 4, 5, 6]);

  for (const level of [1, 2, 3, 4, 5, 6]) {
    assert.equal(levelLessonCounts[level], 20);
  }
});

test("only HSK 5 lesson 20 has vocabulary data", () => {
  assert.deepEqual(getLessonVocabulary(5, 20), [
    "缓解",
    "风险",
    "挑战",
    "贷款",
    "贷款人",
    "利率",
    "投资",
    "股票",
    "基金",
    "债券",
    "保险",
    "财富",
    "财务",
    "预算",
    "消费",
    "储蓄",
    "经济",
    "市场",
    "利润",
    "亏损",
  ]);

  assert.deepEqual(HSK_LESSON_DATA.lessons[1][1], []);
  assert.deepEqual(getLessonVocabulary(5, 19), []);
  assert.deepEqual(getLessonVocabulary(6, 20), []);
});
