const fs = require("fs/promises");
const { dialog } = require("electron");

class FileService {
  async promptAndSavePdf(defaultPath, pdfBuffer) {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: "Save Hanzi Practice Sheet",
      defaultPath,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }

    await fs.writeFile(filePath, pdfBuffer);

    return {
      canceled: false,
      filePath,
    };
  }
}

module.exports = {
  FileService,
};
