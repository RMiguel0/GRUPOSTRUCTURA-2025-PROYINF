// src/utils/ocrService.js
import Tesseract from 'tesseract.js';

/** ---------- Helpers RUT ---------- **/
export function formatRut(raw = '') {
  const s = raw.replace(/[.\s]/g, '').toUpperCase();
  const m = s.match(/^(\d{1,8})([-]?)([\dK])$/i);
  if (!m) return raw;
  const cuerpo = m[1];
  const dv = m[3].toUpperCase();
  // agregar puntos
  let withDots = '';
  let c = cuerpo;
  while (c.length > 3) {
    withDots = '.' + c.slice(-3) + withDots;
    c = c.slice(0, -3);
  }
  withDots = c + withDots;
  return `${withDots}-${dv}`;
}

export function validateRut(rutRaw = '') {
  const clean = rutRaw.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
  const match = clean.match(/^(\d{1,8})-([\dK])$/);
  if (!match) return false;
  const cuerpo = match[1];
  const dv = match[2];

  // algoritmo módulo 11
  let suma = 0, multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = suma % 11;
  const dvCalc = 11 - resto;
  const dvEsperado = (dvCalc === 11) ? '0' : (dvCalc === 10 ? 'K' : String(dvCalc));
  return dv === dvEsperado;
}

/** ---------- Preproceso de imagen para mejorar OCR ---------- **/
export async function preprocessImage(imageFile, {
  maxWidth = 1600,
  maxHeight = 1600,
  contrast = 1.2,
  brightness = 0
} = {}) {
  const imgBitmap = await createImageBitmap(imageFile);
  let { width, height } = imgBitmap;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgBitmap, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    // grayscale
    const r = data[i], g = data[i+1], b = data[i+2];
    let gray = 0.299*r + 0.587*g + 0.114*b;
    gray = (gray - 128) * contrast + 128 + brightness;
    gray = Math.max(0, Math.min(255, gray));
    data[i] = data[i+1] = data[i+2] = gray;
  }
  ctx.putImageData(imgData, 0, 0);

  return await new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.92);
  });
}

/** ---------- OCR con Tesseract (spa/eng y PSM ajustable) ---------- **/
export async function extractTextFromImage(imageFile, {
  lang = 'spa',
  psm = 6,
  whitelist = null,
  langPath // opcional: ruta custom a traineddata
} = {}) {
  const pre = await preprocessImage(imageFile);
  const workerOptions = {};
  if (langPath) workerOptions.langPath = langPath;

  const result = await Tesseract.recognize(pre, lang, {
    logger: () => {},
    tessedit_pageseg_mode: psm,
    ...(whitelist ? { config: [`tessedit_char_whitelist ${whitelist}`] } : {}),
    ...workerOptions
  });
  return result; // { data: { text, words, lines, ... } }
}

/** ---------- Parsing específico Cédula chilena ---------- **/
const RUT_REGEX = /(\d{1,2}\.?\d{3}\.?\d{3}-[\dKk])|(\d{7,8}-[\dKk])/g;
const NAME_LINE_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü'·\s]{4,}$/;

const normalizeRut = (s='') =>
  (s.replace(/\s+/g, '').replace(/\./g, '').toUpperCase().match(/(\d{7,8}-[\dK])/) || [s])[0];

export function parseCedulaChile(ocrResult) {
  const data = ocrResult?.data || {};
  const lines = (data.lines || []).map(l => ({
    text: (l.text || '').trim(),
    bbox: l.bbox || { x0: l.x0, y0: l.y0, x1: l.x1, y1: l.y1 },
    conf: l.confidence ?? null,
    words: l.words || []
  }));
  const words = (data.words || []).map(w => ({
    text: (w.text || '').trim(),
    bbox: { x0: w.bbox?.x0 ?? w.x0, y0: w.bbox?.y0 ?? w.y0, x1: w.bbox?.x1 ?? w.x1, y1: w.bbox?.y1 ?? w.y1 },
    conf: w.confidence ?? w.conf ?? null
  }));
  const rawText = data.text || '';

  let rut = '';
  let fullName = '';

  // 1) Intento por etiqueta “RUT/RUN”
  const rutLabels = words.filter(w => /^(R\.?U\.?T\.?|R\.?U\.?N\.?|RUT|RUN)$/i.test(w.text.replace(/\s/g,'')));
  if (rutLabels.length) {
    const L = rutLabels[0];
    const cx1 = (L.bbox.x0 + L.bbox.x1)/2, cy1 = (L.bbox.y0 + L.bbox.y1)/2;
    const nearest = words
      .filter(w => w !== L)
      .map(w => {
        const cx2 = (w.bbox.x0 + w.bbox.x1)/2, cy2 = (w.bbox.y0 + w.bbox.y1)/2;
        return { t: w.text, d: Math.hypot(cx2-cx1, cy2-cy1) };
      })
      .sort((a,b)=>a.d-b.d)
      .slice(0, 6)
      .map(x=>x.t)
      .join(' ');
    const m = nearest.match(RUT_REGEX);
    if (m) rut = normalizeRut(m[0]);
  }

  // 2) Fallback: regex en todo el texto
  if (!rut) {
    const m = rawText.match(RUT_REGEX);
    if (m) rut = normalizeRut(m[0]);
  }

  // 3) Nombre por etiqueta “NOMBRE/NOMBRES/NAME”
  const nameLabelIdx = lines.findIndex(l => /NOMBRE|NOMBRES|NAME/i.test(l.text));
  if (nameLabelIdx >= 0) {
    // misma línea: “NOMBRE: JUAN PEREZ”
    const inline = lines[nameLabelIdx].text.match(/NOMBRE[:\s\-]*([A-Za-zÁÉÍÓÚáéíóúÑñÜü'·\s]{3,})/i);
    if (inline) fullName = inline[1].trim();
    // siguiente línea
    if (!fullName && nameLabelIdx + 1 < lines.length) {
      const cand = lines[nameLabelIdx + 1].text;
      if (NAME_LINE_RE.test(cand) && cand.split(/\s+/).length >= 2) fullName = cand.trim();
    }
  }

  // 4) Fallback: mejor línea con pinta de nombre (2–5 palabras; no contenga etiquetas típicas)
  if (!fullName) {
    for (const l of lines) {
      const wordsCount = l.text.split(/\s+/).filter(Boolean).length;
      if (wordsCount >= 2 && wordsCount <= 5 && NAME_LINE_RE.test(l.text)) {
        if (!/RUT|RUN|FECHA|NACIM|N°|NUM|DOMICILIO|DIREC|SEXO/i.test(l.text)) {
          fullName = l.text.trim();
          break;
        }
      }
    }
  }

  // limpieza
  const sanitize = (s='') => s.replace(/[|]/g,'I').replace(/[^A-Za-z0-9ÁÉÍÓÚÑñÜü\-\s\.,]/g,'').trim();
  if (fullName) fullName = sanitize(fullName);
  if (rut) rut = sanitize(rut);

  return {
    rut,
    fullName,
    rawText,
    confidence: (data.words || []).reduce((a,b)=>a+(b.confidence||0),0) / Math.max(1,(data.words||[]).length)
  };
}

/** ---------- Wrapper antiguo para compatibilidad ---------- **/
export function parsePassportData(text) {
  // Mantener por compatibilidad si ya lo usas en otro lado
  // Aquí solo extraemos RUT y nombre simple como respaldo mínimo:
  let identification = '';
  const m = text.match(RUT_REGEX);
  if (m) identification = normalizeRut(m[0]);
  const fullName = (text.split('\n').map(s=>s.trim()).find(s => NAME_LINE_RE.test(s) && s.split(/\s+/).length>=2)) || '';
  return { identification, fullName };
}
