export class WorksheetService {
  createTextareaValue(vocabulary) {
    return vocabulary.length ? vocabulary.join(", ") : "";
  }

  createWorksheetRequest({ text, practiceRows }) {
    return {
      text: String(text || "").trim(),
      practiceRows: Number(practiceRows || 0),
    };
  }
}
