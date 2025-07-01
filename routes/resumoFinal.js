import express from 'express';
import { getResumoFinal } from '../controllers/resumoFinalController.js';
import { exportarResumoExcel } from '../controllers/resumoFinalExcelController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', autenticarToken, getResumoFinal);
router.get('/excel', autenticarToken, exportarResumoExcel);

export default router;
