const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  savePdfFile: (byteArray) => ipcRenderer.invoke("save-pdf-file", { byteArray })
});
