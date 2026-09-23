// Shareable-URL state: encode/decode the current selection so a link reopens
// the same sheet. Pure functions (no DOM) so they are unit-testable.

export function encodeState(state) {
  const params = new URLSearchParams();
  if (state.book) params.set("book", String(state.book));
  if (state.lesson !== undefined && state.lesson !== null && state.lesson !== "") {
    params.set("lesson", String(state.lesson));
  }
  if (state.rows !== undefined && state.rows !== null) {
    params.set("rows", String(state.rows));
  }
  if (state.text) {
    params.set("text", String(state.text));
  }
  return params.toString();
}

export function decodeState(search = "") {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const state = {};
  if (params.get("book")) state.book = params.get("book");
  if (params.get("lesson")) state.lesson = params.get("lesson");
  if (params.get("rows")) state.rows = params.get("rows");
  if (params.get("text")) state.text = params.get("text");
  return state;
}
