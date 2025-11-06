import express from 'express';
import multer from 'multer';
import vision from '@google-cloud/vision';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Inicializa cliente Vision (usa GOOGLE_APPLICATION_CREDENTIALS del .env)
const client = new vision.ImageAnnotatorClient();

const RUT_REGEX = /(\d{1,2}\.?\d{3}\.?\d{3}-[\dKk])|(\d{7,8}-[\dKk])/g;
const NAME_LINE_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü'·\s]{4,}$/;

// Endpoint principal: /api/ocr
router.post('/ocr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Llama a la API de Google Vision
    const [result] = await client.textDetection({ image: { content: req.file.buffer } });
    const text = result?.fullTextAnnotation?.text || '';

    // --- Parseo básico de RUT y nombre ---
    let rut = '';
    const rutMatch = text.match(RUT_REGEX);
    if (rutMatch) rut = rutMatch[0];

    let fullName = '';
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (NAME_LINE_RE.test(trimmed) && trimmed.split(' ').length >= 2) {
        fullName = trimmed;
        break;
      }
    }

    res.json({
      identification: rut || '',
      fullName: fullName || '',
      rawText: text,
    });
  } catch (err) {
    console.error('OCR error:', err);
    res.status(500).json({ error: 'Error procesando la imagen' });
  }
});

export default router;
