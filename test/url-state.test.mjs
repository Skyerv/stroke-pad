import test from "node:test";
import assert from "node:assert/strict";

import { encodeState, decodeState } from "../apps/web/src/state/url-state.js";

test("encodeState includes set fields and omits empty ones", () => {
  assert.equal(encodeState({ book: "4b", lesson: "11", rows: 2 }), "book=4b&lesson=11&rows=2");
  assert.equal(encodeState({ book: "1", lesson: "", rows: 2 }), "book=1&rows=2");
  assert.equal(encodeState({}), "");
});

test("encodeState encodes custom text", () => {
  const query = encodeState({ book: "1", lesson: "1", rows: 2, text: "你好, 名字" });
  assert.match(query, /text=/);
  assert.deepEqual(decodeState(`?${query}`).text, "你好, 名字");
});

test("decodeState round-trips a preset link", () => {
  assert.deepEqual(decodeState("?book=5b&lesson=19&rows=3"), {
    book: "5b",
    lesson: "19",
    rows: "3",
  });
});

test("decodeState tolerates a leading ? or none, and empty input", () => {
  assert.deepEqual(decodeState("book=2&lesson=5"), { book: "2", lesson: "5" });
  assert.deepEqual(decodeState(""), {});
});
