// Renders the worksheet HTML into a preview iframe, which doubles as the print
// source. "Print / Save as PDF" simply prints that same iframe — the worksheet
// HTML already carries its own @page A4 print styles.

export class WebPrintService {
  constructor(iframe) {
    this.iframe = iframe;
  }

  render(html) {
    return new Promise((resolve) => {
      const onLoad = () => {
        this.iframe.removeEventListener("load", onLoad);
        resolve();
      };
      this.iframe.addEventListener("load", onLoad);
      this.iframe.srcdoc = html;
    });
  }

  print() {
    const win = this.iframe.contentWindow;
    if (!win) {
      return;
    }
    win.focus();
    win.print();
  }
}
