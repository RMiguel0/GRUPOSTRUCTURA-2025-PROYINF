import Tesseract from 'tesseract.js';

/**
 * Extract text from an image file using the Tesseract OCR library.
 *
 * @param {File} imageFile An image file selected by the user.
 * @returns {Promise<string>} A promise that resolves with the recognized text.
 */
export async function extractTextFromImage(imageFile) {
  const {
    data: { text },
  } = await Tesseract.recognize(imageFile, 'eng', {
    logger: (m) => console.log(m),
  });
  return text;
}

/**
 * Parses identification and full name from OCR text. Looks for common
 * patterns in passport or national ID documents. If no matching
 * information is found empty strings are returned.
 *
 * @param {string} text The raw OCR text to parse.
 * @returns {{ identification: string, fullName: string }}
 */
export function parsePassportData(text) {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let identification = '';
  let fullName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/\b[A-Z]{1,3}[\d-]{7,12}\b/.test(line) && !identification) {
      const match = line.match(/[A-Z]{1,3}[\d-]{7,12}/);
      if (match) identification = match[0];
    }

    if (/^[A-Z\s]{3,}$/.test(line) && line.split(' ').length >= 2 && !fullName) {
      fullName = line;
    }

    if (line.toLowerCase().includes('name') || line.toLowerCase().includes('nombre')) {
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1];
        if (/^[A-Z\s]{3,}$/.test(nextLine)) {
          fullName = nextLine;
        }
      }
    }
  }

  return {
    identification: identification || '',
    fullName: fullName || '',
  };
}