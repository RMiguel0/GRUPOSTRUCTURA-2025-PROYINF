// Router raíz: monta subrutas (e.g., /loans).
import { Router } from 'express';
import loansRouter from './loans.routes.js';

const router = Router();
router.use('/loans', loansRouter);

export default router;
