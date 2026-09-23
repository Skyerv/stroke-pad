import { APP_CONFIG } from "../constants/app-config.js";
import {
  buildEntries,
  buildEntryStrokes,
  normalizePracticeRows,
  parsePracticeInput,
} from "./worksheet-parser.js";
import { buildWorksheetHtml } from "./worksheet-html.js";

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

export { buildWorksheet };
