function applyWindowSecurity(window) {
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  window.webContents.on("will-navigate", (event, targetUrl) => {
    const currentUrl = window.webContents.getURL();

    if (targetUrl && currentUrl && targetUrl !== currentUrl) {
      event.preventDefault();
    }
  });
}

module.exports = {
  applyWindowSecurity,
};
