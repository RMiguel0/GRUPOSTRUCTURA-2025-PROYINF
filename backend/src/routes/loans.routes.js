// Endpoints de préstamos (simulación, solicitudes, etc.).
import { Router } from 'express';
import * as controller from '../controllers/loans.controller.js';

const router = Router();

// Endpoint para simular un préstamo. Calcula el score, riesgo y tasa
// usando los datos del formulario (monto, plazo, ingreso, estado laboral).
router.post('/simulate', controller.simulateLoan);

// Apply for a loan: evaluate and persist. Returns evaluation and saved record if accepted.
router.post('/apply', controller.applyLoan);

// Placeholder para otras rutas futuras (crear solicitud, etc.)
router.get('/placeholder', (_req, res) => res.json({ msg: 'Loans routes ready' }));

export default router;
