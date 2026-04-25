const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  generatePracticeSheet: (payload) => ipcRenderer.invoke("generate-practice-sheet", payload),
});

contextBridge.exposeInMainWorld("windowControls", {
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  close: () => ipcRenderer.send("close"),
});
