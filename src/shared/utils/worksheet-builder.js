const { APP_CONFIG } = require("../constants/app-config");
const {
  buildEntries,
  buildEntryStrokes,
  normalizePracticeRows,
  parsePracticeInput,
} = require("./worksheet-parser");
const { buildWorksheetHtml } = require("./worksheet-html");

function buildWorksheet(input, resources) {
  const tokens = parsePracticeInput(input.text);
  const practiceRows = normalizePracticeRows(input.practiceRows);
  const entries = buildEntries(tokens, resources.dictionary).map((entry) => ({
    ...entry,
    strokes: buildEntryStrokes(entry.hanziCharacters, resources.strokeMap),
  }));

  return {
    tokens,
    entries,
    practiceRows,
    html: buildWorksheetHtml({
      title: input.title || APP_CONFIG.worksheetTitle,
      entries,
      practiceRows,
    }),
  };
}

module.exports = {
  buildWorksheet,
};
