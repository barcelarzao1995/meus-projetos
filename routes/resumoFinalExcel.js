import express from 'express';
import { exportarResumoExcel } from '../controllers/resumoFinalExcelController.js';
import { autenticarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/excel', autenticarToken, exportarResumoExcel);

export default router;