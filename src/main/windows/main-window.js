const { BrowserWindow } = require("electron");
const { APP_CONFIG } = require("../../shared/constants/app-config");
const path = require("path");
const { ASSETS_DIR, PRELOAD_SCRIPT_PATH, RENDERER_HTML_PATH } = require("../utils/app-paths");
const { applyWindowSecurity } = require("../utils/window-security");

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: APP_CONFIG.window.width,
    height: APP_CONFIG.window.height,
    minWidth: APP_CONFIG.window.minWidth,
    minHeight: APP_CONFIG.window.minHeight,
    frame: false,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    icon: path.join(ASSETS_DIR, "icon.png"),
    webPreferences: {
      preload: PRELOAD_SCRIPT_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  applyWindowSecurity(mainWindow);
  mainWindow.loadFile(RENDERER_HTML_PATH);
  return mainWindow;
}

module.exports = {
  createMainWindow,
};
