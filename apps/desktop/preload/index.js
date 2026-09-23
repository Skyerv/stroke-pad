const { contextBridge, ipcRenderer } = require("electron");

const IPC_CHANNELS = Object.freeze({
  generateWorksheetPdf: "worksheet:generate-pdf",
  loadHskLessons: "hsk:load-lessons",
  minimizeWindow: "window:minimize",
  maximizeWindow: "window:maximize",
  closeWindow: "window:close",
});

contextBridge.exposeInMainWorld(
  "strokePadApi",
  Object.freeze({
    generateWorksheetPdf(payload) {
      return ipcRenderer.invoke(
        IPC_CHANNELS.generateWorksheetPdf,
        payload
      );
    },

    loadHskLessonData() {
      return ipcRenderer.invoke(
        IPC_CHANNELS.loadHskLessons
      );
    },

    minimizeWindow() {
      return ipcRenderer.invoke(
        IPC_CHANNELS.minimizeWindow
      );
    },

    maximizeWindow() {
      return ipcRenderer.invoke(
        IPC_CHANNELS.maximizeWindow
      );
    },

    closeWindow() {
      return ipcRenderer.invoke(
        IPC_CHANNELS.closeWindow
      );
    },
  })
);