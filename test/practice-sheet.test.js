const test = require("node:test");
const assert = require("node:assert/strict");

const { APP_CONFIG } = require("../src/shared/constants/app-config");
const { buildWorksheet } = require("../src/shared/utils/worksheet-builder");
const {
  normalizePracticeRows,
  parsePracticeInput,
} = require("../src/shared/utils/worksheet-parser");

function countSections(html) {
  return (html.match(/<section class="entry">/g) || []).length;
}

function countPracticeRows(html) {
  return (html.match(/<div class="practice-row/g) || []).length;
}

const testDictionary = new Map([
  ["你好", { pinyin: "ni hao", meaning: "hello" }],
  ["名字", { pinyin: "ming zi", meaning: "name" }],
  ["家乡", { pinyin: "jia xiang", meaning: "hometown" }],
  ["萝卜", { pinyin: "luo bo", meaning: "radish" }],
  ["怀念", { pinyin: "huai nian", meaning: "miss" }],
  ["色彩", { pinyin: "se cai", meaning: "color" }],
  ["帅", { pinyin: "shuai", meaning: "handsome" }],
  ["或", { pinyin: "huo", meaning: "or" }],
]);

const testStrokeMap = new Map();

test("parsePracticeInput splits English commas and trims entries", () => {
  assert.deepEqual(parsePracticeInput("你好, 名字, 帅, 或萝卜"), ["你好", "名字", "帅", "或萝卜"]);
});

test("parsePracticeInput splits Chinese commas and ignores empty entries", () => {
  assert.deepEqual(parsePracticeInput("家乡，萝卜，，怀念， 色彩 "), ["家乡", "萝卜", "怀念", "色彩"]);
});

test("normalizePracticeRows clamps to the supported range", () => {
  assert.equal(normalizePracticeRows(0), APP_CONFIG.minPracticeRows);
  assert.equal(normalizePracticeRows(2), 2);
  assert.equal(normalizePracticeRows(99), APP_CONFIG.maxPracticeRows);
});

test("buildWorksheet creates one worksheet section per phrase for English commas", () => {
  const sheet = buildWorksheet(
    { text: "你好, 名字, 帅, 或萝卜", practiceRows: 2, title: APP_CONFIG.worksheetTitle },
    { dictionary: testDictionary, strokeMap: testStrokeMap }
  );

  assert.equal(sheet.tokens.length, 4);
  assert.equal(sheet.entries.length, 4);
  assert.equal(countSections(sheet.html), 4);
  assert.equal(countPracticeRows(sheet.html), 8);
  assert.match(sheet.html, new RegExp(`repeat\\(${APP_CONFIG.practiceColumns}, minmax\\(0, 1fr\\)\\)`));
});

test("buildWorksheet creates one worksheet section per phrase for Chinese commas", () => {
  const sheet = buildWorksheet(
    { text: "家乡，萝卜，怀念，色彩", practiceRows: 3, title: APP_CONFIG.worksheetTitle },
    { dictionary: testDictionary, strokeMap: testStrokeMap }
  );

  assert.equal(sheet.tokens.length, 4);
  assert.equal(sheet.entries.length, 4);
  assert.equal(countSections(sheet.html), 4);
  assert.equal(countPracticeRows(sheet.html), 12);
});
