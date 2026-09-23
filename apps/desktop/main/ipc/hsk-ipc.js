const { IPC_CHANNELS } = require("../../shared/constants/ipc-channels");
const { createErrorResult, createSuccessResult } = require("../../shared/utils/ipc-result");
const { assertNoPayload, ValidationError } = require("../utils/ipc-validation");

function registerHskIpc(ipcMain, services, logger) {
  ipcMain.handle(IPC_CHANNELS.loadHskLessons, async (_, payload) => {
    try {
      assertNoPayload(payload);
      return createSuccessResult(services.hskService.getLessonData());
    } catch (error) {
      if (error instanceof ValidationError) {
        return createErrorResult("VALIDATION_ERROR", error.message, error.details);
      }

      logger.error("Failed to load HSK lesson data.", error);
      return createErrorResult("HSK_DATA_LOAD_FAILED", "Unable to load HSK lesson data.");
    }
  });
}

module.exports = {
  registerHskIpc,
};
