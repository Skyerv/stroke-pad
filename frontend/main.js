const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { buildWorksheet } = require("./lib/practice-sheet");
const { renderPdfFromHtml } = require("./lib/pdf-export");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 920,
    height: 700,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, "assets/icon.png"),
  });

  win.on("closed", () => {
    win = null;
  });

  win.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.handle("generate-practice-sheet", async (_, payload) => {
  const text = String(payload?.text ?? "").trim();
  const gridCountRaw = Number(payload?.gridCount ?? 10);
  const gridCount = Number.isFinite(gridCountRaw) ? Math.min(Math.max(Math.trunc(gridCountRaw), 4), 20) : 10;

  if (!text) {
    return { canceled: false, error: "Please enter at least one hanzi token." };
  }

  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Save Hanzi Practice Sheet",
    defaultPath: "hanzi_practice_sheet.pdf",
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  const { html } = buildWorksheet({ text, gridCount });
  const pdfBytes = await renderPdfFromHtml(html);
  await fs.promises.writeFile(filePath, pdfBytes);
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

ipcMain.on("minimize", () => {
  if (win) {
    win.minimize();
  }
});

ipcMain.on("maximize", () => {
  if (!win) return;

  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on("close", () => {
  if (win) win.close();
});
