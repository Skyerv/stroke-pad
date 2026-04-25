import { requireElement } from "../utils/dom.js";

export class StatusMessage {
  constructor(rootElement) {
    this.statusElement = requireElement(rootElement, "#status");
  }

  set(message) {
    this.statusElement.textContent = message;
  }
}
