import { requireElement } from "../utils/dom.js";

export class ExportButton {
  constructor(rootElement, onClick) {
    this.button = requireElement(rootElement, "#generate-btn");
    this.onClick = onClick;
    this.isBound = false;
  }

  bind() {
    if (this.isBound) {
      return;
    }

    this.button.addEventListener("click", () => {
      this.onClick();
    });

    this.isBound = true;
  }

  setBusy(isBusy) {
    this.button.disabled = isBusy;
  }
}
