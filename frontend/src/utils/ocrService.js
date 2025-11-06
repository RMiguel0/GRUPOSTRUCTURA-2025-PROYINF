// TODO: temporal mientras depuramos env
const BASE = 'http://localhost:3000';

export async function extractTextFromImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const resp = await fetch(`${BASE}/api/ocr`, { method: 'POST', body: fd });
  if (!resp.ok) throw new Error(`OCR ${resp.status}`);
  return await resp.json();
}


