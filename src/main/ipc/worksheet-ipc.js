const { APP_CONFIG } = require("../../shared/constants/app-config");
const { IPC_CHANNELS } = require("../../shared/constants/ipc-channels");
const { createErrorResult, createSuccessResult } = require("../../shared/utils/ipc-result");
const { ValidationError, validateGenerateWorksheetPayload } = require("../utils/ipc-validation");

function registerWorksheetIpc(ipcMain, services, logger) {
  ipcMain.handle(IPC_CHANNELS.generateWorksheetPdf, async (_, payload) => {
    try {
      const request = validateGenerateWorksheetPayload(payload);
      const worksheet = await services.worksheetService.generateWorksheet(request);
      if (!worksheet.entries.length) {
        return createErrorResult("VALIDATION_ERROR", "Please enter at least one hanzi token.");
      }

      const pdfBuffer = await services.pdfExportService.renderHtmlToPdf(worksheet.html);
      const saveResult = await services.fileService.promptAndSavePdf(
        APP_CONFIG.defaultOutputFileName,
        pdfBuffer
      );

      return createSuccessResult(saveResult);
    } catch (error) {
      if (error instanceof ValidationError) {
        return createErrorResult("VALIDATION_ERROR", error.message, error.details);
      }

      logger.error("Failed to generate worksheet PDF.", error);
      return createErrorResult("PDF_GENERATION_FAILED", "Unable to generate the worksheet PDF.");
    }
  });
}

module.exports = {
  registerWorksheetIpc,
};
