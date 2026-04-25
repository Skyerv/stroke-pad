const { registerHskIpc } = require("./hsk-ipc");
const { registerWindowIpc } = require("./window-ipc");
const { registerWorksheetIpc } = require("./worksheet-ipc");

function registerIpcHandlers(ipcMain, services, getMainWindow, logger) {
  registerWorksheetIpc(ipcMain, services, logger);
  registerHskIpc(ipcMain, services, logger);
  registerWindowIpc(ipcMain, getMainWindow, logger);
}

module.exports = {
  registerIpcHandlers,
};
