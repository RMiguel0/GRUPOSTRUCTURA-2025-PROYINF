import express from 'express';
import multer from 'multer';
import vision from '@google-cloud/vision';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Inicializa cliente Vision (usa GOOGLE_APPLICATION_CREDENTIALS del .env)
const client = new vision.ImageAnnotatorClient();

// ---------------- Helpers: RUT y Nombre ----------------
function isValidRut(body, dv) {
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? '0' : res === 10 ? 'K' : String(res);
  return dvCalc === dv.toUpperCase();
}

function findRutInfo(rawText = '') {
  const lines = rawText.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
  const joined = lines.join('\n').replace(/\./g, '');
  const m = joined.match(/(?:RUT|RUN)?\s*[:#-]?\s*(\d{7,8})[-\s]?([0-9kK])/);
  if (!m) return { rut: '', index: -1, lines };

  const body = m[1], dv = m[2].toUpperCase();
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const rut = isValidRut(body, dv) ? `${withDots}-${dv}` : '';

  // ubica la línea exacta donde aparece el RUT (sin puntos)
  const rawRut = `${body}-${dv}`;
  const idx = lines.findIndex(l => l.replace(/\./g, '').includes(rawRut));

  return { rut, index: idx, lines };
}

function guessFullName(rawText = '', hintIndex = -1, linesArg) {
  // normaliza a MAYÚSCULAS con espacios simples
  const lines = (linesArg ?? rawText.split(/\r?\n+/))
    .map(s => s.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .map(s => s.toUpperCase());

  const STOP = new Set([
    'CHILE','CÉDULA','DE','IDENTIDAD','REPÚBLICA','SERVICIO','REGISTRO','CIVIL',
    'E','IDENTIFICACIÓN','FIRMA','DEL','TITULAR','SEXO','NACIONALIDAD','FECHA',
    'NACIMIENTO','VÁLIDA','HASTA','EMISIÓN','RUN','RUT','Nº','N°','NUMERO','NÚMERO',
    'DOCUMENTO','CARNET','CI','CEDULA','IDENTIFICACION','PAIS','PAÍS'
  ]);

  // palabras que suelen ser OCR basura para "CHILE"
  const NOISE_WORDS = /(CH?I?LE|HILE|CHECHILE|CLILE)/;

  const isNameLike = (l) => {
    if (!l) return false;
    if (/\d/.test(l)) return false;           // sin dígitos
    if (l.length < 3) return false;
    // elimina stopwords sueltas
    const words = l.split(' ').filter(Boolean);
    const kept = words.filter(w => !STOP.has(w) && !NOISE_WORDS.test(w));
    if (kept.length === 0) return false;
    // al menos 2 tokens totales tras limpieza
    return kept.join(' ').trim().split(/\s+/).length >= 1;
  };

  const extractAfterLabel = (label) => {
    // busca línea que sea exactamente el label (permitimos variantes)
    const idx = lines.findIndex(l => l.replace(/\s+/g,' ') === label);
    if (idx === -1) return '';
    // toma 1–2 líneas siguientes que parezcan nombre/apellido
    const collected = [];
    for (let i = idx + 1; i < Math.min(lines.length, idx + 3); i++) {
      const txt = lines[i];
      if (isNameLike(txt)) collected.push(
        txt.split(' ').filter(w => !STOP.has(w) && !NOISE_WORDS.test(w)).join(' ')
      );
    }
    return collected.join(' ').trim();
  };

  // 1) Estrategia principal: usar rótulos
  const nombres = extractAfterLabel('NOMBRES');
  const apellidos = extractAfterLabel('APELLIDOS');

  if (nombres && apellidos) {
    return `${nombres} ${apellidos}`.replace(/\s+/g, ' ').trim();
  }
  if (nombres) return nombres;
  if (apellidos) return apellidos;

  // 2) Fallback: ventana alrededor del RUT si tenemos hint
  if (typeof hintIndex === 'number' && hintIndex >= 0) {
    const from = Math.max(0, hintIndex - 4);
    const to = Math.min(lines.length - 1, hintIndex + 4);
    const window = [];
    for (let i = from; i <= to; i++) {
      const l = lines[i];
      if (isNameLike(l)) {
        window.push(l.split(' ').filter(w => !STOP.has(w) && !NOISE_WORDS.test(w)).join(' '));
      }
    }
    if (window.length) return window.join(' ').replace(/\s+/g,' ').trim();
  }

  // 3) Última chance: mejor candidato global
  const all = lines
    .map(l => isNameLike(l) ? l.split(' ').filter(w => !STOP.has(w) && !NOISE_WORDS.test(w)).join(' ') : '')
    .filter(Boolean);

  return all.join(' ').replace(/\s+/g,' ').trim();
}



// ---------------- Endpoint: /api/ocr ----------------
router.post('/ocr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Google Vision OCR
    const [result] = await client.textDetection({ image: { content: req.file.buffer } });
    const rawText = result?.fullTextAnnotation?.text || '';

    // Post-procesamiento
    const { rut: identification, index: rutIndex, lines } = findRutInfo(rawText);
    const fullName = guessFullName(rawText, rutIndex, lines);

    let linesDbg = [];
    if (typeof rutIndex === 'number' && rutIndex >= 0 && Array.isArray(lines)) {
      const from = Math.max(0, rutIndex - 3);
      const to = Math.min(lines.length - 1, rutIndex + 3);
      linesDbg = lines.slice(from, to + 1);
    }
    console.log('[OCR window]', { rutIndex, linesDbg });

    return res.json({ identification, fullName, rawText, linesDbg });
  } catch (err) {
    console.error('OCR error:', err);
    return res.status(500).json({ error: 'Error procesando la imagen' });
  }
});

export default router;
