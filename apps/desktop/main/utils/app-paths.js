const path = require("path");

// apps/desktop/main/utils -> repo root is four levels up.
const ROOT_DIR = path.resolve(__dirname, "..", "..", "..", "..");
const DESKTOP_DIR = path.join(ROOT_DIR, "apps", "desktop");
const ASSETS_DIR = path.join(DESKTOP_DIR, "assets");
const HANZI_DATA_DIR = path.join(ROOT_DIR, "data", "hanzi");
const PRELOAD_SCRIPT_PATH = path.join(DESKTOP_DIR, "preload", "index.js");
const RENDERER_HTML_PATH = path.join(DESKTOP_DIR, "renderer", "pages", "index.html");

module.exports = {
  ASSETS_DIR,
  HANZI_DATA_DIR,
  PRELOAD_SCRIPT_PATH,
  RENDERER_HTML_PATH,
  ROOT_DIR,
  DESKTOP_DIR,
};
