import { requireElement } from "../utils/dom.js";

export class WindowControls {
  constructor(rootElement, electronApiService) {
    this.minimizeButton = requireElement(rootElement, "#min-btn");
    this.maximizeButton = requireElement(rootElement, "#max-btn");
    this.closeButton = requireElement(rootElement, "#close-btn");
    this.electronApiService = electronApiService;
    this.isBound = false;
  }

  bind() {
    if (this.isBound) {
      return;
    }

    this.minimizeButton.addEventListener("click", () => {
      this.electronApiService.minimizeWindow().catch(console.error);
    });

    this.maximizeButton.addEventListener("click", () => {
      this.electronApiService.maximizeWindow().catch(console.error);
    });

    this.closeButton.addEventListener("click", () => {
      this.electronApiService.closeWindow().catch(console.error);
    });

    this.isBound = true;
  }
}
