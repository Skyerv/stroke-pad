/**
 * @param {unknown} data
 * @returns {{ ok: true, data: unknown }}
 */
function createSuccessResult(data) {
  return {
    ok: true,
    data,
  };
}

/**
 * @param {string} code
 * @param {string} message
 * @param {unknown} [details]
 * @returns {{ ok: false, error: { code: string, message: string, details: unknown } }}
 */
function createErrorResult(code, message, details) {
  return {
    ok: false,
    error: {
      code,
      message,
      details,
    },
  };
}

module.exports = {
  createErrorResult,
  createSuccessResult,
};
