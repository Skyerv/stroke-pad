export class PdfService {
  constructor(electronApiService) {
    this.electronApiService = electronApiService;
  }

  async generateWorksheetPdf(payload) {
    return this.electronApiService.generateWorksheetPdf(payload);
  }
}
