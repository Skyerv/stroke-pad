const test = require("node:test");
const assert = require("node:assert/strict");

const { buildWorksheet, parsePracticeInput } = require("../frontend/lib/practice-sheet");

function countSections(html) {
  return (html.match(/<section class="entry">/g) || []).length;
}

test("parsePracticeInput splits English commas and trims entries", () => {
  assert.deepEqual(parsePracticeInput("你好, 名字, 帅, 或萝卜"), ["你好", "名字", "帅", "或萝卜"]);
});

test("parsePracticeInput splits Chinese commas and ignores empty entries", () => {
  assert.deepEqual(parsePracticeInput("家乡，萝卜，，怀念， 色彩 "), ["家乡", "萝卜", "怀念", "色彩"]);
});

test("buildWorksheet creates one worksheet section per phrase for English commas", () => {
  const sheet = buildWorksheet({ text: "你好, 名字, 帅, 或萝卜", gridCount: 10 });
  assert.equal(sheet.tokens.length, 4);
  assert.equal(sheet.entries.length, 4);
  assert.equal(countSections(sheet.html), 4);
});

test("buildWorksheet creates one worksheet section per phrase for Chinese commas", () => {
  const sheet = buildWorksheet({ text: "家乡，萝卜，怀念，色彩", gridCount: 10 });
  assert.equal(sheet.tokens.length, 4);
  assert.equal(sheet.entries.length, 4);
  assert.equal(countSections(sheet.html), 4);
});
