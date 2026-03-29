const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  savePdfFile: (byteArray) => ipcRenderer.invoke("save-pdf-file", { byteArray }),
});

contextBridge.exposeInMainWorld("windowControls", {
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  close: () => ipcRenderer.send("close"),
});