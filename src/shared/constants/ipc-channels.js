const IPC_CHANNELS = Object.freeze({
  generateWorksheetPdf: "worksheet:generate-pdf",
  loadHskLessons: "hsk:load-lessons",
  minimizeWindow: "window:minimize",
  maximizeWindow: "window:maximize",
  closeWindow: "window:close",
});

module.exports = {
  IPC_CHANNELS,
};
