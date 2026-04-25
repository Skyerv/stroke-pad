const { createEmptyLessons } = require("./create-empty-lessons");

const lessons = createEmptyLessons();

lessons[20] = [
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
];

const hsk5 = {
  level: 5,
  lessons,
};

module.exports = {
  hsk5,
};
