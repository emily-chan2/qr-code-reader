"use strict";
const fileInput = document.getElementById("fileInput");
const resultDiv = document.getElementById("result");
const fileNameDiv = document.getElementById("fileName");
const customUpload = document.getElementById("customUpload");

// ZXing QR reader instance
let codeReader = new ZXing.BrowserQRCodeReader();

/* ===== Clear file input & hide result on page load/back ===== */
function clearFileInput() {
  fileInput.value = "";
  fileNameDiv.textContent = "No file selected";
  resultDiv.style.display = "none";
}
window.addEventListener("load", clearFileInput);
window.addEventListener("pageshow", clearFileInput);

/* ===== Timeout helper with countdown ===== */
function decodeWithTimeout(promise, ms, countdownCallback) {
  let remaining = ms / 1000; // convert ms → seconds
  countdownCallback(remaining); // show initial countdown

  // interval to update countdown every second
  const interval = setInterval(() => {
    remaining--;
    countdownCallback(remaining);
  }, 1000);

  return Promise.race([
    promise.finally(() => clearInterval(interval)), // clear interval if scan finishes early
    new Promise((_, reject) =>
      setTimeout(() => {
        clearInterval(interval); // clear interval if timeout hits
        reject(new Error("Scan timed out"));
      }, ms)
    ),
  ]);
}

/* ===== Main file upload listener ===== */
fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return; // no file selected

  fileNameDiv.textContent = file.name; // Show filename

  const filePreview = document.getElementById("filePreview");
  if (fileInput.files.length > 0) {
    fileNameDiv.textContent = file.name;

    // Show preview
    filePreview.src = URL.createObjectURL(file);
    filePreview.style.display = "block";
  } else {
    fileNameDiv.textContent = "No file selected";

    // Hide preview if no file
    filePreview.style.display = "none";
    filePreview.src = "";
  }

  // Disable input AND style label to look disabled
  fileInput.disabled = true;
  customUpload.style.opacity = "0.5";
  customUpload.style.userSelect = "none";
  customUpload.style.cursor = "not-allowed";
  customUpload.classList.add("disabled"); // add class to label
  resultDiv.style.display = "block"; // show result container
  resultDiv.textContent = "Reading... 7s remaining 🔍"; // initial text

  const imgUrl = URL.createObjectURL(file); // create temporary URL for ZXing

  try {
    // attempt scan with 7s timeout and countdown
    const result = await decodeWithTimeout(
      codeReader.decodeFromImageUrl(imgUrl),
      7000, // 7 seconds
      (seconds) => {
        // update countdown every second
        resultDiv.textContent = `Reading... ${seconds}s remaining 🔍`;
      }
    );

    let text = result.text;

    // If result is a URL, show clickable link
    if (/^https?:\/\//i.test(text) || /^www\./i.test(text)) {
      if (/^www\./i.test(text)) {
        text = "https://" + text;
      }
      resultDiv.innerHTML = `✅ QR Code goes to:
            <br>
            <a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>
            <br><br>
            🛑 Does that link look sketchy?<br>Inspect it with 
            <a href="https://wheregoes.com/?url=${encodeURIComponent(text)}" target="_blank">wheregoes.com</a>`;
    } else {
      // else show raw QR code data
      resultDiv.innerHTML = `QR Code data:<br>${text}`;
    }
  } catch (err) {
    // scan failed or timed out
    resultDiv.innerHTML = `I couldn't read that QR code 😭 Could you try a clearer image?<br><br>Image processing tools
          that can help include cropping, straightening, sharpening, increasing the constrast,
          adjusting the black point, and denoising.`;
  } finally {
    // reset for next scan
    customUpload.style.opacity = "1";
    customUpload.style.cursor = "pointer";
    fileInput.disabled = false; // re-enable input
    codeReader.reset(); // clear internal ZXing state
    codeReader = new ZXing.BrowserQRCodeReader(); // fresh instance
    URL.revokeObjectURL(imgUrl); // free memory
  }
});
