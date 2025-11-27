import { Router } from 'express';
import * as controller from '../controllers/loans.controller.js';

const router = Router();

// Ruta de prueba para BCI
router.post('/bci-test', controller.testBciSimulation);

// Deja el placeholder si quieres:
router.get('/placeholder', (_req, res) => res.json({ msg: 'Loans routes ready' }));

export default router;
