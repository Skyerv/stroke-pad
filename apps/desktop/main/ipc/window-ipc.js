const { IPC_CHANNELS } = require("../../shared/constants/ipc-channels");
const { createErrorResult, createSuccessResult } = require("../../shared/utils/ipc-result");
const { assertNoPayload, ValidationError } = require("../utils/ipc-validation");

function registerWindowIpc(ipcMain, getMainWindow) {
  ipcMain.handle(IPC_CHANNELS.minimizeWindow, async (_, payload) => {
    try {
      assertNoPayload(payload);
      const mainWindow = getMainWindow();
      if (mainWindow) {
        mainWindow.minimize();
      }
      return createSuccessResult({ action: "minimize" });
    } catch (error) {
      if (error instanceof ValidationError) {
        return createErrorResult("VALIDATION_ERROR", error.message, error.details);
      }

      return createErrorResult("WINDOW_ACTION_FAILED", "Unable to minimize the window.");
    }
  });

  ipcMain.handle(IPC_CHANNELS.maximizeWindow, async (_, payload) => {
    try {
      assertNoPayload(payload);
      const mainWindow = getMainWindow();
      if (mainWindow) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
      }
      return createSuccessResult({ action: "maximize-toggle" });
    } catch (error) {
      if (error instanceof ValidationError) {
        return createErrorResult("VALIDATION_ERROR", error.message, error.details);
      }

      return createErrorResult("WINDOW_ACTION_FAILED", "Unable to toggle window size.");
    }
  });

  ipcMain.handle(IPC_CHANNELS.closeWindow, async (_, payload) => {
    try {
      assertNoPayload(payload);
      const mainWindow = getMainWindow();
      if (mainWindow) {
        mainWindow.close();
      }
      return createSuccessResult({ action: "close" });
    } catch (error) {
      if (error instanceof ValidationError) {
        return createErrorResult("VALIDATION_ERROR", error.message, error.details);
      }

      return createErrorResult("WINDOW_ACTION_FAILED", "Unable to close the window.");
    }
  });
}

module.exports = {
  registerWindowIpc,
};
