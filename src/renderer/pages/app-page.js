import { ExportButton } from "../components/export-button.js";
import { LessonSelector } from "../components/lesson-selector.js";
import { StatusMessage } from "../components/status-message.js";
import { WindowControls } from "../components/window-controls.js";
import { ElectronApiService } from "../services/electron-api-service.js";
import { HskService } from "../services/hsk-service.js";
import { PdfService } from "../services/pdf-service.js";
import { WorksheetService } from "../services/worksheet-service.js";
import { requireElement } from "../utils/dom.js";
import { createLogger } from "../utils/logger.js";

export class AppPage {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.logger = createLogger("renderer");
    this.electronApiService = new ElectronApiService();
    this.hskService = new HskService(this.electronApiService);
    this.pdfService = new PdfService(this.electronApiService);
    this.worksheetService = new WorksheetService();
    this.textInput = requireElement(rootElement, "#text-input");
    this.practiceRowsInput = requireElement(rootElement, "#practice-rows");
    this.statusMessage = new StatusMessage(rootElement);
    this.windowControls = new WindowControls(rootElement, this.electronApiService);
    this.exportButton = new ExportButton(rootElement, () => {
      this.handleGenerate();
    });
    this.lessonSelector = new LessonSelector(rootElement, ({ vocabulary }) => {
      this.textInput.value = this.worksheetService.createTextareaValue(vocabulary);
    });
  }

  async initialize() {
    this.windowControls.bind();
    this.exportButton.bind();
    this.statusMessage.set("Loading lessons...");

    try {
      const lessonData = await this.hskService.loadLessonData();
      this.lessonSelector.initialize(lessonData, { level: 1, lesson: 1 });
      this.statusMessage.set("Idle");
    } catch (error) {
      this.logger.error("Failed to initialize the application.", error);
      this.statusMessage.set("Error loading lesson data.");
    }
  }

  async handleGenerate() {
    const request = this.worksheetService.createWorksheetRequest({
      text: this.textInput.value,
      practiceRows: this.practiceRowsInput.value,
    });

    if (!request.text) {
      this.statusMessage.set("Please enter at least one hanzi token.");
      return;
    }

    this.exportButton.setBusy(true);
    this.statusMessage.set("Generating PDF...");

    try {
      const result = await this.pdfService.generateWorksheetPdf(request);
      this.statusMessage.set(result.canceled ? "Save canceled." : `Saved: ${result.filePath}`);
    } catch (error) {
      this.logger.error("Failed to generate the worksheet PDF.", error);
      this.statusMessage.set(`Error: ${error.message}`);
    } finally {
      this.exportButton.setBusy(false);
    }
  }
}
