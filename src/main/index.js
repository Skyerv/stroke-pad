const { app, ipcMain } = require("electron");
const { createMainWindow } = require("./windows/main-window");
const { registerIpcHandlers } = require("./ipc/register-ipc-handlers");
const { DataLoaderService } = require("./services/data-loader-service");
const { FileService } = require("./services/file-service");
const { HskService } = require("./services/hsk-service");
const { PdfExportService } = require("./services/pdf-export-service");
const { WorksheetService } = require("./services/worksheet-service");
const { createLogger } = require("./utils/logger");

const logger = createLogger("main");

const services = {
  dataLoaderService: new DataLoaderService(),
  fileService: new FileService(),
  hskService: new HskService(),
  pdfExportService: new PdfExportService(),
};

services.worksheetService = new WorksheetService(services.dataLoaderService);

let mainWindow = null;

function getMainWindow() {
  return mainWindow;
}

function bootstrapMainWindow() {
  mainWindow = createMainWindow();
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers(ipcMain, services, getMainWindow, logger);
  bootstrapMainWindow();

  app.on("activate", () => {
    if (!getMainWindow()) {
      bootstrapMainWindow();
    }
  });
}).catch((error) => {
  logger.error("Application bootstrap failed.", error);
  app.quit();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
