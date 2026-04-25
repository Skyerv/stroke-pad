const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..", "..");
const SRC_DIR = path.join(ROOT_DIR, "src");
const ASSETS_DIR = path.join(SRC_DIR, "assets");
const HANZI_DATA_DIR = path.join(SRC_DIR, "data", "hanzi");
const PRELOAD_SCRIPT_PATH = path.join(SRC_DIR, "preload", "index.js");
const RENDERER_HTML_PATH = path.join(SRC_DIR, "renderer", "pages", "index.html");

module.exports = {
  ASSETS_DIR,
  HANZI_DATA_DIR,
  PRELOAD_SCRIPT_PATH,
  RENDERER_HTML_PATH,
  ROOT_DIR,
  SRC_DIR,
};
