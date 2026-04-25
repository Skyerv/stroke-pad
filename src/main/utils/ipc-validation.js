const { APP_CONFIG } = require("../../shared/constants/app-config");

class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

function assertNoPayload(payload) {
  if (payload !== undefined && payload !== null) {
    throw new ValidationError("This IPC channel does not accept arguments.");
  }
}

function validateGenerateWorksheetPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ValidationError("Worksheet generation payload must be an object.");
  }

  const text = typeof payload.text === "string" ? payload.text.trim() : "";
  if (!text) {
    throw new ValidationError("Please enter at least one hanzi token.");
  }

  const rawPracticeRows = Number(payload.practiceRows);
  const practiceRows = Number.isFinite(rawPracticeRows)
    ? Math.min(
        Math.max(Math.trunc(rawPracticeRows), APP_CONFIG.minPracticeRows),
        APP_CONFIG.maxPracticeRows
      )
    : APP_CONFIG.defaultPracticeRows;

  return {
    text,
    practiceRows,
  };
}

module.exports = {
  ValidationError,
  assertNoPayload,
  validateGenerateWorksheetPayload,
};
