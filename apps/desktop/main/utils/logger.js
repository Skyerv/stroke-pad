class Logger {
  constructor(scope) {
    this.scope = scope;
  }

  info(message, details) {
    console.info(`[${this.scope}] ${message}`, details || "");
  }

  warn(message, details) {
    console.warn(`[${this.scope}] ${message}`, details || "");
  }

  error(message, details) {
    console.error(`[${this.scope}] ${message}`, details || "");
  }
}

function createLogger(scope) {
  return new Logger(scope);
}

module.exports = {
  createLogger,
};
