export class ElectronApiService {
  constructor(api = window.strokePadApi) {
    this.api = api;
  }

  async generateWorksheetPdf(payload) {
    this.ensureApi("generateWorksheetPdf");
    return this.unwrapResult(await this.api.generateWorksheetPdf(payload));
  }

  async loadHskLessonData() {
    this.ensureApi("loadHskLessonData");
    return this.unwrapResult(await this.api.loadHskLessonData());
  }

  async minimizeWindow() {
    this.ensureApi("minimizeWindow");
    return this.unwrapResult(await this.api.minimizeWindow());
  }

  async maximizeWindow() {
    this.ensureApi("maximizeWindow");
    return this.unwrapResult(await this.api.maximizeWindow());
  }

  async closeWindow() {
    this.ensureApi("closeWindow");
    return this.unwrapResult(await this.api.closeWindow());
  }

  ensureApi(methodName) {
    if (!this.api || typeof this.api[methodName] !== "function") {
      throw new Error(
        `The secure Electron API bridge is unavailable (${methodName}).`
      );
    }
  }

  unwrapResult(result) {
    if (!result || typeof result !== "object") {
      throw new Error("Received an invalid IPC response.");
    }

    if (!result.ok) {
      throw new Error(result.error?.message || "An unexpected application error occurred.");
    }

    return result.data;
  }
}
