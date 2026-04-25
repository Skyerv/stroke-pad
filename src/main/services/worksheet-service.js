const { APP_CONFIG } = require("../../shared/constants/app-config");
const { buildWorksheet } = require("../../shared/utils/worksheet-builder");

class WorksheetService {
  constructor(dataLoaderService) {
    this.dataLoaderService = dataLoaderService;
  }

  async generateWorksheet(input) {
    const [dictionary, strokeMap] = await Promise.all([
      this.dataLoaderService.getDictionary(),
      this.dataLoaderService.getStrokeMap(),
    ]);

    return buildWorksheet(
      {
        text: input.text,
        practiceRows: input.practiceRows,
        title: APP_CONFIG.worksheetTitle,
      },
      {
        dictionary,
        strokeMap,
      }
    );
  }
}

module.exports = {
  WorksheetService,
};
