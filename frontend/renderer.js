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
    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, grid_count: gridCount })
    });

    if (!response.ok) {
      let detail = `Request failed (${response.status})`;
      try {
        const errorJson = await response.json();
        detail = errorJson.detail || detail;
      } catch (_) {
        // Keep fallback message when backend is unavailable or non-JSON.
      }
      throw new Error(detail);
    }

    const arrayBuffer = await response.arrayBuffer();
    const byteArray = Array.from(new Uint8Array(arrayBuffer));
    const result = await window.electronAPI.savePdfFile(byteArray);

    if (result.canceled) {
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
