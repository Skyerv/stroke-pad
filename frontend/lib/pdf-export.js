const { BrowserWindow } = require("electron");

async function renderPdfFromHtml(html) {
  const previewWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 1600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  try {
    await previewWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    await previewWindow.webContents.executeJavaScript(
      "document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)"
    );

    return await previewWindow.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    if (!previewWindow.isDestroyed()) {
      previewWindow.destroy();
    }
  }
}

module.exports = {
  renderPdfFromHtml,
};
