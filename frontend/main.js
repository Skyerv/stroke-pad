const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");

function createWindow() {
  const window = new BrowserWindow({
    width: 920,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  window.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.handle("save-pdf-file", async (_, payload) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Save Hanzi Practice Sheet",
    defaultPath: "hanzi_practice_sheet.pdf",
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  const buffer = Buffer.from(payload.byteArray);
  fs.writeFileSync(filePath, buffer);
  return { canceled: false, filePath };
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
