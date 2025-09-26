// Endpoints de préstamos (simulación, solicitudes, etc.).
import { Router } from 'express';
import * as controller from '../controllers/loans.controller.js';

const router = Router();

// Ejemplos de rutas (implementa en controllers/ cuando estés listo)
// router.post('/simulate', controller.simulateLoan);
// router.post('/applications', controller.createApplication);
// router.get('/applications/:id', controller.getApplicationById);

router.get('/placeholder', (_req, res) => res.json({ msg: 'Loans routes ready' }));

export default router;
