export function createLogger(scope) {
  return {
    info(message, details) {
      console.info(`[${scope}] ${message}`, details || "");
    },
    error(message, details) {
      console.error(`[${scope}] ${message}`, details || "");
    },
  };
}
