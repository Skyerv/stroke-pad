const generateButton = document.getElementById("generate-btn");
const textInput = document.getElementById("text-input");
const gridCountInput = document.getElementById("grid-count");
const statusText = document.getElementById("status");

document.getElementById("min-btn").onclick = () => {
  window.windowControls.minimize();
};

document.getElementById("max-btn").onclick = () => {
  window.windowControls.maximize();
};

document.getElementById("close-btn").onclick = () => {
  window.windowControls.close();
};

function setStatus(message) {
  statusText.textContent = message;
}

async function handleGenerate() {
  const text = textInput.value.trim();
  const gridCount = Number(gridCountInput.value || 10);

  if (!text) {
    setStatus("Please enter at least one hanzi token.");
    return;
  }

  generateButton.disabled = true;
  setStatus("Generating PDF...");

  try {
    const result = await window.electronAPI.generatePracticeSheet({ text, gridCount });

    if (result?.error) {
      throw new Error(result.error);
    }

    if (result?.canceled) {
      setStatus("Save canceled.");
    } else {
      setStatus(`Saved: ${result.filePath}`);
    }
  } catch (error) {
    setStatus(`Error: ${error.message}`);
  } finally {
    generateButton.disabled = false;
  }
}

generateButton.addEventListener("click", handleGenerate);
