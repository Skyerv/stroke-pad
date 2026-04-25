const APP_CONFIG = Object.freeze({
  appName: "StrokePad",
  worksheetTitle: "Hanzi Practice Sheet",
  defaultOutputFileName: "hanzi_practice_sheet.pdf",
  practiceColumns: 12,
  defaultPracticeRows: 2,
  minPracticeRows: 1,
  maxPracticeRows: 8,
  window: Object.freeze({
    width: 920,
    height: 700,
    minWidth: 820,
    minHeight: 620,
  }),
});

module.exports = {
  APP_CONFIG,
};
