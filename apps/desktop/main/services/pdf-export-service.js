const { BrowserWindow } = require("electron");
const { applyWindowSecurity } = require("../utils/window-security");

class PdfExportService {
  async renderHtmlToPdf(html) {
    const previewWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    try {
      applyWindowSecurity(previewWindow);
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
}

module.exports = {
  PdfExportService,
};
